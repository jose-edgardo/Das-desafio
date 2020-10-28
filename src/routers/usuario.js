const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const request = require('request-promise');
const Usuario = require('../modelos/usuario');
const auth = require('../middleware/auth');

const upload = multer({
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('Solo archivos jpg, jpeg, png'));
    }
    cb(undefined, true);
  },
});

const router = new express.Router();

// Inicio de sesion
router.post('/usuario/login', async (req, res) => {
  try {
    const usuario = await Usuario.iniciarSesion(req.body.correo, req.body.contrasena);
    usuario.set('status', true);
    const token = await Usuario.generarAuthToken(usuario.get('id'));
    res.send({ usuario, token });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

router.get('/usuario/oauth/facebook', (req, res) => {
  const url = 'https://www.facebook.com/v8.0/dialog/oauth?client_id=1051721248600447&redirect_uri=http://localhost:3000/usuario/login/facebook&scope=email&response_type=code&auth_type=rerequest';
  res.send({ url });
});

router.get('/usuario/login/facebook', async (req, res) => {
  const url = `https://graph.facebook.com/v8.0/oauth/access_token?client_id=${process.env.CLIENT_ID}&redirect_uri=http://localhost:3000/usuario/login/facebook&client_secret=${process.env.CLIENT_SECRET}&code=${req.query.code}`;
  try {
    const tokenAccess = await request({ url, json: true });
    const url2 = `https://graph.facebook.com/me?fields=id,name,email&access_token=${tokenAccess.access_token}`;
    const datosUsuario = await request({ url: url2, json: true });
    let usuario = await Usuario.findOne({ correo: datosUsuario.email }, { require: false });
    if (!usuario) {
      usuario = new Usuario({ correo: datosUsuario.email });
      usuario.set('contrasena', tokenAccess.access_token);
      await usuario.save();
    }
    usuario.set('status', true);
    const token = await Usuario.generarAuthToken(usuario.get('id'));
    res.send({ usuario, token });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

router.post('/usuario/logout', auth, async (req, res) => {
  try {
    req.usuario.set('tokens', req.usuario.get('tokens').filter((token) => req.token !== token));
    await req.usuario.save();
    res.send();
  } catch (error) {
    res.status(500).send();
  }
});

router.post('/usuario/logoutAll', auth, async (req, res) => {
  try {
    req.usuario.set('tokens', []);
    await req.usuario.save();
    res.send();
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post('/usuario', async (req, res) => {
  try {
    const usuario = new Usuario(req.body);
    await usuario.save();
    const token = await Usuario.generarAuthToken(usuario.get('id'));
    res.status(201).send({ usuario, token });
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

router.get('/usuario', auth, async (req, res) => {
  const pageSize = req.query.limit ? parseInt(req.query.limit) : 10;
  const page = req.query.skip ? parseInt(req.query.skip) : 1;
  const columnasValidas = ['id', 'correo', 'status'];
  const columna = req.query.columna ? (columnasValidas.includes(req.query.columna) ? req.query.columna : 'status') : 'status';
  const orden = req.query.orden ? req.query.orden : 'ASC';
  try {
    const usuarios = await new Usuario().orderBy(columna, orden).fetchPage({
      pageSize,
      page,
    });
    res.send({ usuarios, pagination: usuarios.pagination });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.get('/usuario/me', auth, async (req, res) => {
  try {
    const infoContacto = await req.usuario.related('infoContacto').fetch({ require: false });
    if (infoContacto) {
      await infoContacto.related('municipio').fetch({ withRelated: ['departamento'] });
    }
    const infoSeguro = await req.usuario.related('infoSeguro').fetch({ withRelated: ['aseguradora'], require: false });
    const infoSalud = await req.usuario.related('infoSalud').fetch({ require: false });
    res.send({
      usuario: req.usuario,
      infoContacto,
      infoSeguro,
      infoSalud,
    });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

router.get('/usuario/:id', auth, async (req, res) => {
  try {
    const usuario = await Usuario.findOne({ id: req.params.id }, { require: false });
    if (!usuario) {
      return res.status(404).send();
    }
    const infoContacto = await usuario.related('infoContacto').fetch({ require: false });
    if (infoContacto) {
      await infoContacto.related('municipio').fetch({ withRelated: ['departamento'] });
    }
    const infoSeguro = await usuario.related('infoSeguro').fetch({ withRelated: ['aseguradora'], require: false });
    const infoSalud = await usuario.related('infoSalud').fetch({ require: false });
    res.send({
      usuario,
      infoContacto,
      infoSeguro,
      infoSalud,
    });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

router.patch('/usuario/me', auth, async (req, res) => {
  const actualizaciones = Object.keys(req.body);
  const actualizacionesPermitidas = ['correo', 'contrasena'];
  const isOperacionValida = actualizaciones.every((actualizacion) => actualizacionesPermitidas.includes(actualizacion));

  if (!isOperacionValida) {
    return res.status(400).send({ error: 'actualizaciones invalidas!' });
  }
  try {
    actualizaciones.forEach((actualizacion) => req.usuario.set(actualizacion, req.body[actualizacion]));
    await req.usuario.save();
    res.send(req.usuario);
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

router.delete('/usuario/me/low', auth, async (req, res) => {
  try {
    req.usuario.set('status', false);
    req.usuario.set('tokens', []);
    await req.usuario.save();
    res.send(req.usuario);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

router.post('/usuario/me/avatar', auth, upload.single('avatar'), async (req, res) => {
  const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer();
  req.usuario.set('fotografia', buffer);
  await req.usuario.save();
  // await Usuario.update({ fotografia: buffer }, { id: req.usuario.get('id') });
  res.send();
}, (error, req, res, next) => {
  res.status(400).send({ error: error.message });
});

router.get('/usuario/:id/avatar', async (req, res) => {
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

router.delete('/usuario/me/avatar', auth, async (req, res) => {
  req.usuario.set('fotografia', '');
  await req.usuario.save();
  res.send();
}, (error, req, res, next) => {
  res.status(400).send({ error: error.message });
});

module.exports = router;
