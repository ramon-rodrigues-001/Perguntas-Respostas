const mongoose = require('mongoose')

const Pergunta = mongoose.model("Pergunta", {
    title: String,
    descrition: String
})

module.exports = Pergunta