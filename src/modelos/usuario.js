const Joi = require('joi');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bookshelf = require('../db/bookshelf');
const InfoContacto = require('./infoContacto');
const InfoSeguro = require('./infoSeguro');
const InfoSalud = require('./infoSalud');
bookshelf.plugin(require('bookshelf-modelbase').pluggable);
// const ModelBase = require('bookshelf-modelbase')(bookshelf);

const schema = Joi.object({
  id: Joi.optional(),
  correo: Joi.string().trim().lowercase().regex(/^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/)
    .error(new Error('Ingrese un correo valido')),
  contrasena: Joi.string().trim().required(),
  status: Joi.optional(),
  fotografia: Joi.optional(),
  tokens: Joi.optional(),

});

const Usuario = bookshelf.model('Usuario', {
  tableName: 'usuario',
  hasTimestamps: false,
  visible: ['id', 'correo', 'status', 'fotografia'],
  infoContacto() {
    return this.hasOne('InfoContacto');
  },
  infoSeguro() {
    return this.hasOne('InfoSeguro');
  },
  infoSalud() {
    return this.hasOne('InfoSalud');
  },
  initialize() {
    this.on('creating', async (model, atributos) => {
      const camposValidos = schema.validate(atributos);
      if (camposValidos.error) {
        throw new Error(camposValidos.error.message);
      }
      this.set(camposValidos.value);
      const existeCorreo = await Usuario.findOne({ correo: model.get('correo') }, { require: false });
      if (existeCorreo) {
        throw new Error('Correo electronico ya esta registrado');
      }
      this.set('contrasena', await bcrypt.hash(this.get('contrasena'), 8));
      this.set('tokens', []);
    });

    this.on('updating', async (model, atributos) => {
      const camposValidos = schema.validate(atributos);
      if (camposValidos.error) {
        throw new Error(camposValidos.error.message);
      }
      this.set(camposValidos.value);
      if (this.hasChanged('correo')) {
        const existeCorreo = await Usuario.findOne({ correo: model.get('correo') }, { require: false });
        if (existeCorreo) {
          throw new Error('Correo electronico ya esta registrado!');
        }
      }
      if (this.hasChanged('contrasena')) {
        this.set('contrasena', await bcrypt.hash(this.get('contrasena'), 8));
      }
    });
  },
}, {
  generarAuthToken: async (id) => {
    const usuario = await Usuario.findOne({ id }, { require: false });
    const token = jwt.sign({ _id: usuario.get('id') }, process.env.JWT_SECRET, { expiresIn: '7 days' });
    usuario.set('tokens', usuario.get('tokens').concat(token));
    await usuario.save();
    return token;
  },
  iniciarSesion: async (correo, contrasena) => {
    const usuario = await Usuario.findOne({ correo: correo.toLowerCase() }, { require: false });
    if (!usuario) {
      throw new Error('Datos incorrectos');
    }
    const isMatch = await bcrypt.compare(contrasena, usuario.get('contrasena'));
    if (!isMatch) {
      throw new Error('Datos incorrectos!');
    }
    return usuario;
  },
  preActualizar: async (usuario) => {
    const camposValidos = schema.validate(usuario.attributes);
    if (camposValidos.error) {
      throw new Error(camposValidos.error.message);
    }
    usuario.set(camposValidos.value);
    if (usuario.hasChanged('correo')) {
      const existeCorreo = await Usuario.findOne({ correo: usuario.get('correo') }, { require: false });
      if (existeCorreo) {
        throw new Error('Correo electronico ya esta registrado');
      }
    }
    if (usuario.hasChanged('contrasena')) {
      usuario.set('contrasena', await bcrypt.hash(usuario.get('contrasena'), 8));
    }
    return usuario;
  },
});

module.exports = Usuario;
