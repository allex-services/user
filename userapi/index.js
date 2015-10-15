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

  function nameOfRemoteSinkDescriptor (sinkinfo) {
    if (lib.isArray(sinkinfo.name)) {
      return sinkinfo.name[sinkinfo.name.length-1];
    }
    if (!sinkinfo.name) {
      console.error(sinkinfo);
      throw new lib.Error('NO_LOCAL_SUBSINK_NAME');
    }

    return sinkinfo.name;
  }


  return {
    nameOfRemoteSinkDescriptor: nameOfRemoteSinkDescriptor,
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
