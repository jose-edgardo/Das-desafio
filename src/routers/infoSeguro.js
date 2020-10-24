const express = require('express');
const InfoSeguro = require('../modelos/infoSeguro');
const auth = require('../middleware/auth');

const router = new express.Router();

router.post('/infoseguro', auth, async(req, res) => {
  try {
    const infoSeguro = new InfoSeguro(req.body);
    infoSeguro.set('usuario_id', req.usuario.get('id'));
    await infoSeguro.save();
    res.status(201).send({ infoSeguro });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

router.get('/infoseguro/:id', auth, async(req, res) => {
  const id = req.params.id;
  try {
    const infoSeguro = await InfoSeguro.where({ id }).fetch({ withRelated: ['usuario', 'aseguradora'], require: false });
    if (!infoSeguro) {
      return res.status(404).send();
    }
    res.send({ infoSeguro });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

router.get('/infoseguro', auth, async(req, res) => {
  try {
    const infoSeguro = await InfoSeguro.where({ usuario_id: req.usuario.get('id') }).fetch({ withRelated: ['usuario', 'aseguradora'], require: false });
    if (!infoSeguro) {
      return res.status(404).send();
    }
    res.send({ infoSeguro });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

router.patch('/infoseguro', auth, async(req, res) => {
  const actualizaciones = Object.keys(req.body);
  const actualizacionesPermitidas = ['numero_identificador', 'fecha_vigencia', 'aseguradora_id'];
  const isOperacionValida = actualizaciones.every((actualizacion) => actualizacionesPermitidas.includes(actualizacion));

  if (!isOperacionValida) {
    return res.status(400).send({ error: "actualizaciones invalidas!" });
  }
  try {
    const infoSeguro = await InfoSeguro.findOne({ usuario_id: req.usuario.get('id') }, { require: false });
    if (!infoSeguro) {
      return res.status(404).send();
    }
    actualizaciones.forEach((actualizacion) => infoSeguro.set(actualizacion, req.body[actualizacion]));
    await infoSeguro.save();
    res.send(infoSeguro);
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

router.delete('/infoseguro', auth, async(req, res) => {
  try {
    const infoSeguro = await InfoSeguro.findOne({ usuario_id: req.usuario.get('id') }, { require: false });
    if (!infoSeguro) {
      return res.status(404).send();
    }
    await infoSeguro.destroy();
    res.send(infoSeguro);
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

module.exports = router;
