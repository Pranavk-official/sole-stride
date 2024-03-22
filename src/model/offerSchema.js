const mongoose = require('mongoose');

const {Schema, ObjectId} = mongoose

const offerSchema = new Schema({

},{timestamps: true})


module.exports = mongoose.model('Offer', offerSchema)