const express = require('express');
const InfoSalud = require('../modelos/infoSalud');
const auth = require('../middleware/auth');

const router = new express.Router();

router.post('/infosalud', auth, async (req, res) => {
  try {
    const infoSalud = new InfoSalud(req.body);
    infoSalud.set('usuario_id', req.usuario.get('id'));
    await infoSalud.save();
    res.status(201).send({ infoSalud });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

router.get('/infosalud/:id', auth, async (req, res) => {
  const { id } = req.params;
  try {
    const infoSalud = await InfoSalud.where({ id }).fetch({ withRelated: ['usuario'], require: false });
    if (!infoSalud) {
      return res.status(404).send();
    }
    res.send({ infoSalud });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

router.get('/infosalud', auth, async (req, res) => {
  try {
    const infoSalud = await InfoSalud.where({ usuario_id: req.usuario.get('id') }).fetch({ withRelated: ['usuario'], require: false });
    if (!infoSalud) {
      return res.status(404).send();
    }
    res.send({ infoSalud });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

router.patch('/infosalud', auth, async (req, res) => {
  const actualizaciones = Object.keys(req.body);
  const actualizacionesPermitidas = ['alergias_a_medicinas', 'condiciones_salud', 'medicacion'];
  const isOperacionValida = actualizaciones.every((actualizacion) => actualizacionesPermitidas.includes(actualizacion));
  if (!isOperacionValida) {
    return res.status(400).send({ error: 'actualizaciones invalidas!' });
  }
  try {
    const infoSalud = await InfoSalud.findOne({ usuario_id: req.usuario.get('id') }, { require: false });
    if (!infoSalud) {
      return res.status(404).send();
    }
    actualizaciones.forEach((actualizacion) => infoSalud.set(actualizacion, req.body[actualizacion]));
    await infoSalud.save();
    res.send(infoSalud);
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

module.exports = router;
