function createUser(execlib,ParentUser){
  'use strict';
  var lib = execlib.lib,
    qlib = lib.qlib,
    execSuite = execlib.execSuite,
    taskRegistry = execSuite.taskRegistry;

  if(!ParentUser){
    ParentUser = execlib.execSuite.ServicePack.Service.prototype.userFactory.get('user');
  }

  function User(prophash){
    ParentUser.call(this,prophash);
  }
  ParentUser.inherit(User,require('../methoddescriptors/user'),['profile_role']);
  User.prototype.__cleanUp = function(){
    ParentUser.prototype.__cleanUp.call(this);
  };

  User.prototype.askForRemote = function (sinkname, prophash, defer) {
    qlib.promise2defer(this.__service.askForRemote(sinkname, prophash), defer);
  };

  User.prototype.disposeOfRemote = function (sinkname, defer) {
    this.__service.disposeOfRemote(sinkname, defer);
  };

  User.prototype.readData = function (subservicename, filter, defer) {
    if (!this.__service) {
      defer.reject(new lib.Error('SERVICE_DOWN', 'Service is down'));
      return;
    }
    this.__service.readData(subservicename, filter, defer);
  };

  User.prototype.updateProfile = function (data, defer) {
    this.__service.updateProfile(data, defer);
  };

  User.prototype.changePassword = function (old_password, new_password, defer){
    this.__service.changePassword(old_password, new_password, defer);
  };

  User.prototype.validateCredentials = function (credentials, defer) {
    this.__service.validateCredentials (credentials, defer);
  };

  require('./common')(execlib,User);

  return User;
}

module.exports = createUser;
