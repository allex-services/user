function createVolatileSubSinkHandler(execlib) {
  'use strict';
  var lib = execlib.lib,
    execSuite = execlib.execSuite,
    nameOfRemoteSinkDescriptor = execSuite.userServiceSuite.nameOfRemoteSinkDescriptor,
    taskRegistry = execSuite.taskRegistry;

  function VolatileSubSink(userservice, prophash, sinkinfo) {
    this.count = 1;
    this.userservice = userservice;
    this.sinkinfo = sinkinfo;
    this.prophash = prophash;
    this.sink = null;
    this.userServiceDestroyedListener = this.userservice.destroyed.attach(this.destroy.bind(this));
    //console.log('Volatile is out to findSink',this.remoteSinkName(),'with identity',this.identity());
    this.task = taskRegistry.run('findSink',{
      sinkname: this.remoteSinkName(),
      identity: this.identity(),
      onSink: this.onSink.bind(this)
    });
  }
  VolatileSubSink.prototype.destroy = function () {
    var lssn, ondownwaitermethodname, ondownwaitermethod;
    if (!this.userServiceDestroyedListener) {
      return;
    }
    lssn = this.localSubSinkName();
    //console.log('Volatile', lssn, 'is dying');
    ondownwaitermethodname = '_on_'+lssn+'_Down';
    ondownwaitermethod = this.userservice[ondownwaitermethodname];
    if ('function' === typeof ondownwaitermethod) {
        ondownwaitermethod.call(this.userservice);
    };
    this.userservice.state.set('have'+lssn,false);
    this.userservice.state.remove('have'+lssn);
    this.userservice.subservices.remove(lssn);
    this.userservice.volatiles.remove(lssn);
    this.task.destroy();
    this.task = null;
    this.userServiceDestroyedListener.destroy();
    this.userServiceDestroyedListener = null;
    this.sink = null;
    this.prophash = null;
    this.userservice = null;
    this.count = null;
  };

  VolatileSubSink.prototype.remoteSinkName = function () {
    return this.sinkinfo.sinkname || this.sinkinfo.name;
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
    //console.log('VolatileSubSink onSink', sink);
    var lssn = this.localSubSinkName(), ssw;
    this.sink = sink;
    if (sink) {
      if (this.sinkinfo.materialize) {
        if (this.sinkinfo.materialize.state) {
          taskRegistry.run('materializeState', {
            sink: sink
          });
        }
      }
      this.userservice._activateStaticSubService(lssn, sink);
    } else {
      //this.destroy();
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

  return VolatileSubSink;
}

module.exports = createVolatileSubSinkHandler;
