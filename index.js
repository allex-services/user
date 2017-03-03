function createServicePack(execlib){
  'use strict';

  return {
    service: {
      dependencies: ['.', 'allex:timer:lib']
    },
    sinkmap: {
      dependencies: ['.']
    }
  };
}

module.exports = createServicePack;
