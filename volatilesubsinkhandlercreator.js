function createVolatileSubSinkHandler(execlib) {
  'use strict';
  var lib = execlib.lib,
    execSuite = execlib.execSuite,
    nameOfRemoteSinkDescriptor = execSuite.userServiceSuite.nameOfRemoteSinkDescriptor,
    taskRegistry = execSuite.taskRegistry;

  /*
   * sinkinfo may be
   * {
   *   name: 'Service'
   * }
   * findSink will go for 'Service', and the sink found will be 
   * exposed as the 'Service' subservice
   *
   * if 'role' exists in the hash, like
   * {
   *   name: 'Service'
   *   role: 'service'
   * }
   * findSink will go for 'Service' with {name: this.userservice.name, role: 'service',
   * and the sink found will be exposed as 'Service'
   *
   * {
   *   name: 'Service',
   *   sinkname: 'RealService',
   * }
   * findSink will go for 'RealService', and the sink found will be
   * exposed as the 'Service' subservice
   *
   */

  function VolatileSubSink(userservice, prophash, sinkinfo) {
    this.count = 1;
    this.userservice = userservice;
    this.sinkinfo = sinkinfo;
    this.prophash = prophash;
    this.sink = null;
    //console.log('Volatile is out to findSink',this.remoteSinkName(),'with identity',this.identity());
    this.task = null;
    this.goForSink();
  }
  VolatileSubSink.prototype.destroy = function () {
    if (!this.userservice) {
      return;
    }
    if (this.task) {
      this.task.destroy();
    }
    var lssn;
    this.reportSinkDown(true);
    lssn = this.localSubSinkName();
    //console.log('Volatile', lssn, 'is dying');
    this.userservice.volatiles.remove(lssn);
    this.task = null;
    if (this.sink) {
      this.sink.destroy();
    }
    this.sink = null;
    this.prophash = null;
    this.userservice = null;
    this.count = null;
  };

  VolatileSubSink.prototype.goForSink = function () {
    this.task = taskRegistry.run('findSink',{
      sinkname: this.remoteSinkName(),
      identity: this.identity(),
      onSink: this.onSink.bind(this)
    });
  };

  VolatileSubSink.prototype.remoteSinkName = function () {
    return this.userservice.clusterDependentRemotePath(this.sinkinfo.sinkname || this.sinkinfo.name);
  };

  VolatileSubSink.prototype.localSubSinkName = function () {
    return nameOfRemoteSinkDescriptor(this.sinkinfo);
  };
  function propAppender(obj,item,itemname) {
    obj[itemname] = item;
  }
  VolatileSubSink.prototype.identity = function () {
    var ret = {}, appender = propAppender.bind(null,ret);
    //lib.traverseShallow(this.sinkinfo.identity||{}, appender);
    //console.log('VolatileSubSink adding prophash', this.prophash);
    lib.traverseShallow(this.prophash||{}, appender);
    ret.name = this.userservice.name;
    ret.role = this.sinkinfo.role || 'user';
    return ret;
  };
  VolatileSubSink.prototype.onSink = function (sink) {
    var lssn = this.localSubSinkName(), ssw;
    console.log('VolatileSubSink', sink ? 'got' : 'lost', lssn);
    this.sink = sink;
    if (sink) {
      if (this.sinkinfo.materialize) {
        if (this.sinkinfo.materialize.state) {
          taskRegistry.run('materializeState', {
            sink: sink
          });
        }
      }
      //console.log('adding sink ....', lssn);
      this.userservice._activateStaticSubService(lssn, sink);
    } else {
      this.reportSinkDown();
    }
  };
  VolatileSubSink.prototype.reportSinkDown = function (destroytoo) {
    if (!(this.userservice && this.userservice.state)) {
      console.log('Volatile will die on Sink down');
      this.destroy();
      return;
    }
    var lssn, ondownwaitermethodname, ondownwaitermethod;
    lssn = this.localSubSinkName();
    ondownwaitermethodname = '_on_'+lssn+'_Down';
    ondownwaitermethod = this.userservice[ondownwaitermethodname];
    if ('function' === typeof ondownwaitermethod) {
        ondownwaitermethod.call(this.userservice);
    };
    var ss = this.userservice.subservices.unregister(lssn);
    this.userservice.state.remove('have'+lssn);
    if (ss && destroytoo) {
      console.log('destroying remote sink', lssn);
      ss.destroy();
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
      this.destroy();
    }
  };

  return VolatileSubSink;
}

module.exports = createVolatileSubSinkHandler;
