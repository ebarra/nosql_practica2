var mongoose = require('mongoose')
    , Admin = mongoose.mongo.Admin;

/// create a connection to the DB
var connection = mongoose.createConnection('mongodb://localhost:27017/companies', {useNewUrlParser: true, useUnifiedTopology: true});

// connection.on('open', function() {
//     // connection established
//     new Admin(connection.db).listDatabases(function(err, result) {
//         console.log('listDatabases succeeded');
//         // database list stored in result.databases
//         var allDatabases = result.databases;
//         console.log(allDatabases);
//     });
// });


connection.on('open', function (ref) {
    console.log('Connected to mongo server.');
    //trying to get collection names
    connection.db.listCollections().toArray(function (err, names) {
        console.log(names); // [{ name: 'dbname.myCollection' }]
        connection.close();
    });

})
