const mongoose =  require('mongoose');
const Schema = mongoose.Schema;

const ResultSchema = Schema({
      _id: Number,
      email : String,
      results: Object

  });

module.exports = mongoose.model('Result', ResultSchema);
