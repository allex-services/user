function createUserService(execlib,ParentServicePack){
  'use strict';
  var ParentService = ParentServicePack.Service;

  function factoryCreator(parentFactory){
    return {
      'service': require('./users/serviceusercreator')(execlib,parentFactory.get('service')),
      'user': require('./users/usercreator')(execlib,parentFactory.get('user')) 
    };
  }

  function UserService(prophash){
    ParentService.call(this,prophash);
  }
  ParentService.inherit(UserService,factoryCreator);
  UserService.prototype.__cleanUp = function(){
    ParentService.prototype.__cleanUp.call(this);
  };
  
  return UserService;
}

module.exports = createUserService;
