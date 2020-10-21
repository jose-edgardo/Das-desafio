const express = require('express');
const multer = require('multer')
const Usuario = require('../modelos/usuario');
const auth = require('../middleware/auth');
const sharp = require('sharp');

const upload = multer({
  limits: {
    fileSize: 1000000
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('Solo archivos jpg, jpeg, png'));
    }
    cb(undefined, true)
  }
});

const router = new express.Router();

router.get('/usuario', async(req, res) => {
  try {
    const usuarios = await Usuario.findAll();
    res.send(usuarios);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post('/usuario', async(req, res) => {
  let usuario = req.body;
  try {
    usuario = await Usuario.create(usuario);
    const token = await Usuario.generarAuthToken(usuario);
    res.status(201).send({ usuario, token });
  } catch (err) {
    console.log(err);
    res.status(400).send({ error: err.message });
  }
});

router.post('/usuario/login', async(req, res) => {
  try {
    const usuario = await Usuario.iniciarSesion(req.body.correo, req.body.contrasena);
    const token = await Usuario.generarAuthToken(usuario);
    res.send({ usuario, token })
  } catch (error) {
    res.status(400).send({ error: error.message })
  }
});

router.get('/usuario/me', auth, async(req, res) => {
  res.send(req.usuario);
});

router.patch('/usuario/me', auth, async(req, res) => {
  const actualizaciones = Object.keys(req.body);
  const actualizacionesPermitidas = ['correo', 'contrasena'];
  const isOperacionValida = actualizaciones.every((actualizacion) => actualizacionesPermitidas.includes(actualizacion));

  if (!isOperacionValida) {
    return res.status(400).send({ error: "actualizaciones invalidas!" });
  }
  try {
    const usuario = req.usuario;
    actualizaciones.forEach((actualizacion) => usuario.set(actualizacion, req.body[actualizacion]));
    await Usuario.preActualizar(usuario);
    await Usuario.update(usuario.attributes, { id: usuario.get('id') });
    res.send(usuario);
  } catch (err) {
    console.log(err)
    res.status(400).send({ error: err.message });
  }
});

router.patch('/usuario/me/low', auth, async(req, res) => {
  try {
    const usuario = await Usuario.update({ status: false }, { id: req.usuario.get('id') });
    res.send(usuario);
  } catch (err) {
    res.status(500).send({ error: err.message })
  }
});

router.patch('/usuario/me/high', auth, async(req, res) => {
  try {
    const usuario = await Usuario.update({ status: true }, { id: req.usuario.get('id') });
    res.send(usuario);
  } catch (err) {
    res.status(500).send({ error: err.message })
  }
});

router.post('/usuario/me/avatar', auth, upload.single('avatar'), async(req, res) => {
  const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer();
  await Usuario.update({ fotografia: buffer }, { id: req.usuario.get('id') });
  res.send();
}, (error, req, res, next) => {
  res.status(400).send({ error: error.message });
});

router.get('/usuario/:id/avatar', async(req, res) => {
  try {
    const usuario = await Usuario.findOne({ id: req.params.id }, { require: false });
    if (!usuario || !usuario.get('fotografia')) {
      throw new Error();
    }
    res.set('Content-Type', 'image/png');
    res.send(usuario.get('fotografia'));
  } catch (err) {
    res.status(404).send(err.message);
  }
});

router.delete('/usuario/me/avatar', auth, async(req, res) => {
  const modificado = await Usuario.update({ fotografia: '' }, { id: req.usuario.get('id') });
  res.send();
}, (error, req, res, next) => {
  res.status(400).send({ error: error.message })
});

module.exports = router;
