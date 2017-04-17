function createServicePack(execlib){
  'use strict';

  return {
    service: {
      dependencies: ['.', 'allex:httpresponsefile:lib', 'allex:timer:lib']
    },
    sinkmap: {
      dependencies: ['.']
    }
  };
}

module.exports = createServicePack;
