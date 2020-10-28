const jwt = require('jsonwebtoken');
const Usuario = require('../../src/modelos/usuario');
const Departamento = require('../../src/modelos/departamento');
const Municipio = require('../../src/modelos/municipio');
const InfoContacto = require('../../src/modelos/infoContacto');
const Aseguradora = require('../../src/modelos/aseguradora');
const InfoSeguro = require('../../src/modelos/infoSeguro');
const InfoSalud = require('../../src/modelos/infoSalud');

const usuarioUno = {
  correo: 'mike@test.com',
  contrasena: 'mike12345',
  tokens: []
}

const usuarioDos = {
  correo: 'juan@test.com',
  contrasena: 'juan12345',
  tokens: []
}

const usuarioTres = {
  correo: 'matias@test.com',
  contrasena: 'matias12345',
  tokens: []
}

const departamentoUno = {
  departamento: 'san vicente'
}

const departamentoDos = {
  departamento: 'morazan'
}

const municipioUno = {
  municipio: 'san sebastian',
  departamento_id: 0
}

const infoContactoUno = {
  dirreccion: 'calle 2 de diciembre',
  telefono: '2345-6978',
  municipio_id: 0,
  usuario_id: 0
}

const aseguradoraUno = {
  aseguradora: 'la luz'
}

const aseguradoraDos = {
  aseguradora: 'lider c'
}

const infoSeguroUno = {
  numero_identificador: 1,
  fecha_vigencia: '2025-10-4',
  aseguradora_id: 0,
  usuario_id: 0,
}

const infoSeguroDos = {
  numero_identificador: 2,
  fecha_vigencia: '2020-11-4',
  aseguradora_id: 0,
  usuario_id: 0,
}

const infoSaludUno = {
  alergias_a_medicinas: ['Iboprofeno', 'tiamina'],
  condiciones_salud: 'miopia',
  medicacion: ['Cetirizina ', 'Levocetirizina '],
  usuario_id: 0
}

const infoSaludDos = {
  alergias_a_medicinas: ['loratadina ', 'histamina'],
  condiciones_salud: 'piel sensible',
  medicacion: ['acetaminofen '],
  usuario_id: 0
}

const setupDatabase = async() => {
  await InfoContacto.where('id', '!=', 0).destroy({ require: false });
  await InfoSeguro.where('id', '!=', 0).destroy({ require: false });
  await InfoSalud.where('id', '!=', 0).destroy({ require: false });
  await Usuario.where('id', '!=', 0).destroy({ require: false });
  await Municipio.where('id', '!=', 0).destroy({ require: false });
  await Departamento.where('id', '!=', 0).destroy({ require: false });
  await Aseguradora.where('id', '!=', 0).destroy({ require: false });
  const user1 = await new Usuario(usuarioUno).save();
  Usuario.generarAuthToken(user1.get('id'));
  const user2 = await new Usuario(usuarioDos).save();
  Usuario.generarAuthToken(user2.get('id'));
  await new Departamento(departamentoDos).save();
  const departamento = await new Departamento(departamentoUno).save();
  municipioUno.departamento_id = departamento.get('id');
  const municipio = await new Municipio(municipioUno).save();
  infoContactoUno.municipio_id = municipio.get('id');
  infoContactoUno.usuario_id = user1.get('id');
  await new InfoContacto(infoContactoUno).save();
  const aseguradora1 = await new Aseguradora(aseguradoraUno).save();
  const aseguradora2 = await new Aseguradora(aseguradoraDos).save();
  infoSeguroUno.aseguradora_id = aseguradora1.get('id');
  infoSeguroUno.usuario_id = user1.get('id');
  await new InfoSeguro(infoSeguroUno).save();
  infoSaludUno.usuario_id = user1.get('id');
  await new InfoSalud(infoSaludUno).save();

}

module.exports = {
  usuarioUno,
  usuarioDos,
  departamentoUno,
  departamentoDos,
  municipioUno,
  infoContactoUno,
  aseguradoraUno,
  aseguradoraDos,
  infoSeguroUno,
  infoSeguroDos,
  infoSaludUno,
  infoSaludDos,
  setupDatabase,
}
