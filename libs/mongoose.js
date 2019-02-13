const mongoose = require('mongoose');
const beautifyUnique = require('mongoose-beautiful-unique-validation');
const config = require('config');

mongoose.set('debug', true);
mongoose.plugin(beautifyUnique);
mongoose.connect(config.get('mongodb.uri'));

module.exports = mongoose;
