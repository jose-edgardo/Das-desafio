const express = require('express');
const InfoContacto = require('../modelos/infoContacto');
const auth = require('../middleware/auth');

const router = new express.Router();

router.post('/infocontacto', auth, async (req, res) => {
  try {
    const infoContacto = new InfoContacto(req.body);
    infoContacto.set('usuario_id', req.usuario.get('id'));
    await infoContacto.save();
    res.status(201).send({ infoContacto });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

router.get('/infocontacto/:id', auth, async (req, res) => {
  const { id } = req.params;
  try {
    // Book.where({id: 1}).fetch({withRelated: ['author']}).then((book) => {console.log(JSON.stringify(book.related('author'))) })
    const infoContacto = await InfoContacto.where({ id }).fetch({ withRelated: ['usuario'], require: false });
    if (!infoContacto) {
      return res.status(404).send();
    }
    await infoContacto.related('municipio').fetch({ withRelated: ['departamento'] });
    res.send({ infoContacto });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

router.get('/infocontacto', auth, async (req, res) => {
  try {
    const infoContacto = await InfoContacto.where({ usuario_id: req.usuario.get('id') }).fetch({ withRelated: ['usuario'], require: false });
    if (!infoContacto) {
      return res.status(404).send();
    }
    await infoContacto.related('municipio').fetch({ withRelated: ['departamento'] });
    res.send({ infoContacto });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

router.patch('/infocontacto', auth, async (req, res) => {
  const actualizaciones = Object.keys(req.body);
  const actualizacionesPermitidas = ['dirreccion', 'telefono', 'municipio_id'];
  const isOperacionValida = actualizaciones.every((actualizacion) => actualizacionesPermitidas.includes(actualizacion));

  if (!isOperacionValida) {
    return res.status(400).send({ error: 'actualizaciones invalidas!' });
  }
  try {
    const infocontacto = await InfoContacto.findOne({ usuario_id: req.usuario.get('id') }, { require: false });
    if (!infocontacto) {
      return res.status(404).send();
    }
    actualizaciones.forEach((actualizacion) => infocontacto.set(actualizacion, req.body[actualizacion]));
    await infocontacto.save();
    res.send(infocontacto);
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

module.exports = router;
