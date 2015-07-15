function createArrayMerger(execlib) {
  'use strict';
  var lib = execlib.lib;
  function nameFinder(foundobj, name, item){
    if(item && item.name===name){
      foundobj.found = item;
      return true;
    }
  }
  function itemNamed(arry, name){
    var foundobj = {found:null};
    arry.some(nameFinder.bind(foundobj, name));
    return foundobj.found;
  }
  function injector(myarry, item) {
    var nitem = itemNamed(myarry, item.name);
    if (!nitem) {
      nitem = {};
      myarry.push(nitem);
    }
    lib.traverse(item, function(_item, _itemname){
      nitem[_itemname] = _item;
    });
  }
  function arrayMerger(arry1, arry2) {
    var ret = [];
    var inject = injector.bind(null, ret);
    arry1.forEach(inject);
    arry2.forEach(inject);
    return ret;
  }
  return arrayMerger;
}

module.exports = createArrayMerger;
