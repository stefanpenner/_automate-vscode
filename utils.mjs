import {
  setTimeout,
} from 'timers/promises';

export async function retryAssertion(fn, COUNT = 10, ms = 100) {
  let count = 0;

  await (async function next() {
    try {
      await fn();
    } catch (e) {
      if (typeof e === 'object' && e !== null && e.name === 'AssertionError') {
        count++;
        if (COUNT < count) {
          throw e;
        } else {
          await setTimeout(next, ms)
        }
      } else {
        throw e;
      }
    }
  })();
}
