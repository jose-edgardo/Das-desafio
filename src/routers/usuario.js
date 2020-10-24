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

router.post('/usuario', async(req, res) => {
  try {
    const usuario = new Usuario(req.body);
    await usuario.save();
    const token = await Usuario.generarAuthToken(usuario);
    res.status(201).send({ usuario, token });
  } catch (err) {
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

router.post('/usuario/logout', auth, async(req, res) => {
  try {
    req.usuario.set('tokens', req.usuario.get('tokens').filter((token) => req.token !== token));
    await req.usuario.save();
    res.send(req.usuario.get('tokens'));
  } catch (error) {
    res.status(500).send();
  }
});

router.post('/usuario/logoutAll', auth, async(req, res) => {
  try {
    req.usuario.set('tokens', []);
    await req.usuario.save();
    res.send();
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get('/usuario', async(req, res) => {
  const pageSize = req.query.limit ? parseInt(req.query.limit) : 10;
  const page = req.query.skip ? parseInt(req.query.skip) : 1;
  try {
    const usuarios = await Usuario.fetchPage({
      pageSize,
      page
    });
    res.send({ usuarios, pagination: usuarios.pagination });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.get('/usuario/me', auth, async(req, res) => {
  try {
    infoContacto = await req.usuario.related('infoContacto').fetch();
    await infoContacto.related('municipio').fetch({ withRelated: ['departamento'] });
    infoSeguro = await req.usuario.related('infoSeguro').fetch({ withRelated: ['aseguradora'] });
    infoSalud = await req.usuario.related('infoSalud').fetch();
    res.send({ usuario: req.usuario, infoContacto, infoSeguro, infoSalud });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

router.patch('/usuario/me', auth, async(req, res) => {
  const actualizaciones = Object.keys(req.body);
  const actualizacionesPermitidas = ['correo', 'contrasena'];
  const isOperacionValida = actualizaciones.every((actualizacion) => actualizacionesPermitidas.includes(actualizacion));

  if (!isOperacionValida) {
    return res.status(400).send({ error: "actualizaciones invalidas!" });
  }
  try {
    req.usuario;
    actualizaciones.forEach((actualizacion) => req.usuario.set(actualizacion, req.body[actualizacion]));
    //await Usuario.preActualizar(usuario);
    await req.usuario.save();
    res.send(req.usuario);
  } catch (err) {
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
  req.usuario.set('fotografia', buffer);
  await req.usuario.save();
  //await Usuario.update({ fotografia: buffer }, { id: req.usuario.get('id') });
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
  //const modificado = await Usuario.update({ fotografia: '' }, { id: req.usuario.get('id') });
  req.usuario.set('fotografia', '');
  await req.usuario.save();
  res.send();
}, (error, req, res, next) => {
  res.status(400).send({ error: error.message })
});

module.exports = router;
