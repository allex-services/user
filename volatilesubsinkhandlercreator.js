function createVolatileSubSinkHandler(execlib) {
  'use strict';
  var lib = execlib.lib,
    taskRegistry = execlib.execSuite.taskRegistry;

  function VolatileSubSink(userservice, prophash, sinkinfo) {
    this.count = 1;
    this.userservice = userservice;
    this.sinkinfo = sinkinfo;
    this.prophash = prophash;
    this.sink = null;
    this.userServiceDestroyedListener = this.userservice.destroyed.attach(this.destroy.bind(this));
    this.task = taskRegistry.run('findSink',{
      sinkname: this.remoteSinkName(),
      identity: this.identity(),
      onSink: this.onSink.bind(this)
    });
  }
  VolatileSubSink.prototype.destroy = function () {
    var lssn;
    if (!this.userServiceDestroyedListener) {
      return;
    }
    lssn = this.localSubSinkName();
    this.userservice.state.set('have'+lssn,false);
    this.userservice.state.remove('have'+lssn);
    this.userservice.subservices.remove(lssn);
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
    if (!this.sinkinfo.name) {
      console.error(this.sinkinfo);
      throw new lib.Error('NO_LOCAL_SUBSINK_NAME');
    }
    return this.sinkinfo.name;
  };
  function propAppender(obj,item,itemname) {
    obj[itemname] = item;
  }
  VolatileSubSink.prototype.identity = function () {
    var ret = {}, appender = propAppender.bind(null,ret);
    lib.traverseShallow(this.sinkinfo.identity||{}, appender);
    lib.traverseShallow(this.prophash||{}, appender);
    ret.name = this.userservice.name;
    ret.role = ret.role || 'user';
    return ret;
  };
  VolatileSubSink.prototype.onSink = function (sink) {
    var lssn = this.localSubSinkName();
    this.sink = sink;
    if (sink) {
      //console.log('VOLATILE ... ',lssn);
      this.userservice.state.set('have'+lssn,true);
      this.userservice.subservices.add(lssn,sink);
    } else {
      this.destroy();
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