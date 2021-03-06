const express = require('express');
const Departamento = require('../modelos/departamento');
const auth = require('../middleware/auth');

const router = new express.Router();

router.post('/departamento', auth, async (req, res) => {
  try {
    const departamento = new Departamento(req.body);
    await departamento.save();
    res.status(201).send({ departamento });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

router.get('/departamento/:id', auth, async (req, res) => {
  const { id } = req.params;
  const pageSize = req.query.limit ? parseInt(req.query.limit) : 10;
  const page = req.query.skip ? parseInt(req.query.skip) : 1;
  const columnasValidas = ['id', 'municipio'];
  const columna = req.query.columna ? (columnasValidas.includes(req.query.columna) ? req.query.columna : 'municipio') : 'municipio';
  const orden = req.query.orden ? req.query.orden : 'ASC';
  try {
    const departamento = await Departamento.where({ id }).fetch({ require: false });
    if (!departamento) {
      return res.status(404).send();
    }
    const municipios = await departamento.related('municipios').orderBy(columna, orden).fetchPage({
      pageSize,
      page,
    });
    res.send({ departamento, municipios, pagination: municipios.pagination });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

router.get('/departamento', auth, async (req, res) => {
  const pageSize = req.query.limit ? parseInt(req.query.limit) : 10;
  const page = req.query.skip ? parseInt(req.query.skip) : 1;
  const columnasValidas = ['id', 'departamento'];
  const columna = req.query.columna ? (columnasValidas.includes(req.query.columna) ? req.query.columna : 'departamento') : 'departamento';
  const orden = req.query.orden ? req.query.orden : 'ASC';
  try {
    const departamentos = await new Departamento().orderBy(columna, orden).fetchPage({
      pageSize,
      page,
    });
    res.send({ departamentos, pagination: departamentos.pagination });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

router.patch('/departamento/:id', auth, async (req, res) => {
  const actualizaciones = Object.keys(req.body);
  const actualizacionesPermitidas = ['departamento'];
  const isOperacionValida = actualizaciones.every((actualizacion) => actualizacionesPermitidas.includes(actualizacion));

  if (!isOperacionValida) {
    return res.status(400).send({ error: 'actualizaciones invalidas!' });
  }
  try {
    const departamento = await Departamento.findOne({ id: req.params.id }, { require: false });
    if (!departamento) {
      return res.status(404).send();
    }
    actualizaciones.forEach((actualizacion) => departamento.set(actualizacion, req.body[actualizacion]));
    await departamento.save();
    res.send(departamento);
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

// router.delete('/departamento/:id', auth, async(req, res) => {
//   try {
//     const departamento = await Departamento.findOne({ id: req.params.id }, { require: false });
//     if (!departamento) {
//       return res.status(404).send();
//     }
//     await departamento.destroy();
//     res.send(departamento);
//   } catch (err) {
//     res.status(400).send({ error: err.message });
//   }
// });

module.exports = router;
