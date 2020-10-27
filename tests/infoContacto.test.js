const request = require('supertest');

const app = require('../src/app');
const Usuario = require('../src/modelos/usuario');
const Departamento = require('../src/modelos/departamento');
const Municipio = require('../src/modelos/municipio');
const InfoContacto = require('../src/modelos/infoContacto');
const { usuarioUno, usuarioDos, departamentoUno, departamentoDos, municipioUno, infoContactoUno, setupDatabase } = require('./fixtures/db');

beforeEach(setupDatabase)

test('Registro de infoContacto', async() => {
  const usuario = await Usuario.findOne({ correo: usuarioDos.correo }, { require: false });
  const municipio = await Municipio.findOne({ municipio: municipioUno.municipio }, { require: false });
  const respuesta = await request(app)
    .post('/infocontacto')
    .set('Authorization', `Bearer ${usuario.get('tokens')[0]}`)
    .send({
      dirreccion: 'calle hacia el molino',
      telefono: '2225-6978',
      municipio_id: municipio.get('id')
    }).expect(201);

  //La base de datos se cambio correctamente
  const infoContacto = await InfoContacto.findOne({ usuario_id: respuesta.body.infoContacto.usuario_id }, { require: false });
  expect(infoContacto).not.toBeNull();

  //usuario ya tiene un registro previo
  await request(app)
    .post('/infocontacto')
    .set('Authorization', `Bearer ${usuario.get('tokens')[0]}`)
    .send({
      dirreccion: 'avenida hacia el molino',
      telefono: '2525-6978',
      municipio_id: municipio.get('id'),
      usuario_id: usuario.get('id')
    }).expect(400);

  //sin estar autenticado
  await request(app)
    .post('/infocontacto')
    .send({
      dirreccion: 'calle hacia el molino',
      telefono: '2225-6978',
      municipio_id: municipio.get('id')
    }).expect(401);
});

test('Obtener datos de infoContacto', async() => {
  const usuario = await Usuario.findOne({ correo: usuarioUno.correo }, { require: false });
  const infoContacto = await InfoContacto.findOne({ usuario_id: usuario.get('id') }, { require: false });
  await request(app)
    .get('/infocontacto/' + infoContacto.get('id'))
    .set('Authorization', `Bearer ${usuario.get('tokens')[0]}`)
    .send()
    .expect(200);

  //Get por el id del usuario autenticado
  await request(app)
    .get('/infocontacto')
    .set('Authorization', `Bearer ${usuario.get('tokens')[0]}`)
    .send()
    .expect(200);

  //Obtener datos sin estar autenticado
  await request(app)
    .get('/infocontacto/' + infoContacto.get('id'))
    .send()
    .expect(401);
  //
  await request(app)
    .get('/infocontacto')
    .send()
    .expect(401);
});

test('Modificar datos de informacion de contacto', async() => {
  const usuario = await Usuario.findOne({ correo: usuarioUno.correo }, { require: false });
  const municipio = await Municipio.findOne({ municipio: municipioUno.municipio }, { require: false });
  const infoContacto = await InfoContacto.findOne({ usuario_id: usuario.get('id') }, { require: false });
  await request(app)
    .patch('/infocontacto')
    .set('Authorization', `Bearer ${usuario.get('tokens')[0]}`)
    .send({
      dirreccion: 'las brisas',
      telefono: '2225-6978',
      municipio_id: municipio.get('id')
    })
    .expect(200);

  //modicar sin estar autenticado
  await request(app)
    .patch('/infocontacto')
    .send({ municipio: 'guadalupe' })
    .expect(401);

  //campos no validos
  await request(app)
    .patch('/infocontacto')
    .set('Authorization', `Bearer ${usuario.get('tokens')[0]}`)
    .send({
      sky: 'las brisas'
    })
    .expect(400);

});
