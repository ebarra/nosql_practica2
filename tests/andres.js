// IMPORTS
const path = require('path');
const Utils = require('./testutils');

/*
const path_assignment = path.resolve(path.join(__dirname, "../", "sample.html"));
const URL = "file://" + path_assignment.replace("%", "%25");

const browser = new Browser({waitDuration: 100, silent: true});
*/
//////
const T_TEST = 2 * 60; // Time between tests (seconds)
// const assert = require('assert');
const controller = require('../controllers/patient');
const Patient = require('../models/patient');
const mongo = require('./test_helper');
const mongoose = require('mongoose');
console.log(should)
let testPatient;

// CRITICAL ERRORS
let error_critical = null;

beforeEach( async () => {
	const data = [
	   {
			name: 'Juan',
			surname: 'Rodriguez',
			dni: '123123',
			city: "Madrid",
			profession: [
				"Frutero",
				"Monitor de tiempo libre"
			],
			medicalHistory: [
				{
					"specialist": "Medico de cabecera",
					"diagnosis": "Resfriado",
					"date": new Date( 2017,4,4)
				},
				{
					"specialist": "Dermatólogo",
					"diagnosis": "Escorbuto",
					"date": new Date( 2016,11,14)
				}
			]
		},
		{
			name: 'Andres',
			surname: 'Lopez',
			dni: '222333',
			city: "Cuenca",
			profession: [
				"Futbolista"
			],
			medicalHistory: [
				{
					"specialist": "Medico de cabecera",
					"diagnosis": "Resaca",
					"date": new Date( 2018,11,14)
				},
				{
					"specialist": "Traumatologo",
					"diagnosis": "Fractura de ligamento cruzado",
					"date": new Date( 2015,5,14)
				},
				{
					"specialist": "Traumatologo",
					"diagnosis": "Esguince de tobillo",
					"date": new Date( 2016,4,24)
				}
			]
		},
		{
			name: 'Carlos',
			surname: 'Lechon',
			dni: '333444',
			city: "Madrid",
			profession: [
				"Lechero",
				"Repartidor"
			],
			medicalHistory: [
				{
					"specialist": "Reumatologo",
					"diagnosis": "Osteoporosis",
					"date": new Date( 2016,5,14)
				},
				{
					"specialist": "Medico de cabecera",
					"diagnosis": "Resfriado",
					"date": new Date( 2017,1,5)
				}
			]
		},
		{
			name: 'Diana',
			surname: 'Pintor',
			dni: '555666',
			city: "Melilla",
			profession: [
				"Pintora",
				"Directora de subastas"
			],
			medicalHistory: [
				{
					"specialist": "Medico de cabecera",
					"diagnosis": "Diarrea aguda",
					"date": new Date( 2016,5,14)
				},
				{
					"specialist": "Traumatologo",
					"diagnosis": "Síndrome del tunel carpiano",
					"date": new Date( 2019,3,15)
				}
			]
		},
		{
			name: 'Raquel',
			surname: 'Dueñas',
			dni: '666777',
			city: "Barcelona",
			profession: [
				"Chef",
				"Ayudante de cocina",
				"Camarero"
			],
			medicalHistory: [
				{
					"specialist": "Cardiologo",
					"diagnosis": "Arritmia",
					"date": new Date( 2019,3,26)
				},
				{
					"specialist": "Medico de cabecera",
					"diagnosis": "Dermatitis",
					"date": new Date( 2017,1,5)
				}
			]
		},
		{
			name: 'Mario Alejandro',
			surname: 'Arcentales',
			dni: '777888',
			city: "Oviedo",
			profession: [
				"Minero"
			],
			medicalHistory: [
				{
					"specialist": "Endocrino",
					"diagnosis": "Anemia crónica",
					"date": new Date( 2018,10,26)
				},
				{
					"specialist": "Neumologo",
					"diagnosis": "Silicosis",
					"date": new Date( 2019,10,5)
				}
			]
		},
		{
			_id: new mongoose.Types.ObjectId('5e4a60fb7be8f229b54a16cb'),
			name: 'Ana',
			surname: 'Durcal',
			dni: '555555',
			city: "Huelva",
			profession: [
				"Frutera",
				"Monitora de tiempo libre"
			],
			medicalHistory: []
		}

	];
	testPatient = {
		_id: new mongoose.Types.ObjectId('5e3a60fb7be8f029b54a16c9'),
		name: 'Ana',
		surname: 'Durcal',
		dni: '555555',
		city: "Huelva",
		profession: [
			"Frutera",
			"Monitora de tiempo libre"
		],
		medicalHistory: []
	};
	test = await Patient.collection.insertMany(data);
});


//TESTS
describe("BBDD Tests", function () {
	describe('Creating Patient', function() {
        this.timeout(T_TEST * 1000);

        it('Creating a new Patient', async function() {
            this.score = 10;
            this.msg_err = "The patient has not been created correctly"
            this.msg_ok = "Patient created correctly!"
            const patient = await controller.create(testPatient)//takes some time and returns a promise
            should.equal(!testPatient.isNew, true) ;

        });
    });
    describe('Get Patients list', function() {
        it('Getting the list of all available patients', async function() {
            this.score = 10;
            this.msg_err = "The patient has not been listed correctly"
            this.msg_ok = "Patient listed correctly!"
            const patient = await controller.list();
            should.equal(patient.length, 7)

        })
    });

    describe('Reading Patient details',function() {
        it('Finding patient with the id 5e4a60fb7be8f229b54a16cb', async function() {
            this.score = 10;
            this.msg_err = "The patient with the id 5e4a60fb7be8f229b54a16cb has not been shown correctly";
            this.msg_ok = "Patient shown correctly!";
            const patient = await controller.read('5e4a60fb7be8f229b54a16cb');
            should.equal(patient._id.toString(), '5e4a60fb7be8f229b54a16cb');
        })
    });

    describe('Update Patient record', function() {
        it('Updating Patient with the id 5e4a60fb7be8f229b54a16cb', async function(){
            this.score = 10;
            this.msg_err = "The patient with the id 5e4a60fb7be8f229b54a16cb has not been listed correctly"
            this.msg_ok = "Patient listed correctly!";
            const patient = await controller.update({ _id: '5e4a60fb7be8f229b54a16cb' },{dni:'777777'});
			should.equal(patient.dni,'777777');
        })
    });

    describe('Find Patients by City', function()  {
        it('Finding Patients with city= Madrid', async function(){
            this.score = 10;
            this.msg_err = "The patients with city= Madrid has not been retrieved correctly"
            this.msg_ok = "Patients retrieved correctly!";
            const patient=controller.filterPatientsByCity('Madrid');
			should.equal(patient.length , 2 );

        })
    });
    /*

        describe('Filter Patients by Diagnosis', () => {
            it('Filtering Patients with Diagnosis= Osteoporosis', (done) => {
                controller.filterPatientsByDiagnosis('Osteoporosis')
                    .then((patient) => {
                        assert(patient.length === 1 );
                        done();
                    });
            })
        });

        describe('Filter Patients by Speacialist And Date', () => {
            it('Filtering Patients with Speacialist= Medico de cabecera and dates between 2016-04-14 to 2016-07-15', (done) => {
                controller.filterPatientsBySpeacialistAndDate('Medico de cabecera',new Date(2016, 4, 14),
                    new Date(2016, 7, 15))
                    .then((patient) => {
                        assert(patient.length === 1 );
                        done();
                    });
            })
        });

        describe('Add Patient History', () => {
            it('Adding record to Patient with the id 5e4a60fb7be8f229b54a16cb', (done) => {
                var record = {"specialist" : "Endocrinologo", "diagnosis" : "Diabetes", "date" : new Date(2019,10,5) };
                controller.addPatientHistory({ _id: '5e4a60fb7be8f229b54a16cb' },record)
                    .then((patient) => {console.log(patient.medicalHistory[0].specialist)
                        assert(patient.medicalHistory[0].specialist === 'Endocrinologo' && patient.medicalHistory[0].diagnosis==='Diabetes');
                        done();
                    });
            })
        });

        describe('Remove Patient by ID', () => {
            it('Removing Patient with the ID 5e4a60fb7be8f229b54a16cb', (done) => {
                controller.delete('5e4a60fb7be8f229b54a16cb')
                    .then(() => {
                        Patient.findOne({ _id: '5e4a60fb7be8f229b54a16cb' })
                            .then((patient) => {
                                assert(patient === null);
                                done();
                            });
                        done();
                    });
            })
        });
        */

});