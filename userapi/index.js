function createUserServiceSuite (execlib) {
  'use strict';
  var lib = execlib.lib,
    q = lib.q,
    SinkHandler = require('./sinkhandlercreator')(execlib),
    SubServiceSinkHandler = require('./subservicesinkhandlercreator')(execlib, SinkHandler),
    LocalSinkHandler = require('./localsinkhandlercreator')(execlib, SubServiceSinkHandler),
    RemoteSinkHandler = require('./remotesinkhandlercreator')(execlib, SubServiceSinkHandler);

  return {
    SinkHandler: SinkHandler,
    LocalSinkHandler: LocalSinkHandler,
    RemoteSinkHandler: RemoteSinkHandler
  };
}

module.exports = createUserServiceSuite;
