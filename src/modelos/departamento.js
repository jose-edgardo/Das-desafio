const Joi = require('joi');
const bookshelf = require('../db/bookshelf');
// const ModelBase = require('bookshelf-modelbase')(bookshelf);
const Municipio = require('./municipio');
bookshelf.plugin(require('bookshelf-modelbase').pluggable);

const schema = Joi.object({
  id: Joi.optional(),
  departamento: Joi.string().trim().lowercase().required(),
});

const Departamento = bookshelf.model('Departamento', {
  tableName: 'departamento',
  hasTimestamps: false,
  municipios() {
    return this.hasMany('Municipio');
  },
  initialize() {
    this.on('creating', async (model, atributos) => {
      const camposValidos = schema.validate(atributos);
      if (camposValidos.error) {
        throw new Error(camposValidos.error.message);
      }
      this.set(camposValidos.value);
      const existeDepartamento = await Departamento.findOne({ departamento: model.get('departamento') }, { require: false });
      if (existeDepartamento) {
        throw new Error('Departamento ya esta registrado');
      }
    });

    this.on('updating', async (model, atributos) => {
      const camposValidos = schema.validate(atributos);
      if (camposValidos.error) {
        throw new Error(camposValidos.error.message);
      }
      this.set(camposValidos.value);
      if (this.hasChanged('departamento')) {
        const existeDepartamento = await Departamento.findOne({ departamento: model.get('departamento') }, { require: false });
        if (existeDepartamento) {
          throw new Error('Departamento ya esta registrado');
        }
      }
    });
  },
});

module.exports = Departamento;
