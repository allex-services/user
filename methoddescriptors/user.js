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
  }],
  'updateProfile' : [
    {
      title : 'User data',
      type : 'object'
    }
  ],
  'changePassword' : [
    {
      title : 'Old password',
      type : 'string'
    },
    {
      title : 'New password',
      type : 'string'
    }
  ],
  'validateCredentials' : [
    {
      title : 'Credentials',
      type : 'object'
    }
  ]
};
