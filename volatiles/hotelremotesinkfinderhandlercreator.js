function createHotelRemoteSinkFinderSubSinkHandler(execlib, VolatileSubSinkBase) {
  'use strict';

  var lib = execlib.lib;

  function HotelRemoteSinkFinderSubSinkHandler(userservice, prophash, sinkinfo) {
    VolatileSubSinkBase.call(this, userservice, prophash, sinkinfo);
  }
  lib.inherit(HotelRemoteSinkFinderSubSinkHandler, VolatileSubSinkBase);
  HotelRemoteSinkFinderSubSinkHandler.prototype.destroy = function () {
    VolatileSubSinkBase.prototype.destroy.call(this);
  };


  return HotelRemoteSinkFinderSubSinkHandler;

}

module.exports = createHotelRemoteSinkFinderSubSinkHandler;
