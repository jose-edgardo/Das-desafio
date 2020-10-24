const express = require('express');
const usuarioRouter = require('./routers/usuario');
const departamentoRouter = require('./routers/departamento');
const municipioRouter = require('./routers/municipio');
const infoContactoRouter = require('./routers/infoContacto');
const aseguradoraRouter = require('./routers/aseguradora');
const infoSeguroRouter = require('./routers/infoSeguro');
const infoSaludRouter = require('./routers/infoSalud');
const app = express();

app.use(express.json());
app.use(usuarioRouter);
app.use(departamentoRouter);
app.use(municipioRouter);
app.use(infoContactoRouter);
app.use(aseguradoraRouter);
app.use(infoSeguroRouter);
app.use(infoSaludRouter);

module.exports = app;
