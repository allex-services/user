function createUser(execlib,ParentUser){
  'use strict';
  var lib = execlib.lib,
    execSuite = execlib.execSuite,
    taskRegistry = execSuite.taskRegistry;

  if(!ParentUser){
    ParentUser = execlib.execSuite.ServicePack.Service.prototype.userFactory.get('user');
  }

  function User(prophash){
    ParentUser.call(this,prophash);
  }
  ParentUser.inherit(User,require('../methoddescriptors/user'),[/*visible state fields here*/]/*or a ctor for StateStream filter*/);
  User.prototype.__cleanUp = function(){
    ParentUser.prototype.__cleanUp.call(this);
  };

  User.prototype.askForRemote = function (sinkname, prophash, defer) {
    this.__service.askForRemote(sinkname, prophash, defer);
  };

  User.prototype.disposeOfRemote = function (sinkname, defer) {
    this.__service.disposeOfRemote(sinkname, defer);
  };
  require('./common')(execlib,User);

  return User;
}

module.exports = createUser;
