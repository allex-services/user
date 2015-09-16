function createCSVFile (execlib, DynamicFile) {
  'use strict';
  var lib = execlib.lib,
    q = lib.q;

  function CsvFile(filename, destroyables){
    DynamicFile.call(this, filename, destroyables);
  }
  lib.inherit(CsvFile, DynamicFile);
  CsvFile.prototype.contentType = function () {
    return 'text/csv';
  };

  return CsvFile;
}

module.exports = createCSVFile;
