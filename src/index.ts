import { Stream, Listener, Producer } from 'xstream';
import pairwise from 'xstream/extra/pairwise';
import { adapt } from '@cycle/run/lib/adapt';

interface RawResizeEvent {
  width: number;
  height: number;
}

class ResizeProducer implements Producer<RawResizeEvent> {
  listener: (event: UIEvent) => any;

  start(listener: Listener<RawResizeEvent>) {
    this.listener = (event: UIEvent) => {
      listener.next({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    window.addEventListener('resize', this.listener);
  }

  stop() {
    window.removeEventListener('resize', this.listener);
  }
}

export interface ResizeEvent {
  deltaX: number;
  deltaY: number;
}

export class ResizeSource {
  resize$: Stream<ResizeEvent>;

  constructor() {
    const nativeResize$ = Stream.create(new ResizeProducer());
    const deltaResize$ = nativeResize$.compose(pairwise).map(computeResizeEvent);
    this.resize$ = adapt(deltaResize$);

    function computeResizeEvent([from, to]: [RawResizeEvent, RawResizeEvent]) {
      return {
        deltaX: to.width - from.width,
        deltaY: to.height - from.height
      };
    }
  }
}

/**
 * A factory that returns a `ResizeDriver()` function to be called by `@cycle/run` `run()`.
 *
 * Once called, the `ResizeDriver()` returns a `ResizeSource`.
 *
 * Its `resize$` attribute is a stream of `ResizeEvent`:
 *
 * ```javascript
 * interface ResizeEvent {
 *   deltaX: number;
 *   deltaY: number;
 * }
 * ```
 *
 * Example:
 * ```javascript
 * import { run } from "@cycle/run";
 * import { makeResizeDriver } from "cycle-lazy-load";
 *
 * function main(sources) {
 *   const { resizeSource: { resize$ } } = sources;
 *   // Do something with resize$
 * }
 *
 * const drivers = {
 *   resizeSource: makeResizeDriver()
 * };
 *
 * run(main, drivers);
 * ```
 */
export function makeResizeDriver(): () => ResizeSource {
  return function ResizeDriver() {
    return new ResizeSource();
  };
}

export class MockedResizeSource extends ResizeSource {
  constructor(diagram: Stream<ResizeEvent>) {
    super();
    this.resize$ = diagram;
  }
}

/**
 * A function that returns a mocked `ResizeSource`, the stream of `ResizeEvent`
 * beeing provided as input.
 *
 * Example:
 * ```javascript
 * import { describe, it } from "mocha";
 * import { mockResizeSource } from "cycle-lazy-load";
 * import { mockTimeSource } from "@cycle/time";
 *
 * describe("Test of myFunction()", function() {
 *   it("should do something with the ResizeSource provided as input", function(done) {
 *     const Time = mockTimeSource();
 *     const resizeSource = mockResizeSource(
 *       Time.diagram("-a--b-", {
 *         a: {
 *           deltaX: 250,
 *           deltaY: 0
 *         },
 *         b: {
 *           deltaX: 0,
 *           deltaY: -150
 *         }
 *       })
 *     );
 *     const expected$ = Time.diagram("-i--j-", {
 *       i: { result: "something" },
 *       j: { result: "something else" }
 *     });
 *     Time.assertEqual(myFunction({ timeSource: Time, resizeSource }), expected$);
 *     Time.run(done);
 *   });
 * });
 * ```
 * @param diagram A stream of `ResizeEvent`
 */
export function mockResizeSource(diagram: Stream<ResizeEvent>): MockedResizeSource {
  return new MockedResizeSource(diagram);
}
