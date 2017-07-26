function createDownloadHandler(execlib, SinkHandler) {
  'use strict';
  var lib = execlib.lib,
    q = lib.q,
    execSuite = execlib.execSuite,
    taskRegistry = execSuite.taskRegistry;

  function DownloadHandler (service, cgiservicename, downloadslugname, downloadcb) {
    this.service = service;
    this.cgiservicename = cgiservicename;
    this.downloadslugname = downloadslugname;
    this.downloadcb = downloadcb;
  };
  lib.inherit(DownloadHandler, SinkHandler);
  DownloadHandler.prototype.destroy = function () {
    this.downloadcb = null;
    this.downloadslugname = null;
    this.cgiservicename = null;
    this.service = null;
    SinkHandler.prototype.destroy.call(this);
  };
  DownloadHandler.prototype.acquireSink = function () {
    var d = q.defer();
    taskRegistry.run('findAndRun', {
      program: {
        continuous: true,
        sinkname: this.cgiservicename,
        identity: {name: 'user', role: 'user'},
        task: {
          name: 'registerDownload', 
          propertyhash: {
            ipaddress: 'fill yourself',
            onEventId: {
              'bind yourself': this.onDownloadId.bind(this, d)
            },
            onDownloadStarted: {
               'bind yourself': this.onDownloadStarted.bind(this)
            }
          }
        }
      }
    });
    return d.promise;
  };
  DownloadHandler.prototype.onDownloadId = function (defer, findandruntask, originalprophash, id, cgiaddress, cgiport) {
    findandruntask.destroy();
    var cgisink = originalprophash.sink, proto = 'http';
    if (this.secure || cgiport === 443) {
      proto += 's';
    }
    if (!cgisink){
      this.service.state.remove(this.downloadslugname);
      defer.reject(new lib.Error('NO_SINK'));
      return;
    }
    this.service.state.set(this.downloadslugname, proto+'://'+cgiaddress+':'+cgiport+'/_'+id);
    defer.resolve(cgisink);
  };
  DownloadHandler.prototype.onDownloadStarted = function (originalprophash, findandruntask, cgievent) {
    if (this.downloadcb) {
      return this.downloadcb(findandruntask, cgievent);
    }
  };


  return DownloadHandler;
}

module.exports = createDownloadHandler;
