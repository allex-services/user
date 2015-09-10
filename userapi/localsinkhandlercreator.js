function createLocalSinkHandler(execlib, SubServiceSinkHandler) {
  'use strict';
  var lib = execlib.lib,
    q = lib.q;

  function LocalSinkHandler (service, name) {
    SubServiceSinkHandler.call(this, service, name);
  }
  lib.inherit(LocalSinkHandler, SubServiceSinkHandler);
  LocalSinkHandler.prototype.acquireSink = function (defer) {
    var ss = this.service.subservices.get(this.name);
    if (ss){
      ss.destroyed.attach(
        this.acquireSink.bind(this, defer)
      );
      ss.destroy();
      return;
    }
    this.service.startSubServiceStatically(
      this.service.sinkInfoData('local', this.name, 'modulename'),
      this.name,
      lib.extend(
        lib.extend(
          {},
          this.service.sinkInfoData('local', this.name, 'propertyhash')
        ),
        this.sinkCtorPropHash()
      )
    ).done(
      defer.resolve.bind(defer),
      defer.reject.bind(defer)
    );
  };

  return LocalSinkHandler;
}

module.exports = createLocalSinkHandler;
