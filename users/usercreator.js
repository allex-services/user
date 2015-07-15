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
    this.fillState(prophash.profle);
    lib.traverse(this.sinkInfo, this.startConsuming.bind(this));
  }
  ParentUser.inherit(User,require('../methoddescriptors/user'),[/*visible state fields here*/]/*or a ctor for StateStream filter*/);
  User.prototype.__cleanUp = function(){
    ParentUser.prototype.__cleanUp.call(this);
  };
  User.prototype.onSinkFound = function(sinkname,sink){
    var sinkspecs = this.sinkInfo.remote[sinkname];
    if (!sinkspecs) {
      var e = new lib.Error('SINK_INFO_MISSING','Missing sinkInfo.remote entry for '+sinkname);
      e.sinkname = sinkname;
      throw e;
    }
    console.log('Something should be done with',sinkspecs,'for',sinkname);
  };
  User.prototype.startConsuming = function (remotesinkspec, remotesinkname) {
    var identity = remotesinkspec.identity || {},
      prophash = remotesinkspec.propertyhash || {};
    identity.name = this.get('name');
    identity.role = identity.role || 'user';
    taskRegistry.run('findSink', {
      sinkname: remotesinkname,
      identity: identity,
      propertyhash: prophash,
      onSink: this.onSinkFound.bind(this, remotesinkname)
    });
  };
  require('./common')(execlib,User);

  return User;
}

module.exports = createUser;
