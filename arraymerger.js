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
    var foundobj = {found:null}, _fo = foundobj;
    arry.some(nameFinder.bind(_fo, name));
    _fo = null;
    return foundobj.found;
  }
  function putter (nitem, _item, _itemname) {
    nitem[_itemname] = _item;
  }
  function injector(myarry, item) {
    var nitem = itemNamed(myarry, item.name), _nitem;
    if (!nitem) {
      nitem = {};
      myarry.push(nitem);
    }
    _nitem = nitem;
    lib.traverse(item, putter.bind(null, _nitem));
    _nitem = null;
  }
  function arrayMerger(arry1, arry2) {
    var ret = [], _ret = ret;
    var inject = injector.bind(null, _ret);
    _ret = null;
    arry1.forEach(inject);
    arry2.forEach(inject);
    return ret;
  }
  return arrayMerger;
}

module.exports = createArrayMerger;
