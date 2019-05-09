function delay() {
    return new Promise(resolve => setTimeout(resolve, 300));
  }
  
  async function delayedLog(item) {
    // notice that we can await a function
    // that returns a promise
    await delay();
    console.log(item);
  }

  async function processArray(array) {
    for (const item of array) {
      await delayedLog(item);
    }
    console.log('Done!');
  }
  async function processArray(array) {
    // map array to promises
    const promises = array.map(delayedLog);
    // wait until all promises are resolved
    await Promise.all(promises);
    console.log('Done!');
  }
  
  processArray([1, 2, 3]);