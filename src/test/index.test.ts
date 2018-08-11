import { describe, it } from 'mocha';
import { ResizeEvent } from '..';
import * as phantom from 'phantom';
import * as assert from 'assert';

/**
 * The test proceeds as follow:
 * - Launch a headless page in Phantom
 * - Inject a javascript (resize-inject.js) that subscribes to resize-events
 *   thanks to the resize driver and logs in the console
 * - Compare this output to what is expected
 */
describe('Test of the resize driver', function() {
  it('should return a stream of resize events', function(done) {
    this.timeout(5000);

    (async function() {
      // GIVEN
      const instance = await phantom.create();
      const page = await instance.createPage();

      const actual: ResizeEvent[] = [];

      page.on('onConsoleMessage', function(message, _, __) {
        actual[actual.length] = JSON.parse(message);
      });

      await page.open('about:blank');
      await page.injectJs('./src/test/inject-bundle.js');

      // WHEN
      await page.property('viewportSize', {
        width: 1200,
        height: 800
      });
      await page.property('viewportSize', {
        width: 1300,
        height: 800
      });
      await page.property('viewportSize', {
        width: 1200,
        height: 800
      });
      await page.property('viewportSize', {
        width: 1200,
        height: 900
      });
      await page.property('viewportSize', {
        width: 1200,
        height: 800
      });
      await page.property('viewportSize', {
        width: 1300,
        height: 700
      });

      await instance.exit();

      // THEN
      const expected: ResizeEvent[] = [
        {
          deltaX: 100,
          deltaY: 0
        },
        {
          deltaX: -100,
          deltaY: 0
        },
        {
          deltaX: 0,
          deltaY: 100
        },
        {
          deltaX: 0,
          deltaY: -100
        },
        {
          deltaX: 100,
          deltaY: -100
        }
      ];

      const isDeepEqual: boolean = JSON.stringify(actual) === JSON.stringify(expected);
      assert.equal(isDeepEqual, true);

      done();
    })();
  });
});
