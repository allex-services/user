function createNameOfRemoteDescptorFunc(execlib) {
  'use strict';
  var lib = execlib.lib;
  return function nameOfRemoteSinkDescriptor (sinkinfo) {
    if (lib.isArray(sinkinfo.name)) {
      return sinkinfo.alias || sinkinfo.name[sinkinfo.name.length-1];
    }
    if (!sinkinfo.name) {
      console.error(sinkinfo);
      throw new lib.Error('NO_LOCAL_SUBSINK_NAME');
    }

    return sinkinfo.alias || sinkinfo.name;
  }
}

module.exports = createNameOfRemoteDescptorFunc;
