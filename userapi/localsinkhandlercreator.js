function createLocalSinkHandler(execlib, SubServiceSinkHandler) {
  'use strict';
  var lib = execlib.lib,
    q = lib.q;

  function LocalSinkHandler (service, name) {
    SubServiceSinkHandler.call(this, service, name);
  }
  lib.inherit(LocalSinkHandler, SubServiceSinkHandler);
  LocalSinkHandler.prototype.acquireSink = function () {
    var d;
    if (!(this.service && this.service.subservices)) {
      return q.resolve(null);
    }
    var ss = this.service.subservices.get(this.name);
    if (ss){
      d = q.defer();
      ss.destroyed.attach(
        d.resolve.bind(d, true)
      );
      ss.destroy();
      return d.promise.then(this.acquireSink.bind(this));
    }
    return this.service.startSubServiceStatically(
      this.service.sinkInfoData('local', this.name, 'modulename'),
      this.name,
      lib.extend(
        lib.extend(
          {},
          this.service.sinkInfoData('local', this.name, 'propertyhash')
        ),
        this.sinkCtorPropHash()
      )
    ).then(
      this._onSink.bind(this)
    );
  };

  return LocalSinkHandler;
}

module.exports = createLocalSinkHandler;
