function createServicePack(execlib){
  'use strict';

  return {
    service: {
      dependencies: ['.', 'allex_httpresponsefilelib', 'allex_timerlib']
    },
    sinkmap: {
      dependencies: ['.']
    }
  };
}

module.exports = createServicePack;
