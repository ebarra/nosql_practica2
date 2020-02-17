// IMPORTS
const path = require('path');
const Utils = require('./testutils');

// CRITICAL ERRORS
let error_critical = null;

const url = 'mongodb://localhost:27017';
let client;
let db;
let dbname = "companies";
let coleccion = "data";

const mongoose = require('mongoose');


//TESTS
describe("Using Mongo SHELL", function () {

  before(async function() {
    console.log("COMPROBACIONES PREVIAS")
    console.log("Comprobando que la base de datos está arrancada y acepta conexiones...")

    try {
      client = await mongoose.connect(url, {useNewUrlParser: true, useUnifiedTopology: true, socketTimeoutMS: 300, connectTimeoutMS:300});
      should.exist(client);
      console.log("La base de datos está ok, hemos conseguido conectar!");
    } catch (err) {
        console.log("ERR", err);
        console.log("No se ha podido conectar al servidor de MongoDB, comprueba que ejecutaste el demonio (mongod) y que el puerto está libre y la base de datos quedó a la espera de conexiones.");
  }
});


    it('1: Comprobando que existe la base de datos y la colección ...', async function (done) {
        this.score = 1;
        this.msg_ok = `Todo ok, hemos conseguido conectar a la base de datos "${dbname}" y la colección "${coleccion}"  `;
        this.msg_err = `No se ha podido conectar. Comprueba que tienes una base de datos de nombre ${dbname} y la colección ${coleccion} .`;

        try {
          //client = await mongoose.connect(url+"/"+dbname, {useNewUrlParser: true, useUnifiedTopology: true, socketTimeoutMS: 300, connectTimeoutMS:300});
          //should.exist(client);
          mongoose.connection.db.listCollections({name: coleccion}).next(function(err, collinfo) {
              if(err){
                console.log(err);
                should.not.exist(err);
              } else {
                console.log("Hemos conectado a la bbdd y la colección existe!");
                should.exist(collinfo);
              }
              done();
          });
        } catch (err) {
            console.log("ERR", err);
            should.not.exist(err);
        }
    });


    after(function() {
        // runs after all tests in this block
        mongoose.connection.close();
    });

});
