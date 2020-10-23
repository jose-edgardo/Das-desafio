const express = require('express');
const usuarioRouter = require('./routers/usuario');
const departamentoRouter = require('./routers/departamento');
const municipioRouter = require('./routers/municipio');
const infoContactoRouter = require('./routers/infoContacto');
const app = express();

app.use(express.json());
app.use(usuarioRouter);
app.use(departamentoRouter);
app.use(municipioRouter);
app.use(infoContactoRouter);

module.exports = app;
