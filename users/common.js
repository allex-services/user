function createUserCommons(execlib,klass){
  'use strict';
  var lib = execlib.lib;

  function reverseSet(state,item,itemname){
    if (itemname !== '__service') {
      state.set(itemname,item);
    }
  }
  klass.prototype.fillState = function(prophash){
    lib.traverse(prophash,reverseSet.bind(null,this.state));
  }
  /* keeping this here for historic reasons only
  klass.prototype.onAllSessionsDown = function(){
    lib.runNext(this.recheckSessions.bind(this),10000);
  };
  klass.prototype.recheckSessions = function(){
    if(!this.sessions){
      return;
    }
    if(this.sessions.length<1){
      this.destroy();
    }
  };
  */
}

module.exports = createUserCommons;
