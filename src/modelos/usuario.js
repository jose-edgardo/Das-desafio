const Joi = require('joi');
const bookshelf = require('../db/bookshelf');
const ModelBase = require('bookshelf-modelbase')(bookshelf);

const schema = Joi.object({
  correo: Joi.string().trim().regex(/^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/)
    .error(new Error('Ingrese un correo valido')),
  contrasena: Joi.string().trim().required(),
});

const Usuario = ModelBase.extend({
  tableName: "usuario",
  hasTimestamps: false,
  initialize() {
    this.on('saving', (model, atributos, opciones) => {
      console.log(schema.validate(atributos))
    });
  }
});

Usuario.create({ correo: 'nuevo' });
// console.log(schema.validate({
//   correo: 'edgar@ues.edu.sv',
//   contrasena: ' ef',
// }));

// const validar = (objeto) => {
//   return schema.validate(objeto)
// }

module.exports = Usuario;
