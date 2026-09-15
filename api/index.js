// Ponto de entrada que a Vercel reconhece automaticamente: qualquer arquivo
// dentro de api/ vira uma funcao serverless. Aqui so reaproveitamos o mesmo
// app Express usado localmente (server.js), sem duplicar codigo.
module.exports = require('../server.js');
