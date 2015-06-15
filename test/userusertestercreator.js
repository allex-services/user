function createUserUserTester(execlib,Tester){
  'use strict';
  var lib = execlib.lib,
      q = lib.q;

  function UserUserTester(prophash,client){
    Tester.call(this,prophash,client);
    console.log('runNext finish');
    lib.runNext(this.finish.bind(this,0));
  }
  lib.inherit(UserUserTester,Tester);

  return UserUserTester;
}

module.exports = createUserUserTester;
