function createRemoteSinkHandler(execlib, SubServiceSinkHandler) {
  'use strict';
  var lib = execlib.lib,
    q = lib.q;

  function RemoteSinkHandler (service, name) {
    SubServiceSinkHandler.call(this);
    this.service = service;
    this.name = name;
  }
  lib.inherit(RemoteSinkHandler, SubServiceSinkHandler);
  RemoteSinkHandler.prototype.destroy = function () {
    this.name = null;
    this.service = null;
    SubServiceSinkHandler.prototype.destroy.call(this);
  };
  RemoteSinkHandler.prototype.acquireSink = function (defer) {
    this.service.subservices.listenFor(this.name, defer.resolve.bind(defer), true, true);
    this.service.askForRemote(this.name, this.propertyHashForRemote()).done(
      console.log.bind(console, 'RemoteSinkHandler askForRemote', this.name),
      console.error.bind(console, 'RemoteSinkHandler askForRemote error', this.name)
    );
  };
  RemoteSinkHandler.prototype.deactivate = function () {
    //this.service.disposeOfRemote(this.name);
    return SubServiceSinkHandler.prototype.deactivate.call(this);
  };
  RemoteSinkHandler.prototype.propertyHashForRemote = function () {
    return {};
  };

  return RemoteSinkHandler;
}

module.exports = createRemoteSinkHandler;
