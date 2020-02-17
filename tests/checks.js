// IMPORTS
const path = require('path');
const Utils = require('./testutils');

const path_assignment = path.resolve(path.join(__dirname, "../", "mod2_cmd_iterators.js"));
// CRITICAL ERRORS
let error_critical = null;

var MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017';
let client;
let db;
let dbname = "companies";
let coleccion = "data";

//TESTS
describe("Using Mongo SHELL", function () {

    it('', async function () {
        this.name = `1: Comprobando que la base de datos está arrancada y acepta conexiones...`;
        this.score = 1;
        this.msg_ok = `La base de datos está ok, hemos conseguido conectar.`;
        this.msg_err = `No se ha podido conectar al servidor de MongoDB, comprueba que ejecutaste el demonio (mongod) y que el puerto está libre y la base de datos quedó a la espera de conexiones.`;

        client = new MongoClient(url, {useNewUrlParser: true, useUnifiedTopology: true});

        client.connect(function(err) {
            should.not.exist(err);
            console.log("Hemos conectado al servidor!");
        });
    });

    it('', async function () {
        this.name = `2: Comprobando que la base de datos ${dbname} existe...`;
        this.score = 1;
        this.msg_ok = `La base de datos existe.`;
        this.msg_err = `No se ha podido conectar a la base de datos de nombre "${dbname}."`;
        try {
            db = client.db("companies"); 
            const col = db.collection('data');
            let docs = await col.find().limit(2).toArray();
            docs.length.should.be.equal(2);
            console.log("HOLA");
        } catch (err) {            
            console.log("ERR", err);
            should.not.exist(err);
        }
    });

    after(function() {
        // runs after all tests in this block
        client.close();
    });

});
