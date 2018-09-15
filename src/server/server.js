var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('../../config.sqlite');
 
db.serialize(function() {
  db.run("CREATE TABLE lorem (info TEXT)");
 
  var stmt = db.prepare("INSERT INTO users VALUES (?)");
  for (var i = 0; i < 10; i++) {
      stmt.run("Hubs " + i);
  }
  stmt.finalize();
 
  db.each("SELECT rowid AS id, info FROM lorem", function(err, row) {
      console.log(row.id + ": " + row.info);
  });
});
 
db.close();