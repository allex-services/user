function createUploadHandler(execlib, SinkHandler) {
  'use strict';
  var lib = execlib.lib,
    q = lib.q,
    execSuite = execlib.execSuite,
    taskRegistry = execSuite.taskRegistry;

  /*
    service: UserService this Handler handles for
    cgiservicename: the name of the CGIService
    targetservicename: the name of the target service files should be uploaded to
    boundfields: hash, name/value pairs
    neededfields: array, names of needed fields
    uploadslugname: once the upload is negotiated, the upload slug will be set on `service` state under uploadslugname
    uploadcb: optional, if exists it will be called. Alternative is to override UploadHandler's onUploadSuccess
  */

  function UploadHandler (service, cgiservicename, targetservicename, boundfields, neededfields, uploadslugname, uploadcb) {
    SinkHandler.call(this);
    this.service = service;
    this.cgiservicename = cgiservicename;
    this.targetservicename = targetservicename;
    this.boundfields = boundfields;
    this.neededfields = neededfields;
    this.uploadslugname = uploadslugname;
    this.uploadcb = uploadcb;
  }
  lib.inherit(UploadHandler, SinkHandler);
  UploadHandler.prototype.destroy = function () {
    this.uploadcb = null;
    this.uploadslugname = null;
    this.neededfields = null;
    this.boundfields = null;
    this.targetservicename = null;
    this.cgiservicename = null;
    this.service = null;
    SinkHandler.prototype.destroy.call(this);
  };
  UploadHandler.prototype.acquireSink = function (defer) {
    taskRegistry.run('findAndRun',{
      program: {
        sinkname: this.cgiservicename,
        identity: {name: 'user', role: 'user'},
        task: {
          name: 'registerUpload',
          propertyhash: {
            targetsinkname: this.targetservicename,
            identityattargetsink: {
              name: this.service.name,
              role: 'user'
            },
            boundfields: this.boundfields,
            neededfields: this.neededfields,
            onEventId: {
              'bind yourself': this.onUploadId.bind(this, defer)
            },
            onUploadDone: this.onUploadDone.bind(this),
            ipaddress: 'fill yourself'
          }
        }
      }
    });
  };
  UploadHandler.prototype.onUploadId = function (defer, findandruntask, originalprophash, id, cgiaddress, cgiport) {
    findandruntask.destroy();
    var cgisink = originalprophash.sink;
    if(!cgisink){
      defer.reject(new lib.Error('NO_SINK'));
      return;
    }
    if (this.service.state.get('uploadURL')) {
      defer.reject(new lib.Error('CLIENT_STATE_ALREADY_PRESENT'));
      return;
    }
    this.service.set(this.uploadslugname, 'http://'+cgiaddress+':'+cgiport+'/_'+id);
    defer.resolve(cgisink);
  };
  UploadHandler.prototype.onUploadDone = function (doneobj) {
    if (!doneobj.success) {
      return;
    }
    if (this.uploadcb) {
      this.uploadcb(doneobj);
    }
    this.onUploadSuccess(doneobj);
  };
  UploadHandler.prototype.onUploadSuccess = lib.dummyFunc;
  UploadHandler.prototype.deactivate = function () {
    this.service.state.remove(this.uploadslugname);
    return SinkHandler.prototype.deactivate.call(this);
  };


  return UploadHandler;
}

module.exports = createUploadHandler;
