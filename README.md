# cycle-resize

A readonly driver for window resize events, for Cycle.js

## Installation

```
npm i cycle-resize --save
```

## API

### makeResizeDriver

A factory that returns a `ResizeDriver()` function to be called by `@cycle/run` `run()`.

Once called, the `ResizeDriver()` returns a `ResizeSource`.

Its `resize$` attribute is a stream of `ResizeEvent`:

```javascript
interface ResizeEvent {
  deltaX: number;
  deltaY: number;
}
```

Example:

```javascript
import { run } from '@cycle/run';
import { makeResizeDriver } from 'cycle-resize';

function main(sources) {
  const {
    resizeSource: { resize$ }
  } = sources;
  // Do something with resize$
}

const drivers = {
  resizeSource: makeResizeDriver()
};

run(main, drivers);
```

### mockResizeSource

A function that returns a mocked `ResizeSource`, the stream of `ResizeEvent`
beeing provided as input.

Example:

```javascript
import { describe, it } from 'mocha';
import { mockResizeSource } from 'cycle-resize';
import { mockTimeSource } from '@cycle/time';

describe('Test of myFunction()', function() {
  it('should do something with the ResizeSource provided as input', function(done) {
    const Time = mockTimeSource();
    const resizeSource = mockResizeSource(
      Time.diagram('-a--b-', {
        a: {
          deltaX: 250,
          deltaY: 0
        },
        b: {
          deltaX: 0,
          deltaY: -150
        }
      })
    );
    const expected$ = Time.diagram('-i--j-', {
      i: { result: 'something' },
      j: { result: 'something else' }
    });
    Time.assertEqual(myFunction({ timeSource: Time, resizeSource }), expected$);
    Time.run(done);
  });
});
```

### Parameters

- `diagram` A stream of `ResizeEvent`
