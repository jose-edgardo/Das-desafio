const express = require('express');
const Aseguradora = require('../modelos/aseguradora');
const auth = require('../middleware/auth');


const router = new express.Router();

router.post('/aseguradora', auth, async(req, res) => {
  try {
    const aseguradora = new Aseguradora(req.body);
    await aseguradora.save();
    res.status(201).send({ aseguradora });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

router.get('/aseguradora/:id', auth, async(req, res) => {
  const id = req.params.id;
  const pageSize = req.query.limit ? parseInt(req.query.limit) : 10;
  const page = req.query.skip ? parseInt(req.query.skip) : 1;
  const columnasValidas = ['id', 'numero_identificador', 'fecha_vigencia'];
  const columna = req.query.columna ? (columnasValidas.includes(req.query.columna) ? req.query.columna : 'numero_identificador') : 'numero_identificador';
  const orden = req.query.orden ? req.query.orden : 'ASC';
  try {
    const aseguradora = await Aseguradora.where({ id }).fetch({ require: false });
    if (!aseguradora) {
      return res.status(404).send();
    }
    const infoSeguros = await aseguradora.related('infoSeguros').orderBy(columna, orden).fetchPage({
      pageSize,
      page
    })
    res.send({ aseguradora, infoSeguros, pagination: infoSeguros.pagination });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

router.get('/aseguradora', auth, async(req, res) => {
  const pageSize = req.query.limit ? parseInt(req.query.limit) : 10;
  const page = req.query.skip ? parseInt(req.query.skip) : 1;
  const columnasValidas = ['id', 'aseguradora'];
  const columna = req.query.columna ? (columnasValidas.includes(req.query.columna) ? req.query.columna : 'aseguradora') : 'aseguradora';
  const orden = req.query.orden ? req.query.orden : 'ASC';
  try {
    const aseguradoras = await new Aseguradora().orderBy(columna, orden).fetchPage({
      pageSize,
      page
    });
    res.send({ aseguradoras, pagination: aseguradoras.pagination });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

router.patch('/aseguradora/:id', auth, async(req, res) => {
  const actualizaciones = Object.keys(req.body);
  const actualizacionesPermitidas = ['aseguradora'];
  const isOperacionValida = actualizaciones.every((actualizacion) => actualizacionesPermitidas.includes(actualizacion));

  if (!isOperacionValida) {
    return res.status(400).send({ error: "actualizaciones invalidas!" });
  }
  try {
    const aseguradora = await Aseguradora.findOne({ id: req.params.id }, { require: false });
    if (!aseguradora) {
      return res.status(404).send();
    }
    actualizaciones.forEach((actualizacion) => aseguradora.set(actualizacion, req.body[actualizacion]));
    await aseguradora.save();
    res.send(aseguradora);
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

router.delete('/aseguradora/:id', auth, async(req, res) => {
  try {
    const aseguradora = await Aseguradora.findOne({ id: req.params.id }, { require: false });
    if (!aseguradora) {
      return res.status(404).send();
    }
    await aseguradora.destroy();
    res.send(aseguradora);
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

module.exports = router;
