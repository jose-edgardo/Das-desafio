const request = require('supertest');

const app = require('../src/app');
const Usuario = require('../src/modelos/usuario');
const Aseguradora = require('../src/modelos/aseguradora');
const InfoSeguro = require('../src/modelos/infoSeguro');
const { usuarioUno, usuarioDos, aseguradoraUno, aseguradoraDos, infoSeguroUno, infoSeguroDos, setupDatabase } = require('./fixtures/db');

beforeEach(setupDatabase)

test('Registro de infoSeguro', async() => {
  const usuario = await Usuario.findOne({ correo: usuarioDos.correo }, { require: false });
  const aseguradora = await Aseguradora.findOne({ aseguradora: aseguradoraUno.aseguradora }, { require: false });

  //Ya exite un registro con mismo numero identificador
  await request(app)
    .post('/infoseguro')
    .set('Authorization', `Bearer ${usuario.get('tokens')[0]}`)
    .send({
      numero_identificador: 1,
      fecha_vigencia: '2026-5-7',
      aseguradora_id: aseguradora.get('id')
    }).expect(400);

  const respuesta = await request(app)
    .post('/infoseguro')
    .set('Authorization', `Bearer ${usuario.get('tokens')[0]}`)
    .send({
      numero_identificador: 3,
      fecha_vigencia: '2026-5-7',
      aseguradora_id: aseguradora.get('id')
    }).expect(201);

  //La base de datos se cambio correctamente
  const infoSeguro = await InfoSeguro.findOne({ usuario_id: respuesta.body.infoSeguro.usuario_id }, { require: false });
  expect(infoSeguro).not.toBeNull();

  //usuario ya tiene un registro previo
  await request(app)
    .post('/infoseguro')
    .set('Authorization', `Bearer ${usuario.get('tokens')[0]}`)
    .send({
      numero_identificador: 4,
      fecha_vigencia: '2027-5-7',
      aseguradora_id: aseguradora.get('id')
    }).expect(400);

  //sin estar autenticado
  await request(app)
    .post('/infoseguro')
    .send({
      numero_identificador: 5,
      fecha_vigencia: '2027-5-7',
      aseguradora_id: aseguradora.get('id')
    }).expect(401);
});

test('Obtener datos de infoSeguro', async() => {
  const usuario = await Usuario.findOne({ correo: usuarioUno.correo }, { require: false });
  const infoSeguro = await InfoSeguro.findOne({ usuario_id: usuario.get('id') }, { require: false });
  await request(app)
    .get('/infoseguro/' + infoSeguro.get('id'))
    .set('Authorization', `Bearer ${usuario.get('tokens')[0]}`)
    .send()
    .expect(200);

  //Get por el id del usuario autenticado
  await request(app)
    .get('/infoseguro')
    .set('Authorization', `Bearer ${usuario.get('tokens')[0]}`)
    .send()
    .expect(200);

  //Obtener datos sin estar autenticado
  await request(app)
    .get('/infocontacto/' + infoSeguro.get('id'))
    .send()
    .expect(401);
  //
  await request(app)
    .get('/infocontacto')
    .send()
    .expect(401);
});

test('Modificar datos de informacion de seguro', async() => {
  const usuario = await Usuario.findOne({ correo: usuarioUno.correo }, { require: false });
  const aseguradora = await Aseguradora.findOne({ aseguradora: aseguradoraUno.aseguradora }, { require: false });
  const infoSeguro = await InfoSeguro.findOne({ usuario_id: usuario.get('id') }, { require: false });
  await request(app)
    .patch('/infoseguro')
    .set('Authorization', `Bearer ${usuario.get('tokens')[0]}`)
    .send({
      numero_identificador: 6,
      fecha_vigencia: '2027-5-7',
      aseguradora_id: aseguradora.get('id')
    })
    .expect(200);

  //modificar a mismo numero identificador
  await request(app)
    .patch('/infoseguro')
    .set('Authorization', `Bearer ${usuario.get('tokens')[0]}`)
    .send({
      numero_identificador: 6,
      fecha_vigencia: '2027-5-7',
      aseguradora_id: aseguradora.get('id')
    })
    .expect(200);

  //modicar sin estar autenticado
  await request(app)
    .patch('/infoseguro')
    .send({
      numero_identificador: 6,
      fecha_vigencia: '2027-5-7',
      aseguradora_id: aseguradora.get('id')
    })
    .expect(401);

  //campos no validos
  await request(app)
    .patch('/infoseguro')
    .set('Authorization', `Bearer ${usuario.get('tokens')[0]}`)
    .send({
      sky: 'las brisas'
    })
    .expect(400);

});
