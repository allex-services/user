(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
function createArrayMerger(execlib) {
  'use strict';
  var lib = execlib.lib;
  function nameFinder(foundobj, name, item){
    if(item && item.name===name){
      foundobj.found = item;
      return true;
    }
  }
  function itemNamed(arry, name){
    var foundobj = {found:null};
    arry.some(nameFinder.bind(foundobj, name));
    return foundobj.found;
  }
  function injector(myarry, item) {
    var nitem = itemNamed(myarry, item.name);
    if (!nitem) {
      nitem = {};
      myarry.push(nitem);
    }
    lib.traverse(item, function(_item, _itemname){
      nitem[_itemname] = _item;
    });
  }
  function arrayMerger(arry1, arry2) {
    var ret = [];
    var inject = injector.bind(null, ret);
    arry1.forEach(inject);
    arry2.forEach(inject);
    return ret;
  }
  return arrayMerger;
}

module.exports = createArrayMerger;

},{}],2:[function(require,module,exports){
ALLEX.execSuite.registry.add('allex_userservice',require('./clientside')(ALLEX, ALLEX.execSuite.registry.get('.')));

},{"./clientside":3}],3:[function(require,module,exports){
function createClientSide(execlib, ParentServicePack){
  if (!execlib.execSuite.userServiceSuite) {
    execlib.execSuite.userServiceSuite = {
      nameOfRemoteSinkDescriptor: require('./userapi/nameofremotesinkdescriptorcreator')(execlib)
    };
  }
  return {
    SinkMap: require('./sinkmapcreator')(execlib,ParentServicePack)
  };
}

module.exports = createClientSide;

},{"./sinkmapcreator":6,"./userapi/nameofremotesinkdescriptorcreator":9}],4:[function(require,module,exports){
module.exports = {
};

},{}],5:[function(require,module,exports){
module.exports = {
  'askForRemote' : [{
    title:'Sinkname',
    type:'string'
  },{
    title: 'Property hash for identity',
    type: 'object'
  }],
  'disposeOfRemote' : [{
    title:'Sinkname',
    type:'string'
  }],
  'readData': [{
    title: 'SubService name',
    type: 'string'
  },{
    title: 'Filter',
    type: 'object'
  }]
};

},{}],6:[function(require,module,exports){
function sinkMapCreator(execlib,ParentServicePack){
  'use strict';
  var sinkmap = new (execlib.lib.Map), ParentSinkMap = ParentServicePack.SinkMap;
  sinkmap.add('service',require('./sinks/servicesinkcreator')(execlib,ParentSinkMap.get('service')));
  sinkmap.add('user',require('./sinks/usersinkcreator')(execlib,ParentSinkMap.get('user')));
  
  return sinkmap;
}

module.exports = sinkMapCreator;

},{"./sinks/servicesinkcreator":7,"./sinks/usersinkcreator":8}],7:[function(require,module,exports){
function createServiceSink(execlib,ParentSink){
  'use strict';

  if(!ParentSink){
    ParentSink = execlib.execSuite.registry.get('.').SinkMap.get('user');
  }

  function ServiceSink(prophash,client){
    ParentSink.call(this,prophash,client);
  }
  ParentSink.inherit(ServiceSink,require('../methoddescriptors/serviceuser'));
  ServiceSink.prototype.__cleanUp = function(){
    ParentSink.prototype.__cleanUp.call(this);
  };
  return ServiceSink;
}

module.exports = createServiceSink;

},{"../methoddescriptors/serviceuser":4}],8:[function(require,module,exports){
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

  /*
  UserSink.inherit = function (childSinkCtor, methodDescriptors, sinkInfo, remotesinknamearry) {
    if(!sinkInfo){
      throw new lib.Error('NOT_A_USERSERVICE_USERSINK_INHERIT',"A subclass of UserService's UserSink did not provide the sinkInfo to inherit as a 3rd parameter");
    }
    ParentSink.inherit.call(this, childSinkCtor, methodDescriptors);
    childSinkCtor.prototype.sinkInfo = arrymerger(sinkInfo, this.prototype.sinkInfo);
    if (!lib.isArray(remotesinknamearry)) {
      throw new lib.Error('NEW_INHERIT_FINGERPRINT_FOR_USERSINK', 'Missing the remotesinknamearray');
    }
    childSinkCtor.prototype.remoteSinkNames = lib.arryOperations.union(remotesinknamearry, this.prototype.remoteSinkNames);
  };
  UserSink.prototype.sinkInfo = [];
  */
  UserSink.inherit = function (childSinkCtor, methodDescriptors, localsinknamearry, remotesinknamearry) {
    if(!localsinknamearry){
      throw new lib.Error('NOT_A_USERSERVICE_USERSINK_INHERIT',"A subclass of UserService's UserSink did not provide the local sink name array to inherit as a 3rd parameter");
    }
    ParentSink.inherit.call(this, childSinkCtor, methodDescriptors);
    childSinkCtor.prototype.localSinkNames = lib.arryOperations.union(localsinknamearry, this.prototype.localSinkNames);
    if (!lib.isArray(remotesinknamearry)) {
      throw new lib.Error('NEW_INHERIT_FINGERPRINT_FOR_USERSINK', 'Missing the remotesinknamearray');
    }
    childSinkCtor.prototype.remoteSinkNames = lib.arryOperations.union(remotesinknamearry, this.prototype.remoteSinkNames);
  };
  UserSink.prototype.localSinkNames = [];
  UserSink.prototype.remoteSinkNames = [];
  return UserSink;
}

module.exports = createUserSink;

},{"../arraymerger":1,"../methoddescriptors/user":5}],9:[function(require,module,exports){
function createNameOfRemoteDescptorFunc(execlib) {
  'use strict';
  var lib = execlib.lib;
  return function nameOfRemoteSinkDescriptor (sinkinfo) {
    if (lib.isArray(sinkinfo.name)) {
      return sinkinfo.name[sinkinfo.name.length-1];
    }
    if (!sinkinfo.name) {
      console.error(sinkinfo);
      throw new lib.Error('NO_LOCAL_SUBSINK_NAME');
    }

    return sinkinfo.name;
  }
}

module.exports = createNameOfRemoteDescptorFunc;

},{}]},{},[2]);
