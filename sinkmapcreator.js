function sinkMapCreator(execlib,ParentSinkMap){
  'use strict';
  var sinkmap = new (execlib.lib.Map);
  if (!execlib.execSuite.userServiceSuite) {
    execlib.execSuite.userServiceSuite = {
      nameOfRemoteSinkDescriptor: require('./userapi/nameofremotesinkdescriptorcreator')(execlib)
    };
  }
  /*
  if (!execlib.execSuite.userServiceSuite) {
    execlib.execSuite.userServiceSuite = require('./userapi')(execlib);
  }
  */

  sinkmap.add('service',require('./sinks/servicesinkcreator')(execlib,ParentSinkMap.get('service')));
  sinkmap.add('user',require('./sinks/usersinkcreator')(execlib,ParentSinkMap.get('user')));
  
  return sinkmap;
}

module.exports = sinkMapCreator;
