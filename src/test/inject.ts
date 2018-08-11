import { makeResizeDriver } from '..';

const resizeDriver = makeResizeDriver();
const { resize$ } = resizeDriver();

resize$.addListener({
  next: function(resizeEvent) {
    console.log(`{ "deltaX": ${resizeEvent.deltaX}, "deltaY": ${resizeEvent.deltaY} }`);
  }
});
