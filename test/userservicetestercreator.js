function createUserServiceTester(execlib,Tester){
  'use strict';
  var lib = execlib.lib,
      q = lib.q;

  function UserServiceTester(prophash,client){
    Tester.call(this,prophash,client);
    console.log('runNext finish');
    lib.runNext(this.finish.bind(this,0));
  }
  lib.inherit(UserServiceTester,Tester);

  return UserServiceTester;
}

module.exports = createUserServiceTester;
