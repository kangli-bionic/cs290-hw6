var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit : 10,
  host  : 'classmysql.engr.oregonstate.edu',
  user  : 'cs290_chengkan',
  password: '4815',
  database: 'cs290_chengkan'
});

module.exports.pool = pool;