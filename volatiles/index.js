function createVolatileSubSinkHandlerFactory (execlib) {
  'use strict';

  var VolatileSubSinkBase = require('./basecreator'),
    FindSinkVolatileSubSinkHandler = require('./findsinkhandlercreator')(execlib, VolatileSubSinkBase),
    HotelVolatileSubSinkHandler;

  function factory(userservice, prophash, sinkinfo) {
    switch (sinkinfo.source) {
      case 'hotel':
        return new HotelVolatileSubSinkHandler(userservice, prophash, sinkinfo);
      default:
        return new FindSinkVolatileSubSinkHandler(userservice, prophash, sinkinfo);
    }
  }

  return factory;
}

module.exports = createVolatileSubSinkHandlerFactory;
