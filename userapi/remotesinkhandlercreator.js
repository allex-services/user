function createRemoteSinkHandler(execlib, SubServiceSinkHandler) {
  'use strict';
  var lib = execlib.lib,
    q = lib.q;

  function RemoteSinkHandler (service, name) {
    SubServiceSinkHandler.call(this, service, name);
  }
  lib.inherit(RemoteSinkHandler, SubServiceSinkHandler);
  RemoteSinkHandler.prototype.destroy = function () {
    SubServiceSinkHandler.prototype.destroy.call(this);
  };
  RemoteSinkHandler.prototype.acquireSink = function () {
    var d = q.defer();
    if (!(this.service && this.service.subservices)) {
      return q(null);
    }
    this.service.subservices.listenFor(this.name, d.resolve.bind(d), true, true);
    this.service.askForRemote(this.name, this.propertyHashForRemote());
    return d.promise.then(this._onSink.bind(this));
  };
  RemoteSinkHandler.prototype.deactivate = function () {
    this.service.disposeOfRemote(this.name);
    return SubServiceSinkHandler.prototype.deactivate.call(this);
  };
  RemoteSinkHandler.prototype.propertyHashForRemote = function () {
    return {};
  };

  return RemoteSinkHandler;
}

module.exports = createRemoteSinkHandler;
