function createUserCommons(execlib,klass){
  var lib = execlib.lib;

  function reverseSet(state,item,itemname){
    state.set(itemname,item);
  }
  klass.prototype.fillState = function(prophash){
    lib.traverse(prophash,reverseSet.bind(null,this.state));
  }
  klass.prototype.onAllSessionsDown = function(sessions){
    lib.runNext(this.recheckSessions.bind(this,sessions),10000);
  };
  klass.prototype.recheckSessions = function(sessions){
    if(sessions.length<1){
      this.destroy();
    }
  };
}

module.exports = createUserCommons;
