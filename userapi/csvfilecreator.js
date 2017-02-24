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
  /*
   * datafields: [{
   *  name: 'field0',
   *  title: 'Field0'
   * },{
   *  name: 'field1',
   *  title: 'Field1'
   * }]
   */
  CsvFile.prototype.headerName = function (field) {
    return this.fieldContents(field.title || field.name);
  };
  CsvFile.prototype.headerNames = function (datafields) {
    return datafields.map(this.headerName.bind(this)).join(this.fieldDelimiter);
  };
  CsvFile.prototype.produceFromDataArray = function (datafields, dataarray) {
    var ret = this.includeHeaders ? this.headerNames(datafields)+'\n' : '';
    console.log('ima li date?', dataarray);
    return ret+dataarray.reduce(this.rowProducer.bind(this, datafields), '');
  };
  CsvFile.prototype.rowProducer = function (datafields, res, dataobject) {
    console.log('sta je res kojmoj?', res);
    var retobj = {ret: ''};
    datafields.forEach(this.onDataField.bind(this, datafields, dataobject, retobj));
    if (res.length) {
      res += '\n';
    }
    res += retobj.ret;
    retobj = null;
    return res;
  };
  CsvFile.prototype.onDataField = function (datafields, dataobject, retobj, datafield, ind) {
    retobj.ret += this.fieldProducer(dataobject,datafield.name);
    if (ind < datafields.length-1) {
      retobj.ret += this.fieldDelimiter;
    }
  };
  CsvFile.prototype.fieldProducer = function (dataobject, fieldname) {
    var ret = dataobject[fieldname];
    if (!lib.isString(ret)) {
      ret = '';
    }
    return this.fieldContents(ret);
  };
  CsvFile.prototype.fieldContents = function (string) {
    if (string.indexOf(this.fieldDelimiter) >= 0) {
      string = this.textDelimiter+string+this.textDelimiter;
    }
    return string;
  };
  CsvFile.prototype.fieldDelimiter = ',';
  CsvFile.prototype.textDelimiter = '"';

  return CsvFile;
}

module.exports = createCSVFile;
