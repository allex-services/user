function createClientSide(execlib, ParentServicePack){
  if (!execlib.execSuite.userServiceSuite) {
    execlib.execSuite.userServiceSuite = {
      nameOfRemoteSinkDescriptor: require('./userapi/nameofremotesinkdescriptorcreator')(execlib)
    };
  }
  return {
    SinkMap: require('./sinkmapcreator')(execlib,ParentServicePack)
  };
}

module.exports = createClientSide;
