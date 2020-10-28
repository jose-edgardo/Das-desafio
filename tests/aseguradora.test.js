const request = require('supertest');

const app = require('../src/app');
const Usuario = require('../src/modelos/usuario');
const Aseguradora = require('../src/modelos/aseguradora');
const { usuarioUno, usuarioDos, aseguradoraUno, aseguradoraDos, setupDatabase } = require('./fixtures/db');

beforeEach(setupDatabase)

test('Registrar una nueva aseguradora', async() => {
  const usuario = await Usuario.findOne({ correo: usuarioUno.correo }, { require: false });
  const respuesta = await request(app)
    .post('/aseguradora')
    .set('Authorization', `Bearer ${usuario.get('tokens')[0]}`)
    .send({
      aseguradora: 'La alianza'
    }).expect(201);

  //La base de datos se cambio correctamente
  const aseguradora = await Aseguradora.findOne({ aseguradora: respuesta.body.aseguradora.aseguradora }, { require: false });
  expect(aseguradora).not.toBeNull();

  //Datos mostrados en la respuesta
  expect(respuesta.body).toMatchObject({
    aseguradora: {
      id: aseguradora.get('id'),
      aseguradora: 'la alianza'
    }
  });

  //aseguradora ya existe en la base de datos
  await request(app)
    .post('/aseguradora')
    .set('Authorization', `Bearer ${usuario.get('tokens')[0]}`)
    .send({
      aseguradora: 'La alianza'
    }).expect(400);

  //Sin autenticacion
  await request(app)
    .post('/aseguradora')
    .send({
      departamento: 'AXA'
    }).expect(401);

});

test('Obtener datos de aseguradora', async() => {
  const usuario = await Usuario.findOne({ correo: usuarioUno.correo }, { require: false });
  const aseguradora = await Aseguradora.findOne({ aseguradora: aseguradoraUno.aseguradora }, { require: false });
  await request(app)
    .get('/aseguradora/' + aseguradora.get('id'))
    .set('Authorization', `Bearer ${usuario.get('tokens')[0]}`)
    .send()
    .expect(200);

  //Get por el id del usuario autenticado
  await request(app)
    .get('/aseguradora')
    .set('Authorization', `Bearer ${usuario.get('tokens')[0]}`)
    .send()
    .expect(200);

  //Obtener datos sin estar autenticado
  await request(app)
    .get('/aseguradora/' + aseguradora.get('id'))
    .send()
    .expect(401);
  //
  await request(app)
    .get('/aseguradora')
    .send()
    .expect(401);
});

test('Modificar datos de aseguradora', async() => {
  const usuario = await Usuario.findOne({ correo: usuarioUno.correo }, { require: false });
  const aseguradora = await Aseguradora.findOne({ aseguradora: aseguradoraUno.aseguradora }, { require: false })
  await request(app)
    .patch('/aseguradora/' + aseguradora.get('id'))
    .set('Authorization', `Bearer ${usuario.get('tokens')[0]}`)
    .send({ aseguradora: 'El amanecer' })
    .expect(200);

  //moficar sin estar autenticado
  await request(app)
    .patch('/aseguradora/' + aseguradora.get('id'))
    .send({ aseguradora: 'El amanecer' })
    .expect(401);

  //campos no validos
  await request(app)
    .patch('/aseguradora/' + aseguradora.get('id'))
    .set('Authorization', `Bearer ${usuario.get('tokens')[0]}`)
    .send({ area: '200*2' })
    .expect(400);

});
