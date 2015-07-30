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

  function VolatileSubSink(userservice, sinkname, role) {
    this.count = 1;
    this.userservice = userservice;
    this.sinkname = sinkname;
    this.sink = null;
    this.userServiceDestroyedListener = this.userservice.destroyed.attach(this.destroy.bind(this));
    this.task = taskRegistry.run('findSink',{
      sinkname: sinkname,
      identity: {
        name: this.userservice.name,
        role: role || 'user'
      },
      onSink: this.onSink.bind(this)
    });
  }
  VolatileSubSink.prototype.destroy = function () {
    if (!this.userServiceDestroyedListener) {
      return;
    }
    this.userservice.state.set('have'+this.sinkname,false);
    this.userservice.state.remove('have'+this.sinkname);
    this.userservice.subservices.remove(this.sinkname);
    this.task.destroy();
    this.task = null;
    this.userServiceDestroyedListener.destroy();
    this.userServiceDestroyedListener = null;
    this.sinkname = null;
    this.userservice = null;
    this.count = null;
  };
  VolatileSubSink.prototype.onSink = function (sink) {
    this.sink = sink;
    if (sink) {
      this.userservice.state.set('have'+this.sinkname,true);
      this.userservice.subservices.add(this.sinkname,sink);
    } else {
      this.destroy();
    }
  };
  VolatileSubSink.prototype.inc = function () {
    if('number' !== typeof(this.count)){
      return;
    }
    this.count ++;
  };
  VolatileSubSink.prototype.dec = function () {
    if('number' !== typeof(this.count)){
      return;
    }
    this.count --;
    if (this.count < 1) {
      if (this.sink) {
        this.sink.destroy();
      } else {
        this.destroy();
      }
    }
  };

  function UserService(prophash){
    ParentService.call(this,prophash);
    this.name = prophash.name;
    this.volatiles = new lib.Map();
    this.sinkInfo.local.forEach(this.createSubService.bind(this, prophash));
    lib.traverseShallow(prophash.profile, this.profileItemToState.bind(this));
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
    if (rsi.sinkname===foundobj.sinkname) {
      foundobj.found = rsi;
      return true;
    }
  }
  UserService.prototype.askForRemote = function (sinkname, defer){
    var v = this.volatiles.get(sinkname), rsi;
    if (v) { //found an existing volatile sink
      v.inc();
    } else {
      rsi = {sinkname:sinkname, found:null};
      this.sinkInfo.remote.some(remoteSinkInfoFinder.bind(null,rsi));
      if (!rsi.found) {
        defer.reject(new lib.Error('INVALID_VOLATILE_SINK_NAME',sinkname));
        return;
      }
      this.volatiles.add(sinkname, new VolatileSubSink(this, sinkname, rsi.found.role)); 
    }
    defer.resolve('ok');
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
