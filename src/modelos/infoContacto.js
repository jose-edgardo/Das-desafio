const Joi = require('joi');
const bookshelf = require('../db/bookshelf');
const Municipio = require('./municipio');
const Usuario = require('./usuario');
bookshelf.plugin(require('bookshelf-modelbase').pluggable);

const schema = Joi.object({
  id: Joi.optional(),
  dirreccion: Joi.string().trim().lowercase().required(),
  telefono: Joi.string().required().regex(/^\d{4}-\d{4}$/)
    .error(new Error('Ingrese un numero telefonico valido')),
  municipio_id: Joi.number().required(),
  usuario_id: Joi.number().required(),
});

const InfoContacto = bookshelf.model('InfoContacto', {
  tableName: 'info_contacto',
  hasTimestamps: false,
  municipio() {
    return this.belongsTo('Municipio', 'municipio_id');
  },
  usuario() {
    return this.belongsTo('Usuario', 'usuario_id');
  },
  initialize() {
    this.on('creating', async (model, atributos) => {
      const camposValidos = schema.validate(atributos);
      if (camposValidos.error) {
        throw new Error(camposValidos.error.message);
      }
      this.set(camposValidos.value);
      const existeUsuarioId = await InfoContacto.findOne({ usuario_id: model.get('usuario_id') }, { require: false });
      if (existeUsuarioId) {
        throw new Error('Ya existe un registro de informacion de contacto para este usuario');
      }
    });

    this.on('updating', async (model, atributos) => {
      const camposValidos = schema.validate(atributos);
      if (camposValidos.error) {
        throw new Error(camposValidos.error.message);
      }
      this.set(camposValidos.value);
      if (this.hasChanged('usuario_id')) {
        const existeUsuarioId = await InfoContacto.findOne({ usuario_id: model.get('usuario_id') }, { require: false });
        if (existeUsuarioId) {
          throw new Error('Ya existe un registro de informacion de contacto para este usuario');
        }
      }
    });
  },
});

module.exports = InfoContacto;
