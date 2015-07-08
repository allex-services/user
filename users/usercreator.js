function createUser(execlib,ParentUser){
  'use strict';
  var lib = execlib.lib,
    execSuite = execlib.execSuite,
    taskRegistry = execSuite.taskRegistry;

  if(!ParentUser){
    ParentUser = execlib.execSuite.ServicePack.Service.prototype.userFactory.get('user');
  }

  function User(prophash){
    console.trace();
    console.log('WHO MADE ME?');
    ParentUser.call(this,prophash);
    this.fillState(prophash.profle);
    lib.traverse(this.remoteSinkInfo, this.startConsuming.bind(this));
  }
  ParentUser.inherit(User,require('../methoddescriptors/user'),[/*visible state fields here*/]/*or a ctor for StateStream filter*/,require('../remotesinkinfo/user'));
  function injector(obj, item, itemname) {
    obj[itemname] = item;
  }
  function inheritRemoteSinkInfo(crsi, prsi) { //crsi => child remote sink info, ditto for parent
    var ret = {};
    var inject = injector.bind(null, ret);
    lib.traverse(prsi, inject);
    lib.traverse(crsi, inject);
    return ret;
  }
  User.inherit = function (userChildCtor, methodDescriptors, stateFilterCtor, remoteSinkInfo) {
    if(!remoteSinkInfo){
      throw new lib.Error('NOT_A_USERSERVICE_USER_INHERIT',"A subclass of UserService's user role User did not provide the remoteSinkInfo to inherit as a 4th parameter");
    }
    ParentUser.inherit.call(this, userChildCtor, methodDescriptors, stateFilterCtor);
    userChildCtor.prototype.remoteSinkInfo = inheritRemoteSinkInfo(remoteSinkInfo, this.prototype.remoteSinkInfo);
  };
  User.prototype.__cleanUp = function(){
    ParentUser.prototype.__cleanUp.call(this);
  };
  User.prototype.onSinkFound = function(sinkname,sink){
    var sinkspecs = this.remoteSinkInfo[sinkname];
    if (!sinkspecs) {
      var e = new lib.Error('SINK_INFO_MISSING','Missing remoteSinkInfo entry for '+sinkname);
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
