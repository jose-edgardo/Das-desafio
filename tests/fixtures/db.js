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

const setupDatabase = async() => {
  await InfoContacto.where('id', '!=', 0).destroy({ require: false });
  await Usuario.where('id', '!=', 0).destroy({ require: false });
  await Municipio.where('id', '!=', 0).destroy({ require: false });
  await Departamento.where('id', '!=', 0).destroy({ require: false });
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

}

module.exports = {
  usuarioUno,
  usuarioDos,
  departamentoUno,
  departamentoDos,
  municipioUno,
  infoContactoUno,
  setupDatabase,
}
