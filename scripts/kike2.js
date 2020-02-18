var mongoose = require('mongoose');
var Admin = mongoose.mongo.Admin;
const Company = require('../tests/model');

/// create a connection to the DB
var client = mongoose.connect('mongodb://localhost:27017/data', {useNewUrlParser: true, useUnifiedTopology: true, socketTimeoutMS: 300, connectTimeoutMS:300});

mongoose.connection.on('open', function() {
    // connection established
    new Admin(mongoose.connection.db).listDatabases(function(err, result) {
        console.log('listDatabases succeeded');
        // database list stored in result.databases
        var allDatabases = result.databases;
        console.log(allDatabases);
    });

    let com = Company.findOne({}).exec().then(function(doc) {
        console.log(doc);
    });


});
