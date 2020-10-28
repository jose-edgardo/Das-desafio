const Joi = require('joi');
const bookshelf = require('../db/bookshelf');
const Usuario = require('./usuario');
bookshelf.plugin(require('bookshelf-modelbase').pluggable);

const schema = Joi.object({
  id: Joi.number(),
  alergias_a_medicinas: Joi.array().items(Joi.string().trim().lowercase()).default([]),
  condiciones_salud: Joi.string().trim().lowercase().empty('')
    .default('')
    .optional(),
  medicacion: Joi.array().items(Joi.string().trim().lowercase()).default([]),
  usuario_id: Joi.number().required(),
});

const InfoSalud = bookshelf.model('InfoSalud', {
  tableName: 'info_salud',
  hasTimestamps: false,
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
      const existeUsuarioId = await InfoSalud.findOne({ usuario_id: model.get('usuario_id') }, { require: false });
      if (existeUsuarioId) {
        throw new Error('Ya existe un registro de informacion de seguro para este usuario');
      }
    });

    this.on('updating', async (model, atributos) => {
      const camposValidos = schema.validate(atributos);
      if (camposValidos.error) {
        throw new Error(camposValidos.error.message);
      }
      this.set(camposValidos.value);
      if (this.hasChanged('usuario_id')) {
        const existeUsuarioId = await InfoSalud.findOne({ usuario_id: model.get('usuario_id') }, { require: false });
        if (existeUsuarioId) {
          throw new Error('Ya existe un registro de informacion de salud para este usuario');
        }
      }
    });
  },
});

module.exports = InfoSalud;
