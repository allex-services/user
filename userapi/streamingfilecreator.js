function createStreamingFile (execlib, DynamicFile) {
  'use strict';
  var lib = execlib.lib,
    q = lib.q;

  function StreamingFile(filename, content_type, destroyables){
    DynamicFile.call(this, filename, destroyables);
    this.content_type = content_type;
    this.closed = false;
  }
  lib.inherit(StreamingFile, DynamicFile);
  StreamingFile.prototype.destroy = function () {
    this.content_type = null;
    this.closed = null;
    DynamicFile.prototype.destroy.call(this);
  };


  StreamingFile.prototype.contentType = function () {
    return this.content_type;
  };

  StreamingFile.prototype.addBuffer = function (buff) {
    this.buffer.concat(buff);
  };

  StreamingFile.prototype.close = function () {
    console.log('will close the streaming file..');
    this.closed = true;
  };

  StreamingFile.prototype.getPayload = function () {
    console.log('will ask for payload ...');
    if (!this.buffer) return null;
    var b = this.buffer;
    if (!this.closed) this.buffer = new Buffer(0);
    return b;
  };
  console.log('OVO JE GOTOVO ...');
  return StreamingFile;
}

module.exports = createStreamingFile;
