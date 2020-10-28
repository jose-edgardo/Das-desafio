const request = require('supertest');

const app = require('../src/app');
const Usuario = require('../src/modelos/usuario');
const InfoSalud = require('../src/modelos/infoSalud');
const { usuarioUno, usuarioDos, infoSaludUno, infoSaludDos, setupDatabase } = require('./fixtures/db');

beforeEach(setupDatabase)

test('Registro de infoSalud', async() => {
  const usuario = await Usuario.findOne({ correo: usuarioDos.correo }, { require: false });
  const respuesta = await request(app)
    .post('/infosalud')
    .set('Authorization', `Bearer ${usuario.get('tokens')[0]}`)
    .send({
      alergias_a_medicinas: ['amoxicilina'],
      condiciones_salud: 'buenas condiciones de salud'
    }).expect(201);

  //La base de datos se cambio correctamente
  const infoSalud = await InfoSalud.findOne({ usuario_id: respuesta.body.infoSalud.usuario_id }, { require: false });
  expect(infoSalud).not.toBeNull();

  //usuario ya tiene un registro previo
  await request(app)
    .post('/infosalud')
    .set('Authorization', `Bearer ${usuario.get('tokens')[0]}`)
    .send({
      alergias_a_medicinas: ['amoxicilina'],
      condiciones_salud: 'buen estado fisico'
    }).expect(400);

  //sin estar autenticado
  await request(app)
    .post('/infosalud')
    .send({
      alergias_a_medicinas: ['amoxicilina'],
      condiciones_salud: 'buen estado fisico'
    }).expect(401);
});

test('Obtener datos de infoSalud', async() => {
  const usuario = await Usuario.findOne({ correo: usuarioUno.correo }, { require: false });
  const infoSalud = await InfoSalud.findOne({ usuario_id: usuario.get('id') }, { require: false });
  await request(app)
    .get('/infosalud/' + infoSalud.get('id'))
    .set('Authorization', `Bearer ${usuario.get('tokens')[0]}`)
    .send()
    .expect(200);

  //Get por el id del usuario autenticado
  await request(app)
    .get('/infosalud')
    .set('Authorization', `Bearer ${usuario.get('tokens')[0]}`)
    .send()
    .expect(200);

  //Obtener datos sin estar autenticado
  await request(app)
    .get('/infosalud/' + infoSalud.get('id'))
    .send()
    .expect(401);
  //
  await request(app)
    .get('/infosalud')
    .send()
    .expect(401);
});

test('Modificar datos de informacion de salud', async() => {
  const usuario = await Usuario.findOne({ correo: usuarioUno.correo }, { require: false });
  const infoSalud = await InfoSalud.findOne({ usuario_id: usuario.get('id') }, { require: false });
  await request(app)
    .patch('/infosalud')
    .set('Authorization', `Bearer ${usuario.get('tokens')[0]}`)
    .send({
      medicacion: ['Aspirina  ', 'Ramipril ']
    })
    .expect(200);

  //modicar sin estar autenticado
  await request(app)
    .patch('/infosalud')
    .send({
      medicacion: ['Aspirina  ', 'Ramipril ']
    })
    .expect(401);

  //campos no validos
  await request(app)
    .patch('/infosalud')
    .set('Authorization', `Bearer ${usuario.get('tokens')[0]}`)
    .send({
      sky: 'las brisas'
    })
    .expect(400);

});
