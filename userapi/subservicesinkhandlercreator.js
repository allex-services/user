function createSubServiceSinkHandler(execlib, SinkHandler) {
  'use strict';
  var lib = execlib.lib,
    q = lib.q;

  function SubServiceSinkHandler (service, name) {
    SinkHandler.call(this);
    this.service = service;
    this.name = name;
    this.subServiceDownListener = null;
  }
  lib.inherit(SubServiceSinkHandler, SinkHandler);
  SubServiceSinkHandler.prototype.destroy = function () {
    if (this.subServiceDownListener) {
      this.subServiceDownListener.destroy();
    };
    this.subServiceDownListener = null;
    this.name = null;
    this.service = null;
    SinkHandler.prototype.destroy.call(this);
  };
  SubServiceSinkHandler.prototype.onSinkDeactivated = function (defer, modulename) {
    this.sink = null;
    if (this.subServiceDownListener) {
      this.subServiceDownListener.destroy();
    }
    this.subServiceDownListener = this.service.state.data.listenFor('have'+this.name, this.onSubServiceDown.bind(this, defer, modulename));
  };
  SubServiceSinkHandler.prototype.onSubServiceDown = function (defer, modulename, haveval) {
    if (!this.service) {
      return;
    }
    if (haveval) {
      return;
    }
    if (this.subServiceDownListener) {
      this.subServiceDownListener.destroy();
    }
    this.subServiceDownListener = null;
    SinkHandler.prototype.onSinkDeactivated.call(this, defer, modulename);
  };


  return SubServiceSinkHandler;
}

module.exports = createSubServiceSinkHandler;
