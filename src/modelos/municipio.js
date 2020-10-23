const Joi = require('joi');
const bookshelf = require('../db/bookshelf');
//const ModelBase = require('bookshelf-modelbase')(bookshelf);
const Departamento = require('./departamento');
const InfoContacto = require('./infoContacto');
bookshelf.plugin(require('bookshelf-modelbase').pluggable);

const schema = Joi.object({
  id: Joi.optional(),
  municipio: Joi.string().trim().lowercase().required(),
  departamento_id: Joi.number().required(),
});

const Municipio = bookshelf.model('Municipio', {
  tableName: "municipio",
  hasTimestamps: false,
  departamento() {
    return this.belongsTo('Departamento', 'departamento_id');
  },
  infoContacto() {
    return this.hasMany('InfoContacto');
  },
  initialize() {
    this.on('creating', async(model, atributos) => {
      const camposValidos = schema.validate(atributos);
      if (camposValidos.error) {
        throw new Error(camposValidos.error.message);
      }
      this.set(camposValidos.value);
      const existeMunicipio = await Municipio.findOne({ municipio: model.get('municipio') }, { require: false });
      if (existeMunicipio) {
        throw new Error('Municipio ya esta registrado')
      }
    });

    this.on('updating', async(model, atributos) => {
      const camposValidos = schema.validate(atributos);
      if (camposValidos.error) {
        throw new Error(camposValidos.error.message);
      }
      this.set(camposValidos.value);
      if (this.hasChanged('municipio')) {
        const existeMunicipio = await Municipio.findOne({ municipio: model.get('municipio') }, { require: false });
        if (existeMunicipio) {
          throw new Error('Municipio ya esta registrado')
        }
      }
    });
  }
});

module.exports = Municipio;
