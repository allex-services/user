function createUser(execlib,ParentUser){
  var execSuite = execlib.execSuite,
      taskRegistry = execSuite.taskRegistry;

  if(!ParentUser){
    ParentUser = execlib.execSuite.ServicePack.Service.prototype.userFactory.get('user');
  }

  function User(prophash){
    ParentUser.call(this,prophash);
    this.fillState(prophash);
  }
  ParentUser.inherit(User,require('../methoddescriptors/user'),[/*visible state fields here*/]/*or a ctor for StateStream filter*/);
  User.prototype.__cleanUp = function(){
    ParentUser.prototype.__cleanUp.call(this);
  };
  User.prototype.onSinkFound = function(defer,sinkname,sink){
    defer.resolve(sink);
    this.__service._onStaticallyStartedSubService(defer,sinkname,sink);
  };
  User.prototype.startConsuming = function(sinkname,identity,prophash,defer){
    taskRegistry.run('findSink',{
      sinkname:sinkname,
      identity:identity,
      propertyhash:prophash,
      onSink:this.onSinkFound.bind(this,defer,sinkname)
    });
  };
  require('./common')(execlib,User);

  return User;
}

module.exports = createUser;
