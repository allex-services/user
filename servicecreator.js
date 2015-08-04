function createUserService(execlib,ParentServicePack){
  'use strict';
  var lib = execlib.lib,
    q = lib.q,
    ParentService = ParentServicePack.Service,
    taskRegistry = execlib.execSuite.taskRegistry,
    arrymerger = require('./arraymerger')(execlib),
    VolatileSubSink = require('./volatilesubsinkhandlercreator')(execlib);

  function factoryCreator(parentFactory){
    return {
      'service': require('./users/serviceusercreator')(execlib,parentFactory.get('service')),
      'user': require('./users/usercreator')(execlib,parentFactory.get('user')) 
    };
  }

  function UserService(prophash){
    ParentService.call(this,prophash);
    this.name = prophash.name;
    this.role = prophash.role;
    lib.traverseShallow(prophash.profile, this.profileItemToState.bind(this));
    this.volatiles = new lib.Map();
    this.sinkInfo.local.forEach(this.createSubService.bind(this, prophash));
  }
  ParentService.inherit(UserService,factoryCreator);
  UserService.prototype.__cleanUp = function(){
    this.name = null;
    ParentService.prototype.__cleanUp.call(this);
  };
  UserService.prototype.close = function () {
    while (this.volatiles.count) {

    }
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
    this.startSubServiceStatically(subsinkinfo.modulename, subsinkinfo.name, this.createSubServicePropHash(prophash, subsinkinfo));
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
  function remoteSinkInfoFinder(foundobj, rsi){
    if (rsi.name===foundobj.name) {
      foundobj.found = rsi;
      return true;
    }
  }
  UserService.prototype.askForRemote = function (sinkname, prophash, defer){
    var v = this.volatiles.get(sinkname), rsi;
    defer = defer || q.defer();
    if (v) { //found an existing volatile sink
      v.inc();
    } else {
      rsi = {name:sinkname, found:null};
      this.sinkInfo.remote.some(remoteSinkInfoFinder.bind(null,rsi));
      if (!rsi.found) {
        defer.reject(new lib.Error('INVALID_VOLATILE_SINK_NAME',sinkname));
        return defer.promise;
      }
      //console.log('new VolatileSubSink', prophash);
      this.volatiles.add(sinkname, new VolatileSubSink(this, prophash, rsi.found)); 
    }
    defer.resolve('ok');
    return defer.promise;
  };
  UserService.prototype.disposeOfRemote = function (sinkname, defer) {
    var v = this.volatiles.get(sinkname);
    if (v) {
      v.dec();
    }
    defer.resolve('ok');
  };
  
  UserService.prototype.profileItemToState = function (profitem, profitemname) {
    this.state.set('profile/'+profitemname, profitem);
  };

  
  return UserService;
}

module.exports = createUserService;
