const request = require('supertest');

const app = require('../src/app');
const Usuario = require('../src/modelos/usuario');
const Departamento = require('../src/modelos/departamento');
const { usuarioUno, usuarioDos, departamentoUno, setupDatabase } = require('./fixtures/db');

beforeEach(setupDatabase)

test('Registrar un nuevo departamento', async() => {
  const usuario = await Usuario.findOne({ correo: usuarioUno.correo }, { require: false });
  const respuesta = await request(app)
    .post('/departamento')
    .set('Authorization', `Bearer ${usuario.get('tokens')[0]}`)
    .send({
      departamento: 'La paz'
    }).expect(201);

  //La base de datos se cambio correctamente
  const departamento = await Departamento.findOne({ departamento: respuesta.body.departamento.departamento }, { require: false });
  expect(departamento).not.toBeNull();

  //Datos mostrados en la respuesta
  expect(respuesta.body).toMatchObject({
    departamento: {
      departamento: 'la paz'
    }
  });

  //departamento ya existe en la base de datos
  await request(app)
    .post('/departamento')
    .set('Authorization', `Bearer ${usuario.get('tokens')[0]}`)
    .send({
      departamento: 'La paz'
    }).expect(400);

  //Sin autenticacion
  await request(app)
    .post('/departamento')
    .send({
      departamento: 'La paz'
    }).expect(401);

});

test('Obtener datos de departamento', async() => {
  const usuario = await Usuario.findOne({ correo: usuarioUno.correo }, { require: false });
  const departamento = await Departamento.findOne({ departamento: departamentoUno.departamento }, { require: false });
  await request(app)
    .get('/departamento/' + departamento.get('id'))
    .set('Authorization', `Bearer ${usuario.get('tokens')[0]}`)
    .send()
    .expect(200);

  //Get por el id del usuario autenticado
  await request(app)
    .get('/departamento')
    .set('Authorization', `Bearer ${usuario.get('tokens')[0]}`)
    .send()
    .expect(200);

  //Obtener datos sin estar autenticado
  await request(app)
    .get('/departamento/' + departamento.get('id'))
    .send()
    .expect(401);
  //
  await request(app)
    .get('/departamento')
    .send()
    .expect(401);
});

test('Modificar datos de departamento', async() => {
  const usuario = await Usuario.findOne({ correo: usuarioUno.correo }, { require: false });
  const departamento = await Departamento.findOne({ departamento: departamentoUno.departamento }, { require: false })
  await request(app)
    .patch('/departamento/' + departamento.get('id'))
    .set('Authorization', `Bearer ${usuario.get('tokens')[0]}`)
    .send({ departamento: 'Berlin' })
    .expect(200);

  //moficar el perfil sin estar autenticado
  await request(app)
    .patch('/departamento/' + departamento.get('id'))
    .send({ departamento: 'Berlin' })
    .expect(401);

  //campos no validos
  await request(app)
    .patch('/departamento/' + departamento.get('id'))
    .set('Authorization', `Bearer ${usuario.get('tokens')[0]}`)
    .send({ area: 'Berlin' })
    .expect(400);

});
