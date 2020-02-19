const mongoose =  require('mongoose');
const Schema = mongoose.Schema;

const ResultSchema = Schema({
      _id: String,
      email : String,
      results: {
        mas_empleados: Number,
        tres_oficinas: Number,
        milestone_2011: Number
      }
      
  });

module.exports = mongoose.model('Result', ResultSchema);
