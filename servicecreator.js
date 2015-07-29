function createUserService(execlib,ParentServicePack){
  'use strict';
  var lib = execlib.lib,
    ParentService = ParentServicePack.Service,
    arrymerger = require('./arraymerger')(execlib);

  function factoryCreator(parentFactory){
    return {
      'service': require('./users/serviceusercreator')(execlib,parentFactory.get('service')),
      'user': require('./users/usercreator')(execlib,parentFactory.get('user')) 
    };
  }

  function UserService(prophash){
    ParentService.call(this,prophash);
    this.sinkInfo.local.forEach(this.createSubService.bind(this, prophash));
    lib.traverseShallow(prophash.profile, this.profileItemToState.bind(this));
  }
  ParentService.inherit(UserService,factoryCreator);
  UserService.prototype.__cleanUp = function(){
    ParentService.prototype.__cleanUp.call(this);
  };

  UserService.inherit = function (serviceChildCtor, factoryProducer, additionalParentServices, sinkInfo) {
    if(!sinkInfo){
      throw new lib.Error('NOT_A_USERSERVICE_INHERIT',"A subclass of UserService did not provide the sinkInfo to inherit as a 4th parameter");
    }
    ParentService.inherit.call(this, serviceChildCtor, factoryProducer, additionalParentServices);
    serviceChildCtor.prototype.sinkInfo = {
      remote: arrymerger(sinkInfo.remote, this.prototype.sinkInfo.remote),
      local: arrymerger(sinkInfo.local, this.prototype.sinkInfo.local)
    };
  };
  UserService.prototype.sinkInfo = {
    local: [],
    remote: []
  };
  UserService.prototype.createSubService = function (prophash, subsinkinfo){
    //console.log('startSubServiceStatically',subsinkinfo.modulename, subsinkinfo.name, this.createSubServicePropHash(prophash, subsinkinfo)); 
    this.startSubServiceStatically(subsinkinfo.modulename, subsinkinfo.name, this.createSubServicePropHash(prophash, subsinkinfo));/*.done(
      console.log.bind(console,'startSubServiceStatically ok'),
      console.error.bind(console,'startSubServiceStatically nok')
    );*/
  };
  UserService.prototype.createSubServicePropHash = function (prophash, subsinkinfo){
    var ret = {};
    lib.traverse(subsinkinfo.propertyhash||{}, this.createSubServicePropHashItem.bind(this, prophash, ret));
    return ret;
  };
  UserService.prototype.createSubServicePropHashItem = function (propertyhash, resultprophash, item, itemname) {
    if(lib.isString(item) && item.indexOf('{{')===0 && item.lastIndexOf('}}')===item.length-2){
      item = eval(item.substring(2,item.length-2));
    }
    resultprophash[itemname] = item;
  };
  
  UserService.prototype.profileItemToState = function (profitem, profitemname) {
    this.state.set('profile/'+profitemname, profitem);
  };

  
  return UserService;
}

module.exports = createUserService;
