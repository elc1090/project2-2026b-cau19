// Nome de arquivo com [...path] = "catch-all": a Vercel reconhece qualquer
// arquivo dentro de api/ como funcao serverless, e esse padrao de colchetes
// faz essa unica funcao responder por qualquer sub-caminho de /api/*
// (ex: /api/scores), preservando o caminho original da requisicao.
module.exports = require('../server.js');
