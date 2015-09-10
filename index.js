function createServicePack(execlib){
  'use strict';
  var execSuite = execlib.execSuite,
    ParentServicePack = execSuite.registry.get('.');

 execSuite.userServiceSuite = require('./userapi')(execlib);

  var ret = require('./clientside')(execlib, ParentServicePack);
  ret.Service = require('./servicecreator')(execlib,ParentServicePack);
  return ret;
}

module.exports = createServicePack;
