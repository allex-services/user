module.exports = {
  'askForRemote' : [{
    title:'Sinkname',
    type:'string'
  },{
    title: 'Property hash for identity',
    type: 'object'
  }],
  'disposeOfRemote' : [{
    title:'Sinkname',
    type:'string'
  }],
  'readData': [{
    title: 'SubService name',
    type: 'string'
  },{
    title: 'Filter',
    type: 'object'
  }]
};
