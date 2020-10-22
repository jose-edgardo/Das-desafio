const express = require('express');
const usuarioRouter = require('./routers/usuario');
const departamentoRouter = require('./routers/departamento');

const app = express();

app.use(express.json());
app.use(usuarioRouter);
app.use(departamentoRouter);

module.exports = app;
