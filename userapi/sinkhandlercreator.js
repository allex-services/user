function createSinkHandler(execlib) {
  'use strict';
  var lib = execlib.lib,
    q = lib.q;

  function SinkHandler () {
    this.sink = null;
    this.sinkDestroyedHandler = null;
  }
  SinkHandler.prototype.destroy = function () {
    if (this.sinkDestroyedHandler) {
      lib.destroyASAP(this.sinkDestroyedHandler);
    }
    this.sinkDestroyedHandler = null;
    if (this.sink) {
      this.sink.destroy();
    }
  };
  SinkHandler.prototype._onSink = function (sink) {
    this.sink = sink;
    if (this.sinkDestroyedHandler) {
      this.sinkDestroyedHandler.destroy();
    }
    if (sink) {
      this.sinkDestroyedHandler = sink.destroyed.attach(this.onSinkDown.bind(this));
    }
  };
  SinkHandler.prototype.onSinkDown = function (modulename) {
    this.sink = null;
    this.activate();
  };
  SinkHandler.prototype.activate = function () {
    var d = q.defer();
    if (this.sink) {
      d.resolve(true);
    } else {
      d.promise.then(this._onSink.bind(this));
      this.acquireSink(d);
    }
    return d.promise;
  };
  SinkHandler.prototype.deactivate = function () {
    var d = q.defer();
    if (!this.sink) {
      d.resolve(true);
    } else {
      if (this.sinkDestroyedHandler) {
        this.sinkDestroyedHandler.destroy();
      }
      this.sinkDestroyedHandler = this.sink.destroyed.attach(
        this.onSinkDeactivated.bind(this, d, this.sink.modulename)
      );
      this.destroySink();
    }
    return d.promise;
  };
  SinkHandler.prototype.destroySink = function () {
    this.sink.destroy();
  };
  SinkHandler.prototype.onSinkDeactivated = function (defer, modulename) {
    this.sink = null;
    this.destroy();
    defer.resolve(true);
  };

  return SinkHandler;
}

module.exports = createSinkHandler;
