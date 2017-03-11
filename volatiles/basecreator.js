function createVolatileSubSinkHandlerBase (execlib) {
  'use strict';

  var lib = execlib.lib;

  function VolatileSubSinkBase(userservice, prophash, sinkinfo) {
    this.userservice = userservice;
    this.sinkinfo = sinkinfo;
    this.prophash = prophash;
    this.count = 1;
    this.goForSink();
  }
  VolatileSubSinkBase.prototype.destroy = function () {
    if (!this.userservice) {
      return;
    }
    this.count = null;
    this.prophash = null;
    this.userservice = null;
    var lssn;
    this.reportSinkDown(true);
    lssn = this.localSubSinkName();
    //console.log('Volatile', lssn, 'is dying');
    if (!(this.userservice && this.userservice.volatiles)) {
      return;
    }
    this.userservice.volatiles.remove(lssn);
  };

  VolatileSubSinkBase.prototype.reportSinkDown = function (destroytoo) {
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

  VolatileSubSinkBase.prototype.inc = function () {
    if('number' !== typeof(this.count)){
      return;
    }
    this.count ++;
  };
  VolatileSubSinkBase.prototype.dec = function () {
    if('number' !== typeof(this.count)){
      return;
    }
    this.count --;
    if (this.count < 1) {
      this.destroy();
    }
  };

  return VolatileSubSinkBase;
}

module.exports = createVolatileSubSinkHandlerBase;
