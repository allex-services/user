function createUserServiceSuite (execlib) {
  'use strict';
  var lib = execlib.lib,
    q = lib.q,
    SinkHandler = require('./sinkhandlercreator')(execlib),
    SubServiceSinkHandler = require('./subservicesinkhandlercreator')(execlib, SinkHandler),
    LocalSinkHandler = require('./localsinkhandlercreator')(execlib, SubServiceSinkHandler),
    RemoteSinkHandler = require('./remotesinkhandlercreator')(execlib, SubServiceSinkHandler),
    UploadHandler = require('./uploadhandlercreator')(execlib, SinkHandler),
    DownloadHandler = require('./downloadhandlercreator')(execlib, SinkHandler),
    DynamicFile = require('./dynamicfilecreator')(execlib),
    CsvFile = require('./csvfilecreator')(execlib, DynamicFile),
    PdfFile = require('./pdffilecreator')(execlib, DynamicFile);

  return {
    SinkHandler: SinkHandler,
    LocalSinkHandler: LocalSinkHandler,
    RemoteSinkHandler: RemoteSinkHandler,
    UploadHandler: UploadHandler,
    DownloadHandler: DownloadHandler,
    fileSuite: {
      DynamicFile: DynamicFile,
      CsvFile: CsvFile,
      PdfFile: PdfFile
    }
  };
}

module.exports = createUserServiceSuite;
