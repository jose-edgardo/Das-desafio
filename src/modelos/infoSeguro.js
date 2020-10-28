const Joi = require('joi');
const bookshelf = require('../db/bookshelf');
const Aseguradora = require('./aseguradora');
const Usuario = require('./usuario');
bookshelf.plugin(require('bookshelf-modelbase').pluggable);

const schema = Joi.object({
  id: Joi.optional(),
  numero_identificador: Joi.number().required(),
  fecha_vigencia: Joi.date().required(),
  aseguradora_id: Joi.number().required(),
  usuario_id: Joi.number().required(),
});

const InfoSeguro = bookshelf.model('InfoSeguro', {
  tableName: 'info_seguro',
  hasTimestamps: false,
  aseguradora() {
    return this.belongsTo('Aseguradora', 'aseguradora_id');
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
      const existeNumeroIdentificador = await InfoSeguro.findOne({ numero_identificador: model.get('numero_identificador') }, { require: false });
      if (existeNumeroIdentificador) {
        throw new Error('Numero identificador ya esta registrado');
      }
      const existeUsuarioId = await InfoSeguro.findOne({ usuario_id: model.get('usuario_id') }, { require: false });
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
        const existeUsuarioId = await InfoSeguro.findOne({ usuario_id: model.get('usuario_id') }, { require: false });
        if (existeUsuarioId) {
          throw new Error('Ya existe un registro de informacion de seguro para este usuario');
        }
      }

      if (this.hasChanged('numero_identificador')) {
        const existeNumeroIdentificador = await InfoSeguro.findOne({ numero_identificador: model.get('numero_identificador') }, { require: false });
        if (existeNumeroIdentificador) {
          throw new Error('Numero identificador ya esta registrado');
        }
      }
    });
  },
});

module.exports = InfoSeguro;
