// Exports
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Pergunta = require('./models/Pergunta.js');
const Resposta = require('./models/Resposta.js');

const appExpress = express();

// Configurações gerais do aplicativo
appExpress.use(bodyParser.urlencoded({ extended: false }));
appExpress.use(bodyParser.json());
appExpress.set('view engine', 'ejs');
appExpress.use(express.static('public'));



// Rota para exibir a lista de perguntas
appExpress.get('/', async (req, res) => {
    try {
        const perguntas = await Pergunta.find().sort({ _id: -1 });

        const perguntasComComentarios = await Promise.all(perguntas.map(async (pergunta) => {
            const numComentarios = await Resposta.countDocuments({ perguntaId: pergunta._id });
            return { ...pergunta.toObject(), numComentarios: numComentarios };
        }));

        res.render('index', {
            perguntas: perguntasComComentarios
        });

    } catch (erro) {
        console.error('Erro:', erro);
        res.status(500).send('Erro ao buscar perguntas e contar comentários.');
    }
});


// Rota para exibir o formulário de fazer pergunta
appExpress.get('/fazerPergunta', (req, res) => {
    res.render('fazerPergunta');
});


// Rota para salvar uma nova pergunta
appExpress.post('/salvarPergunta', async (req, res) => {
    const title = req.body.title;
    const descrition = req.body.descrition;

    const criarPergunta = await Pergunta.create({
        title,
        descrition
    }).then(()=> {
        console.log('Pergunta salva!');
        res.redirect('/')
    }).catch((smgErro) => {
        console.log('Erro ao salvar a pergunta: ' + smgErro);
        return res.status(500).send('Erro ao salvar a pergunta');
    })
});



// Rota para acessar uma pergunta expecifica
appExpress.get('/fazerPergunta/:id', (req, res) => {
    const id = req.params.id
    Pergunta.findOne({_id: id}).then(pergunta => {
        if (pergunta != undefined) {
            
            Resposta.find({ perguntaId: id }).sort({ _id: -1 }).then((respostas) => {
                res.render('pergunta', {
                    pergunta: pergunta,
                    respostas: respostas
                });
            });
        }
    })
})


// Rota para criar e exibir as respostas
appExpress.post('/resposta', async (req, res) => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;

    const texto = req.body.resposta;
    const idPergunta = req.body.inputIDPergunta;
    const idPerguntaLimpo = idPergunta.replace(/`/g, '');

    try {
        await Resposta.create({
            data: formattedDate,
            texto: texto,
            perguntaId: idPerguntaLimpo
        });
        res.redirect(`/fazerPergunta/${idPerguntaLimpo}`);
    } catch (error) {
        console.error('Erro ao adicionar resposta:', error);
        return res.status(500).send('Erro ao adicionar resposta.');
    }
});



//CONECTANDO AO MONGO
mongoose.connect("mongodb+srv://ramon:ramon123456789@cluster0.vmlmrz3.mongodb.net/?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log("Conectado ao banco de dados");
    appExpress.listen('4000', () => {
        console.log('Servidor rodando...');
    });
}).catch(err => {
    console.log('Erro ao conectar ao banco de dados: ' + err);
});

