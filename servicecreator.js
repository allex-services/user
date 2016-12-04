function createUserService(execlib,ParentService){
  'use strict';
  var lib = execlib.lib,
    q = lib.q,
    qlib = lib.qlib,
    execSuite = execlib.execSuite,
    nameOfRemoteSinkDescriptor,
    taskRegistry = execSuite.taskRegistry,
    arrymerger = require('./arraymerger')(execlib),
    VolatileSubSink;

  if (!execSuite.userServiceSuite) {
    execSuite.userServiceSuite = require('./userapi')(execlib);
  }

  nameOfRemoteSinkDescriptor = execSuite.userServiceSuite.nameOfRemoteSinkDescriptor;
  VolatileSubSink = require('./volatilesubsinkhandlercreator')(execlib);

  function factoryCreator(parentFactory){
    return {
      'service': require('./users/serviceusercreator')(execlib,parentFactory.get('service')),
      'user': require('./users/usercreator')(execlib,parentFactory.get('user')) 
    };
  }

  function UserService(prophash){
    ParentService.call(this,prophash);
    this.__hotel = prophash.__hotel;
    this.name = prophash.name;
    this.role = prophash.role;
    lib.traverseShallow(prophash.profile, this.profileItemToState.bind(this));
    this._profile_keys = Object.keys(prophash.profile);
    this.volatiles = new lib.Map();
    this.sinkInfo.local.forEach(this.createSubService.bind(this, prophash));
  }
  ParentService.inherit(UserService,factoryCreator);
  UserService.prototype.__cleanUp = function(){
    lib.containerDestroyAll(this.volatiles);
    this.volatiles.destroy();
    this.volatiles = null;
    this._profile_keys = null;
    this.role = null;
    this.name = null;
    this.__hotel = null;
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
  UserService.prototype.close = function () {
    lib.containerDestroyAll(this.volatiles);
    ParentService.prototype.close.call(this);
  };
  UserService.prototype.sinkInfo = {
    local: [],
    remote: []
  };
  function sinkinfofinder (findobj, item) {
    if (item.name === findobj.name) {
      findobj.value = item[findobj.field];
      return true;
    }
  }
  UserService.prototype.sinkInfoData = function (groupname, sinkinfoname, sinkinfofield) {
    var retobj = {name: sinkinfoname, field: sinkinfofield};
    var group = this.sinkInfo[groupname];
    if (!group) {
      return;
    }
    group.some(sinkinfofinder.bind(null, retobj));
    return retobj.value;
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
    if (nameOfRemoteSinkDescriptor(rsi) === foundobj.name) {
      foundobj.found = rsi;
      foundobj.role = rsi.role;
      return true;
    }
  }

  UserService.prototype.askForRemote = function (sinkname, prophash){
    var v = this.volatiles.get(sinkname), rsi;
    if (v) { //found an existing volatile sink
      v.inc();
    } else {
      rsi = this.getSinkInfo(sinkname);
      if (!rsi.found) {
        return q.reject(new lib.Error('INVALID_VOLATILE_SINK_NAME',sinkname));
      }
      //console.log('new VolatileSubSink', prophash);
      this.volatiles.add(sinkname, new VolatileSubSink(this, prophash, rsi.found)); 
    }
    return q(true);
  };

  UserService.prototype.getSinkInfo = function (sinkname) {
    var rsi = {name:sinkname, found:null, role: null};
    this.sinkInfo.remote.some(remoteSinkInfoFinder.bind(null,rsi));
    return rsi;
  };

  UserService.prototype.disposeOfRemote = function (sinkname, defer) {
    defer = defer || q.defer();
    var v = this.volatiles.get(sinkname);
    if (v) {
      v.dec();
    }
    defer.resolve('ok');
    return defer.promise;
  };
  
  UserService.prototype.profileItemToState = function (profitem, profitemname) {
    this.state.set('profile_'+profitemname, profitem);
  };

  UserService.prototype.readData = function (subservicename, filter, defer) {
    var ss = this.subservices.get(subservicename);
    if (!ss) {
      defer.reject(new lib.Error('NO_SUBSERVICE', 'No subservice named '+subservicename));
      return;
    }
    taskRegistry.run('streamFromDataSink', {
      sink: ss,
      filter: filter,
      defer: defer
    });
  };

  UserService.prototype.preProcessSubconnectIdentity = function (subservicename, userspec) {
    var rsi = this.getSinkInfo(subservicename);
    //console.log('preProcessSubconnectIdentity ', subservicename, userspec, rsi);
    if (rsi.found && rsi.role) {
      //console.log('preProcessSubconnectIdentity will update role to: ', rsi.role);
      userspec.role = rsi.role;

      var vg = this.volatiles.get(subservicename);
      if (vg) lib.extend(userspec, vg.prophash);
    }
    return userspec;
  };

  UserService.prototype.updateProfile = function (data, defer) {
    var promise = this.__hotel.executeOnResolver(['updateUser', {username: this.name}, data, {op : 'set', upsert: false}]);
    qlib.promise2defer(promise, defer);
    promise.done (this._onProfileUpdated.bind(this, data));
  };

  UserService.prototype._onProfileUpdated = function (data, updateresult) {
    //TODO: check result ...
    var key;

    for (var i in data) {
      if (this._profile_keys.indexOf(i) > -1) this.profileItemToState(data[i], i);
    }
  };

  UserService.prototype.changePassword = function (old_password, new_password, defer) {
    qlib.promise2defer (this.__hotel.executeOnResolver(['changePassword', old_password, new_password]), defer);
  };

  UserService.prototype.validateCredentials = function (credentials, defer) {
    qlib.promise2defer(this.__hotel.executeOnResolver(['resolveUser', credentials, defer);
  };

  UserService.prototype.propertyHashDescriptor = {
    name: {
      type: 'string'
    }
  };

  
  return UserService;
}

module.exports = createUserService;
