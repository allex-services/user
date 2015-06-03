function createServiceUser(execlib,ParentUser){

  if(!ParentUser){
    ParentUser = execlib.execSuite.ServicePack.Service.prototype.userFactory.get('user');
  }

  function ServiceUser(prophash){
    ParentUser.call(this,prophash);
    this.fillState(prophash);
  }
  ParentUser.inherit(ServiceUser,require('../methoddescriptors/serviceuser'),[/*visible state fields here*/]/*or a ctor for StateStream filter*/);
  ServiceUser.prototype.__cleanUp = function(){
    ParentUser.prototype.__cleanUp.call(this);
  };
  require('./common')(execlib,ServiceUser);

  return ServiceUser;
}

module.exports = createServiceUser;
