const express = require('express');
const usuarioRouter = require('./routers/usuario')

const app = express();

app.use(express.json());
app.use(usuarioRouter);

module.exports = app;
