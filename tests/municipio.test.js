const request = require('supertest');

const app = require('../src/app');
const Usuario = require('../src/modelos/usuario');
const Departamento = require('../src/modelos/departamento');
const Municipio = require('../src/modelos/municipio');
const { usuarioUno, usuarioDos, departamentoUno, departamentoDos, municipioUno, setupDatabase } = require('./fixtures/db');

beforeEach(setupDatabase)

test('Registrar un nuevo municipio', async() => {
  const usuario = await Usuario.findOne({ correo: usuarioUno.correo }, { require: false });
  const departamento = await Departamento.findOne({ departamento: departamentoUno.departamento }, { require: false });
  const respuesta = await request(app)
    .post('/municipio')
    .set('Authorization', `Bearer ${usuario.get('tokens')[0]}`)
    .send({
      municipio: 'san antonio',
      departamento_id: departamento.get('id')
    }).expect(201);

  //La base de datos se cambio correctamente
  const municipio = await Municipio.findOne({ municipio: respuesta.body.municipio.municipio }, { require: false });
  expect(municipio).not.toBeNull();

  //Datos mostrados en la respuesta
  expect(respuesta.body).toMatchObject({
    municipio: {
      municipio: 'san antonio',
      departamento_id: departamento.get('id')
    }
  });

  //municipio ya existe en la base de datos
  await request(app)
    .post('/municipio')
    .set('Authorization', `Bearer ${usuario.get('tokens')[0]}`)
    .send({
      departamento: 'san antonio'
    }).expect(400);

  //sin estar autenticado
  await request(app)
    .post('/municipio')
    .send({
      municipio: 'san antonio',
      departamento_id: departamento.get('id')
    }).expect(401);

});

test('Obtener datos de municipio', async() => {
  const usuario = await Usuario.findOne({ correo: usuarioUno.correo }, { require: false });
  const municipio = await Municipio.findOne({ municipio: municipioUno.municipio }, { require: false });
  await request(app)
    .get('/municipio/' + municipio.get('id'))
    .set('Authorization', `Bearer ${usuario.get('tokens')[0]}`)
    .send()
    .expect(200);

  //Get por el id del usuario autenticado
  await request(app)
    .get('/municipio')
    .set('Authorization', `Bearer ${usuario.get('tokens')[0]}`)
    .send()
    .expect(200);

  //Obtener datos sin estar autenticado
  await request(app)
    .get('/municipio/' + municipio.get('id'))
    .send()
    .expect(401);
  //
  await request(app)
    .get('/municipio')
    .send()
    .expect(401);
});

test('Modificar datos de municipio', async() => {
  const usuario = await Usuario.findOne({ correo: usuarioUno.correo }, { require: false });
  const municipio = await Municipio.findOne({ municipio: municipioUno.municipio }, { require: false });
  await request(app)
    .get('/municipio/' + municipio.get('id'))
    .set('Authorization', `Bearer ${usuario.get('tokens')[0]}`)
    .send({
      municipio: 'san esteban'
    })
    .expect(200);

  //moficar el perfil sin estar autenticado
  await request(app)
    .patch('/municipio/' + municipio.get('id'))
    .send({ municipio: 'guadalupe' })
    .expect(401);

  //campos no validos
  await request(app)
    .patch('/municipio/' + municipio.get('id'))
    .set('Authorization', `Bearer ${usuario.get('tokens')[0]}`)
    .send({ lagtitud: 234 })
    .expect(400);

});
