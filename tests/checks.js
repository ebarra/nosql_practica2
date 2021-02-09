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
const Company = require('./company');
const Result = require('./result');

let withDebug = false;
const debug = (...args) => {
    if(withDebug){
      console.log(...args);
    }
}

let dbexists = false;

describe("Using Mongo SHELL", function () {

    before(async function() {
        console.log("COMPROBACIONES PREVIAS")
        console.log("Comprobando que la base de datos está arrancada y acepta conexiones...")

        try {
            await mongoose.connect(URL, {useNewUrlParser: true, useUnifiedTopology: true, socketTimeoutMS: 3000, connectTimeoutMS:3000, serverSelectionTimeoutMS: 2000});
            //connection = await mongoose.createConnection(URL, {useNewUrlParser: true, useUnifiedTopology: true, socketTimeoutMS: 3000, connectTimeoutMS:3000, serverSelectionTimeoutMS: 2000});
            //should.exist(connection);


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
                new Admin(mongoose.connection.db).listDatabases(function(err, result) {
                    var allDatabases = result.databases.map((dat)=>dat.name);
                    debug('listDatabases succeeded', allDatabases);
                    dbexists = allDatabases.includes(dbname);
                    dbexists.should.be.equal(true);
                    mongoose.connection.db.listCollections().toArray(function (err, names) {
                        if(err) throw err;
                        let colnames = names.map((dat)=>dat.name);
                        colnames.includes(coleccion).should.be.equal(true);
                        debug('listCollections succeeded', colnames);
                        resolve();
                    });
                });
            } catch (err) {
              console.log("ERR", err);
              should.not.exist(err);
              reject(err);
            }
          });
    });


    it('1. Actualizar. Comprobando funcionalidad ...', async function() {
        this.score = 0.5;
        this.msg_ok = `La compañía "VistaGen Therapeutics" tiene el email del alumno`;
        this.msg_err = `La compañía "VistaGen Therapeutics" NO tiene el email del alumno.`;
        try {
          let com = await Company.findOne({name: "VistaGen Therapeutics"});
          debug("COM: ", com.email_address);
          debug("USER:", User.email);
          User.email.should.be.equal(com.email_address);
        } catch(e){
          debug("ERROR:", e);
          should.not.exist(e);
        }
    });


    it('2. Actualizar creando un campo array. Comprobando funcionalidad ...', async function() {
        this.score = 1;
        this.msg_ok = `La compañía "VistaGen Therapeutics" tiene el array owners ok`;
        this.msg_err = `La compañía "VistaGen Therapeutics" NO tiene el array owners correcto.`;
        try {
          let com = await Company.findOne({name: "VistaGen Therapeutics"});
          debug("COM: ", com.owners);
          let myarray = com.owners;
          myarray.length.should.be.equal(1);
          myarray[0].token.should.be.equal(User.token);
        } catch(e){
          debug("ERROR:", e);
          should.not.exist(e);
        }
    });


    it('3. Actualizar multiple. Comprobando funcionalidad ...', async function() {
        this.score = 0.5;
        this.msg_ok = `Las compañías fundadas después de 2012 tienen el campo adicional solicitado`;
        this.msg_err = `Las compañías fundadas después de 2012 NO tienen el campo adicional solicitado`;
        try {
          let com = await Company.find({founded_year: {$gte: 2012}, uptodate: true});
          debug("COM: ", com);
          com.length.should.be.equal(43);
        } catch(e){
          debug("ERROR:", e);
          should.not.exist(e);
        }
    });

    it('4. Borrar un campo. Comprobando funcionalidad ...', async function() {
        this.score = 1;
        this.msg_ok = `La compañía "Fixya" ya no tiene el campo "twitter_username"`;
        this.msg_err = `La compañía "Fixya" aun tiene el campo "twitter_username"`;
        try {
          let com = await Company.findOne({name: "Fixya"});
          debug("COM: ", com);
          should.not.exist(com.twitter_username);
        } catch(e){
          debug("ERROR:", e);
          should.not.exist(e);
        }
    });

    it('5. Borrar documento. Comprobando funcionalidad ...', async function() {
      this.score = 1;
      this.msg_ok = `La compañía fundada el 21 de abril de 2009 está borrada correctamente`;
      this.msg_err = `La compañía fundada el 21 de abril de 2009 aún existe`;
      try {
        dbexists.should.be.equal(true);
        let com = await Company.findOne({name: "Hellofam"});
        debug("COM: ", com);
        should.not.exist(com);
      } catch(e){
        debug("ERROR:", e);
        should.not.exist(e);
      }
    });

    it('6.a) Insertar documento. Comprobando funcionalidad ...', async function() {
      this.score = 0.5;
      this.msg_ok = `El documento insertado "Result" existe y tiene el _id correcto`;
      this.msg_err = `El documento insertado "Result" NO existe o no tiene el _id correcto`;
      try {
        let doc = await Result.findOne({_id: 1});
        debug("DOC: ", doc);
        should.exist(doc);
      } catch(e){
        debug("ERROR:", e);
        should.not.exist(e);
      }
    });

    it('6.b) Insertar documento. Comprobando funcionalidad ...', async function() {
      this.score = 0.5;
      this.msg_ok = `El documento insertado "Result" existe y tiene el email de alumno correcto`;
      this.msg_err = `El documento insertado "Result" no tiene el _id correcto o no tiene el email de alumno correcto`;
      try {
        let doc = await Result.findOne({_id: 1});
        debug("DOC: ", doc);
        doc.email.should.be.equal(User.email);
      } catch(e){
        debug("ERROR:", e);
        should.not.exist(e);
      }
    });

    it('6.c) Insertar documento. Comprobando funcionalidad ...', async function() {
      this.score = 0.5;
      this.msg_ok = `El documento insertado "Result" tiene el resultado correcto para compañías con más de 100 empleados`;
      this.msg_err = `El documento insertado "Result" NO tiene el resultado correcto para compañías con más de 100 empleados`;
      try {
        let doc = await Result.findOne({_id: 1});
        debug("DOC: ", doc);
        doc.results.mas_empleados.should.be.equal(16);
      } catch(e){
        debug("ERROR:", e);
        should.not.exist(e);
      }
    });

    it('6.d) Insertar documento. Comprobando funcionalidad ...', async function() {
      this.score = 0.5;
      this.msg_ok = `El documento insertado "Result" tiene el resultado correcto para compañías con 2 oficinas`;
      this.msg_err = `El documento insertado "Result" NO tiene el resultado correcto para compañías con 2 oficinas`;
      try {
        let doc = await Result.findOne({_id: 1});
        debug("DOC: ", doc);
        doc.results.dos_oficinas.should.be.equal(33);
      } catch(e){
        debug("ERROR:", e);
        should.not.exist(e);
      }
    });

    it('6.e) Insertar documento. Comprobando funcionalidad ...', async function() {
      this.score = 0.5;
      this.msg_ok = `El documento insertado "Result" tiene el resultado correcto para milestones en el año 2012`;
      this.msg_err = `El documento insertado "Result" NO tiene el resultado correcto para milestones en el año 2012`;
      try {
        let doc = await Result.findOne({_id: 1});
        debug("DOC: ", doc);
        doc.results.m_2012.should.be.equal(10);
      } catch(e){
        debug("ERROR:", e);
        should.not.exist(e);
      }
    });

    it('6.f) Insertar documento. Comprobando funcionalidad ...', async function() {
      this.score = 0.5;
      this.msg_ok = `El documento insertado "Result" tiene el resultado correcto para compañías recientes, opening_date posterior a 2020`;
      this.msg_err = `El documento insertado "Result" NO tiene el resultado correcto para compañías recientes, opening_date posterior a 2020`;
      try {
        let doc = await Result.findOne({_id: 1});
        debug("DOC: ", doc);
        doc.results.recientes.should.be.equal(89);
      } catch(e){
        debug("ERROR:", e);
        should.not.exist(e);
      }
    });

    it('7. Meter en array. Comprobando funcionalidad ...', async function() {
      this.score = 1;
      this.msg_ok = `La compañía de nombre "FoodCare" tiene el array products con el nuevo producto añadido.`;
      this.msg_err = `La compañía de nombre "FoodCare" NO tiene añadido el nuevo producto en el array products.`;
      try {
        dbexists.should.be.equal(true);
        let com = await Company.findOne({name: "FoodCare"});
        debug("COM: ", com);
        com.products.length.should.be.equal(6);
        com.products[5].name.should.be.equal("Future Edition");
        com.products[5].permalink.should.be.equal("future-edition");
      } catch(e){
        debug("ERROR:", e);
        should.not.exist(e);
      }
    });

    it('8. Actualizar array. Comprobando funcionalidad ...', async function() {
      this.score = 0.5;
      this.msg_ok = `La compañía de nombre "FoodCare" tiene el array products con su segunda posición correcto.`;
      this.msg_err = `La compañía de nombre "FoodCare" tiene el array products con la segunda posición INCORRECTA.`;
      try {
        dbexists.should.be.equal(true);
        let com = await Company.findOne({name: "FoodCare"});
        debug("COM: ", com);
        com.products.length.should.be.equal(6);
        com.products[1].name.should.be.equal("Company Edition");
      } catch(e){
        debug("ERROR:", e);
        should.not.exist(e);
      }
    });

    it('9. Sacar de array. Comprobando funcionalidad ...', async function() {
      this.score = 0.5;
      this.msg_ok = `La compañía de nombre "CircleUp" no tiene en el campo relationship con "is_past" a true.`;
      this.msg_err = `La compañía de nombre "CircleUp" AUN tiene en el campo relationship con "is_past" a true.`;
      try {
        dbexists.should.be.equal(true);
        let com = await Company.findOne({name: "CircleUp"});
        debug("COM: ", com);
        com.relationships.length.should.be.equal(6);
      } catch(e){
        debug("ERROR:", e);
        should.not.exist(e);
      }
    });

    it('10. Cambiar el tipo de datos en un campo. Comprobando funcionalidad ...', async function() {
      this.score = 0.5;
      this.msg_ok = `La compañía de nombre "Gimigo" tiene el phone_number solicitado.`;
      this.msg_err = `La compañía de nombre "Gimigo" NO tiene el phone_number solicitado.`;
      try {
        dbexists.should.be.equal(true);
        let com = await Company.findOne({name: "Gimigo"});
        debug("COM: ", com);
        com.phone_number.should.be.equal(2065382800);
      } catch(e){
        debug("ERROR:", e);
        should.not.exist(e);
      }
    });


    after(function() {
        console.log("Cerramos la conexión con la BBDD");
        mongoose.connection.close();
    });

});
