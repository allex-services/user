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

  UserSink.inherit = function (childSinkCtor, methodDescriptors, sinkInfo) {
    if(!sinkInfo){
      throw new lib.Error('NOT_A_USERSERVICE_USERSINK_INHERIT',"A subclass of UserService's UserSink did not provide the sinkInfo to inherit as a 3rd parameter");
    }
    ParentSink.inherit.call(this, childSinkCtor, methodDescriptors);
    childSinkCtor.prototype.sinkInfo = arrymerger(sinkInfo, this.prototype.sinkInfo);
  };
  UserSink.prototype.sinkInfo = [];
  return UserSink;
}

module.exports = createUserSink;
