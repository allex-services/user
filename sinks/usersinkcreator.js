function createUserSink(execlib,ParentSink){
  'use strict';
  var lib = execlib.lib,
    arrymerger = require('../arraymerger')(execlib);

  if(!ParentSink){
    ParentSink = execlib.execSuite.registry.get('.').SinkMap.get('user');
  }

  function UserSink(prophash,client){
    ParentSink.call(this,prophash,client);
    //that's it
  }
  ParentSink.inherit(UserSink,require('../methoddescriptors/user'));
  UserSink.prototype.__cleanUp = function(){
    ParentSink.prototype.__cleanUp.call(this);
  };

  /*
  UserSink.inherit = function (childSinkCtor, methodDescriptors, sinkInfo, remotesinknamearry) {
    if(!sinkInfo){
      throw new lib.Error('NOT_A_USERSERVICE_USERSINK_INHERIT',"A subclass of UserService's UserSink did not provide the sinkInfo to inherit as a 3rd parameter");
    }
    ParentSink.inherit.call(this, childSinkCtor, methodDescriptors);
    childSinkCtor.prototype.sinkInfo = arrymerger(sinkInfo, this.prototype.sinkInfo);
    if (!lib.isArray(remotesinknamearry)) {
      throw new lib.Error('NEW_INHERIT_FINGERPRINT_FOR_USERSINK', 'Missing the remotesinknamearray');
    }
    childSinkCtor.prototype.remoteSinkNames = lib.arryOperations.union(remotesinknamearry, this.prototype.remoteSinkNames);
  };
  UserSink.prototype.sinkInfo = [];
  */
  UserSink.inherit = function (childSinkCtor, methodDescriptors, localsinknamearry, remotesinknamearry) {
    if(!localsinknamearry){
      throw new lib.Error('NOT_A_USERSERVICE_USERSINK_INHERIT',"A subclass of UserService's UserSink did not provide the local sink name array to inherit as a 3rd parameter");
    }
    ParentSink.inherit.call(this, childSinkCtor, methodDescriptors);
    childSinkCtor.prototype.localSinkNames = lib.arryOperations.union(localsinknamearry, this.prototype.localSinkNames);
    if (!lib.isArray(remotesinknamearry)) {
      throw new lib.Error('NEW_INHERIT_FINGERPRINT_FOR_USERSINK', 'Missing the remotesinknamearray');
    }
    childSinkCtor.prototype.remoteSinkNames = lib.arryOperations.union(remotesinknamearry, this.prototype.remoteSinkNames);
  };
  UserSink.prototype.localSinkNames = [];
  UserSink.prototype.remoteSinkNames = [];
  return UserSink;
}

module.exports = createUserSink;
