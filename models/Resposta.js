const mongoose = require('mongoose')

const Resposta = mongoose.model('Resposta', {
    data: {type: String, required: true},
    texto: {type: String, required: true},
    perguntaId: {type: String, required: true}
})

module.exports = Resposta