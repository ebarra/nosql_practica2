// IMPORTS
const path = require('path');
const Utils = require('./testutils');

// CRITICAL ERRORS
let error_critical = null;
let dbname = "companies";
let coleccion = "data";
const URL = 'mongodb://localhost:27017/' + dbname;
let connection;

const mongoose = require('mongoose');
let Admin = mongoose.mongo.Admin;

//TESTS
describe("Using Mongo SHELL", function () {

    before(async function() {
        console.log("COMPROBACIONES PREVIAS")
        console.log("Comprobando que la base de datos está arrancada y acepta conexiones...")

        try {
            //client = await mongoose.connect(URL, {useNewUrlParser: true, useUnifiedTopology: true});
            connection = await mongoose.createConnection('mongodb://localhost:27017/companies', {useNewUrlParser: true, useUnifiedTopology: true, socketTimeoutMS: 3000, connectTimeoutMS:3000, serverSelectionTimeoutMS: 2000});
            should.exist(connection);
            connection.on('open', function() {
                // connection established
                new Admin(connection.db).listDatabases(function(err, result) {
                    console.log('listDatabases succeeded');
                    // database list stored in result.databases
                    var allDatabases = result.databases.map((dat)=>dat.name);
                    allDatabases.includes(dbname).should.be.equal(true);
                });
            });
            console.log("La base de datos está ok, hemos conseguido conectar!");
            console.log("\n\n");
        } catch (err) {
            console.log("ERR", err);
            console.log("No se ha podido conectar al servidor de MongoDB, comprueba que ejecutaste el demonio (mongod) y que el puerto está libre y la base de datos quedó a la espera de conexiones.");
        }
    });


    it('1: Comprobando que existe la base de datos y la colección ...', async function() {
        this.score = 1;
        this.msg_ok = `Todo ok, hemos conseguido conectar a la base de datos "${dbname}" y la colección "${coleccion}"  `;
        this.msg_err = `No se ha podido conectar a la colección pedida. Comprueba que tienes una base de datos de nombre ${dbname} y la colección ${coleccion} .`;
          return new Promise(function(resolve, reject) {
            try {
               connection.db.listCollections().toArray(function (err, names) {
                  if(err) throw err;
                  let colnames = names.map((dat)=>dat.name);
                  colnames.includes("coleccion").should.be.equal(true);
                  resolve();
              });
            } catch (err) {
              console.log("ERR", err);
              should.not.exist(err);
              reject(err);
            }
          });
    });


    after(function() {
        console.log("Cerramos la conexión con la BBDD");
        connection.close();
    });

});
