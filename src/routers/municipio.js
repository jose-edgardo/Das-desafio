const express = require('express');
const Municipio = require('../modelos/municipio');
const auth = require('../middleware/auth');

const router = new express.Router();

router.post('/municipio', auth, async(req, res) => {
  try {
    const municipio = new Municipio(req.body);
    await municipio.save();
    res.status(201).send({ municipio });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

router.get('/municipio/:id', auth, async(req, res) => {
  const id = req.params.id;
  try {
    const municipio = await Municipio.where({ id }).fetch({ withRelated: ['departamento'] });
    if (!municipio) {
      return res.status(404).send();
    }
    res.send(municipio);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

router.get('/municipio', auth, async(req, res) => {
  const pageSize = req.query.limit ? parseInt(req.query.limit) : 10;
  const page = req.query.skip ? parseInt(req.query.skip) : 1;
  const columnasValidas = ['id', 'municipio'];
  const columna = req.query.columna ? (columnasValidas.includes(req.query.columna) ? req.query.columna : 'municipio') : 'municipio';
  const orden = req.query.orden ? req.query.orden : 'ASC';
  try {
    const municipios = await new Municipio().orderBy(columna, orden).fetchPage({
      pageSize,
      page,
      withRelated: ['departamento']
    });
    res.send({ municipios, pagination: municipios.pagination });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

router.patch('/municipio/:id', auth, async(req, res) => {
  const actualizaciones = Object.keys(req.body);
  const actualizacionesPermitidas = ['municipio', 'departamento_id'];
  const isOperacionValida = actualizaciones.every((actualizacion) => actualizacionesPermitidas.includes(actualizacion));

  if (!isOperacionValida) {
    return res.status(400).send({ error: "actualizaciones invalidas!" });
  }
  try {
    const municipio = await Municipio.findOne({ id: req.params.id }, { require: false });
    if (!municipio) {
      return res.status(404).send();
    }
    actualizaciones.forEach((actualizacion) => municipio.set(actualizacion, req.body[actualizacion]));
    await municipio.save();
    res.send(municipio);
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

router.delete('/municipio/:id', auth, async(req, res) => {
  try {
    const municipio = await Municipio.findOne({ id: req.params.id }, { require: false });
    if (!municipio) {
      return res.status(404).send();
    }
    await municipio.destroy();
    res.send(municipio);
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

module.exports = router;
