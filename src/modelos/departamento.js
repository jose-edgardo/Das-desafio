const Joi = require('joi');
const bookshelf = require('../db/bookshelf');
const ModelBase = require('bookshelf-modelbase')(bookshelf);
const Municipio = require('./municipio')

const schema = Joi.object({
  id: Joi.optional(),
  departamento: Joi.string().trim().lowercase().required(),
});

const Departamento = ModelBase.extend({
  tableName: "departamento",
  hasTimestamps: false,
  municipios() {
    return this.hasMany(Municipio);
  },
  initialize() {
    this.on('creating', async(model, atributos) => {
      const camposValidos = schema.validate(atributos);
      if (camposValidos.error) {
        throw new Error(camposValidos.error.message);
      }
      this.set(camposValidos.value);
      const existeDepartamento = await Departamento.findOne({ departamento: model.get('departamento') }, { require: false });
      if (existeDepartamento) {
        throw new Error('Departamento ya esta registrado')
      }
    });
  }
});

module.exports = Departamento;
