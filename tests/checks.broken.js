// IMPORTS
const path = require('path');
const Utils = require('./testutils');

const User = require('../user.json');

// CRITICAL ERRORS
let error_critical = null;
let dbname = "kike";
let coleccion = "kike";
const URL = 'mongodb://localhost:27017/' + dbname;
let connection;

const mongoose = require('mongoose');
let Admin = mongoose.mongo.Admin;


const Schema = mongoose.Schema;

const HelloSchema = Schema({
    hola: Number 
  });

const Hello = mongoose.model('kike', HelloSchema);



//TESTS
describe("Using Mongo SHELL", function () {
    before(async function() {
        console.log("COMPROBACIONES PREVIAS")
        console.log("Comprobando que la base de datos está arrancada y acepta conexiones...")

        try {
            //client = await mongoose.connect(URL, {useNewUrlParser: true, useUnifiedTopology: true});
            var client = mongoose.connect('mongodb://localhost:27017/data', {useNewUrlParser: true, useUnifiedTopology: true, socketTimeoutMS: 300, connectTimeoutMS:300});
            should.exist(connection);
            
            console.log("La base de datos está ok, hemos conseguido conectar!");
            console.log("\n\n");
        } catch (err) {
            console.log("ERR", err);
            console.log("No se ha podido conectar al servidor de MongoDB, comprueba que ejecutaste el demonio (mongod) y que el puerto está libre y la base de datos quedó a la espera de conexiones.");
        }
    });

    describe("DESC1", function () {

            it('0: Comprobando que existe la base de datos y la colección ...', async function() {
                this.score = 0.5;
                this.timeout = 5;
                this.msg_ok = `Todo ok, hemos conseguido conectar a la base de datos "${dbname}" y la colección "${coleccion}"  `;
                this.msg_err = `No se ha podido conectar a la colección pedida. Comprueba que tienes una base de datos de nombre ${dbname} y la colección ${coleccion} .`;
                return new Promise(function(resolve, reject) {
                    try {
                    connection.db.listCollections().toArray(async function (err, names) {
                        if(err) throw err;
                        let colnames = names.map((dat)=>dat.name);
                        colnames.includes(coleccion).should.be.equal(true);
                        try {
                            let indexes = await Hello.listIndexes();
                            console.log("ERRRERERER", indexes);
                            resolve();
                           
                            
                            } catch(e){
                                console.log(e);
                            }


                        
                    });
                    } catch (err) {
                    console.log("ERR", err);
                    should.not.exist(err);
                    reject(err);
                    }
                });
            });
});

describe("DESC2", function () {
    it('1. Actualizar. Comprobando funcionalidad ...', async function() {
        this.score = 1;
        this.msg_ok = `La compañía "VistaGen Therapeutics" tiene el email del alumno`;
        this.msg_err = `La compañía "VistaGen Therapeutics" NO tiene el email del alumno.`;
        console.log("ENTRAAAA")
        

       let doc = await mia();
       try {
       let com = await Company.find()
       
       
         console.log("COM: ", com)
         true.should.be.equal(true)
       } catch(e){
           console.log(e);
       }


    });
});



    after(function() {
        console.log("Cerramos la conexión con la BBDD");
        connection.close();
    });

});
