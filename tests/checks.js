// IMPORTS
const path = require('path');
const User = require('../user.json');

// CRITICAL ERRORS
let error_critical = null;
let dbname = "data";
let coleccion = "companies";
const URL = 'mongodb://localhost:27017/' + dbname;
let connection;

const mongoose = require('mongoose');
let Admin = mongoose.mongo.Admin;
const Company = require('./model');

describe("Using Mongo SHELL", function () {

    before(async function() {
        console.log("COMPROBACIONES PREVIAS")
        console.log("Comprobando que la base de datos está arrancada y acepta conexiones...")

        try {
            await mongoose.connect(URL, {useNewUrlParser: true, useUnifiedTopology: true, socketTimeoutMS: 3000, connectTimeoutMS:3000, serverSelectionTimeoutMS: 2000});
            //connection = await mongoose.createConnection(URL, {useNewUrlParser: true, useUnifiedTopology: true, socketTimeoutMS: 3000, connectTimeoutMS:3000, serverSelectionTimeoutMS: 2000});
            //should.exist(connection);
            mongoose.connection.on('open', function() {
                // connection established
                new Admin(mongoose.connection.db).listDatabases(function(err, result) {
                    console.log('listDatabases succeeded');
                    // database list stored in result.databases
                    var allDatabases = result.databases.map((dat)=>dat.name);
                    allDatabases.includes(dbname).should.be.equal(true);
                });
            });
            mongoose.connection.on('error', (error) => {
                console.warn('ERROR : ',error);
            });
            console.log("La base de datos está ok, hemos conseguido conectar!");
            console.log("\n\n");
        } catch (err) {
            console.log("ERR", err);
            console.log("No se ha podido conectar al servidor de MongoDB, comprueba que ejecutaste el demonio (mongod) y que el puerto está libre y la base de datos quedó a la espera de conexiones.");
        }
    });


    it('0: Comprobando que existe la base de datos y la colección ...', async function() {
        this.score = 0.5;
        this.msg_ok = `Todo ok, hemos conseguido conectar a la base de datos "${dbname}" y la colección "${coleccion}"  `;
        this.msg_err = `No se ha podido conectar a la colección pedida. Comprueba que tienes una base de datos de nombre ${dbname} y la colección ${coleccion} .`;
          return new Promise(function(resolve, reject) {
            try {
               mongoose.connection.db.listCollections().toArray(function (err, names) {
                  if(err) throw err;
                  let colnames = names.map((dat)=>dat.name);
                  colnames.includes(coleccion).should.be.equal(true);
                  resolve();
              });
            } catch (err) {
              console.log("ERR", err);
              should.not.exist(err);
              reject(err);
            }
          });
    });


    it('1. Actualizar. Comprobando funcionalidad ...', async function() {
        this.score = 1;
        this.msg_ok = `La compañía "VistaGen Therapeutics" tiene el email del alumno`;
        this.msg_err = `La compañía "VistaGen Therapeutics" NO tiene el email del alumno.`;
        try {
          let com = await Company.findOne({name: "VistaGen Therapeutics"});
          throw "ERROR MIO";
          //console.log("COM: ", com.email_address);
          //console.log("USER:", User.email);
        } catch(e){
          console.log("ERROR:", e);
          should.not.exist(e);
        }
        console.log("SAAAAAAAAAAAAAAAAALlllllllllll")
        User.email.should.be.equal(com.email_address);
    });


    after(function() {
        console.log("Cerramos la conexión con la BBDD");
        mongoose.connection.close();
    });

});
