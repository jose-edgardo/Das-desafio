const Joi = require('joi');
const bookshelf = require('../db/bookshelf');
const ModelBase = require('bookshelf-modelbase')(bookshelf);
const Departamento = require('./departamento')

const schema = Joi.object({
  id: Joi.optional(),
  Municipio: Joi.string().trim().lowercase().required(),
});

const Municipio = ModelBase.extend({
  tableName: "municipio",
  hasTimestamps: false,
  departamento() {
    return this.belongsTo(Departamento);
  },
  initialize() {
    this.on('creating', async(model, atributos) => {
      const camposValidos = schema.validate(atributos);
      if (camposValidos.error) {
        throw new Error(camposValidos.error.message);
      }
      this.set(camposValidos.value);
      const existeMunicipio = await this.findOne({ departamento: model.get('municipio') }, { require: false });
      if (existeCorreo) {
        throw new Error('Municipio ya esta registrado')
      }
    });
  }
});

module.exports = Municipio;
