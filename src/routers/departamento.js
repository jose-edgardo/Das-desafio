const express = require('express');
const Departamento = require('../modelos/departamento');
const auth = require('../middleware/auth');

const router = new express.Router();

router.post('/departamento', auth, async(req, res) => {
  try {
    const departamento = new Departamento(req.body);
    await departamento.save();
    res.status(201).send({ departamento, municipios: departamento.municipios() });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

router.get('/departamento', auth, async(req, res) => {

});

module.exports = router;
