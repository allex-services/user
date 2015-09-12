function createUserServiceSuite (execlib) {
  'use strict';
  var lib = execlib.lib,
    q = lib.q,
    SinkHandler = require('./sinkhandlercreator')(execlib),
    SubServiceSinkHandler = require('./subservicesinkhandlercreator')(execlib, SinkHandler),
    LocalSinkHandler = require('./localsinkhandlercreator')(execlib, SubServiceSinkHandler),
    RemoteSinkHandler = require('./remotesinkhandlercreator')(execlib, SubServiceSinkHandler),
    UploadHandler = require('./uploadhandlercreator')(execlib, SinkHandler),
    DownloadHandler = require('./downloadhandlercreator')(execlib, SinkHandler) ;

  return {
    SinkHandler: SinkHandler,
    LocalSinkHandler: LocalSinkHandler,
    RemoteSinkHandler: RemoteSinkHandler,
    UploadHandler: UploadHandler,
    DownloadHandler: DownloadHandler
  };
}

module.exports = createUserServiceSuite;
