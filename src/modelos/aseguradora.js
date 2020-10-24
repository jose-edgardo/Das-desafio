const Joi = require('joi');
const bookshelf = require('../db/bookshelf');
const InfoSeguro = require('./infoSeguro')
bookshelf.plugin(require('bookshelf-modelbase').pluggable);

const schema = Joi.object({
  id: Joi.optional(),
  aseguradora: Joi.string().trim().lowercase().required(),
});

const Aseguradora = bookshelf.model('Aseguradora', {
  tableName: "aseguradora",
  hasTimestamps: false,
  infoSeguros() {
    return this.hasMany('InfoSeguro');
  },
  initialize() {
    this.on('creating', async(model, atributos) => {
      const camposValidos = schema.validate(atributos);
      if (camposValidos.error) {
        throw new Error(camposValidos.error.message);
      }
      this.set(camposValidos.value);
      const existeAseguradora = await Aseguradora.findOne({ aseguradora: model.get('aseguradora') }, { require: false });
      if (existeAseguradora) {
        throw new Error('Aseguradora ya esta registrada')
      }
    });

    this.on('updating', async(model, atributos) => {
      const camposValidos = schema.validate(atributos);
      if (camposValidos.error) {
        throw new Error(camposValidos.error.message);
      }
      this.set(camposValidos.value);
      if (this.hasChanged('aseguradora')) {
        const existeAseguradora = await Aseguradora.findOne({ aseguradora: model.get('aseguradora') }, { require: false });
        if (existeAseguradora) {
          throw new Error('Aseguradora ya esta registrada')
        }
      }

    });
  }
});

module.exports = Aseguradora;
