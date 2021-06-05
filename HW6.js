var express = require('express');
var mysql = require('./dbcon.js');

var app = express();
var handlebars = require('express-handlebars').create({defaultLayout: 'main'});
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 5573);

app.use(express.static('public'));

function sendData(req,res, next){
  mysql.pool.query('SELECT * FROM workouts ORDER BY name', function(err, rows, fields){
  if(err){
    next(err);
    return;
  }
  res.type('application/json');
  res.send(rows);
  });
}

app.get('/reset-table',function(req,res,next){
  var context = {};
  mysql.pool.query("DROP TABLE IF EXISTS workouts", function(err){
    var createString = "CREATE TABLE workouts("+
    "id INT PRIMARY KEY AUTO_INCREMENT,"+
    "name VARCHAR(255) NOT NULL,"+
    "reps INT,"+
    "weight INT,"+
    "date DATE,"+
    "lbs BOOLEAN)";
    mysql.pool.query(createString, function(err){
      context.results = "Table reset";
      res.render('home',context);
    })
  });
});

app.get('/', function(req,res){
  var context = {};
  res.render('home', context);
});

app.post('/insert', function(req,res,next){
  mysql.pool.query("INSERT INTO workouts (`name`, `date`,`reps`,`weight`,`lbs`) VALUES (?,?,?,?,?)", [req.body.name, req.body.date, req.body.reps, req.body.weight, req.body.unit], function(err, result){
    if(err){
      next(err);
      return;
    }
    sendData(req,res,next);
  });
});


app.post('/delete', function(req, res, next){
  mysql.pool.query("DELETE FROM workouts WHERE id = ?", [req.body.id], function(err, result){
    if(err){
      next(err);
      return;
    }
    sendData(req,res,next);
  });
});


app.post('/safe-update',function(req,res,next){
  mysql.pool.query("SELECT * FROM workouts WHERE id=?", [req.body.id], function(err, result){
    if(err){
      next(err);
      return;
    }
    if(result.length == 1){
      var curVals = result[0];
      mysql.pool.query("UPDATE workouts SET name=?, date=?, reps=?, weight=?, lbs=? WHERE id=? ",
        [req.body.name || curVals.name, req.body.date || curVals.date, req.body.reps || curVals.reps, req.body.weight|| curVals.weight, req.body.unit || curVals.unit, req.body.id],
        function(err, result){
        if(err){
          next(err);
          return;
        }
        sendData(req,res,next);
      });
    }
  });
});


app.use(function(req,res){
  res.type('text/plain');
  res.status(404);
  res.send('404 - Not Found');
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.type('plain/text');
  res.status(500);
  res.send('500 - Server Error');
});

app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});