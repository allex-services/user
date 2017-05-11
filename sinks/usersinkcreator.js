var arrayoperationscreator = require('allex_arrayoperationslowlevellib');
function createUserSink(execlib,ParentSink){
  'use strict';
  var lib = execlib.lib,
    arrayOperations = arrayoperationscreator(lib.extend, lib.readPropertyFromDotDelimitedString, lib.isFunction, lib.Map, lib.AllexJSONizingError);

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

  function sinkNameName (sinkname) {
    if (lib.isString(sinkname)){
      return sinkname;
    }
    if (lib.isArray(sinkname)) {
      return sinkname[sinkname.length-1];
    }
  }
  UserSink.inherit = function (childSinkCtor, methodDescriptors, localsinknamearry, remotesinknamearry) {
    if(!localsinknamearry){
      throw new lib.Error('NOT_A_USERSERVICE_USERSINK_INHERIT',"A subclass of UserService's UserSink did not provide the local sink name array to inherit as a 3rd parameter");
    }
    ParentSink.inherit.call(this, childSinkCtor, methodDescriptors);
    childSinkCtor.prototype.localSinkNames = arrayOperations.unionObjects(this.prototype.localSinkNames, localsinknamearry, 'name', sinkNameName);
    if (!lib.isArray(remotesinknamearry)) {
      throw new lib.Error('NEW_INHERIT_FINGERPRINT_FOR_USERSINK', 'Missing the remotesinknamearray');
    }
    childSinkCtor.prototype.remoteSinkNames = arrayOperations.unionObjects(this.prototype.remoteSinkNames, remotesinknamearry, 'name', sinkNameName);
    //console.log('finally', childSinkCtor.prototype.localSinkNames, childSinkCtor.prototype.remoteSinkNames);
  };
  UserSink.prototype.localSinkNames = [];
  UserSink.prototype.remoteSinkNames = [];
  return UserSink;
}

module.exports = createUserSink;
