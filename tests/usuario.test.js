const request = require('supertest');

const app = require('../src/app');
const Usuario = require('../src/modelos/usuario');
const { usuarioUno, usuarioDos, setupDatabase } = require('./fixtures/db');

beforeEach(setupDatabase)

test('Registrar un nuevo usuario', async() => {
  const respuesta = await request(app).post('/usuario').send({
    correo: 'samuel@example.com',
    contrasena: 'MyPass777!'
  }).expect(201);

  //La base de datos se cambio correctamente
  const usuario = await Usuario.findOne({ correo: respuesta.body.usuario.correo }, { require: false });
  expect(usuario).not.toBeNull();

  //Datos mostrados en la respuesta
  expect(respuesta.body).toMatchObject({
    usuario: {
      correo: 'samuel@example.com'
    },
    token: usuario.get('tokens')[0]
  });

  //Contaseña encriptada
  expect(usuario.get('contrasena')).not.toBe('MyPass777!');

  //correo existe en la base de datos
  await request(app).post('/usuario').send({
    correo: 'samuel@example.com',
    contrasena: 'MyPass777!'
  }).expect(400);

  //formato de correo incorrecto
  await request(app).post('/usuario').send({
    correo: 'samuel@.com',
    contrasena: 'MyPass777!'
  }).expect(400);

});

test('Inicio de sesion usuario existente', async() => {
  const respuesta = await request(app).post('/usuario/login').send({
    correo: usuarioUno.correo,
    contrasena: usuarioUno.contrasena
  }).expect(200);

  //Validar si el nuevo token se guardo
  const usuario = await Usuario.findOne({ id: respuesta.body.usuario.id }, { require: false });
  expect(respuesta.body.token).toBe(usuario.get('tokens')[1]);

});

test('Inicio de sesion usuario no existente', async() => {
  const respuesta = await request(app).post('/usuario/login').send({
    correo: usuarioUno.correo + '.sv',
    contrasena: usuarioUno.contrasena + 'abcd'
  }).expect(400);
});

test('Obtener el perfil del usuario', async() => {
  const usuario = await Usuario.findOne({ correo: usuarioUno.correo }, { require: false });

  await request(app)
    .get('/usuario/me')
    .set('Authorization', `Bearer ${usuario.get('tokens')[0]}`)
    .send()
    .expect(200);

  //Obtener el perfil sin estar autenticado
  await request(app)
    .get('/usuario/me')
    .send()
    .expect(401);
});

test('Modificar el perfil del usuario', async() => {
  const usuario = await Usuario.findOne({ correo: usuarioUno.correo }, { require: false });
  await request(app)
    .patch('/usuario/me')
    .set('Authorization', `Bearer ${usuario.get('tokens')[0]}`)
    .send({ correo: usuarioUno.correo + '.sv' })
    .expect(200);

  //moficar el perfil sin estar autenticado
  await request(app)
    .patch('/usuario/me')
    .send({ correo: usuarioUno.correo + '.sv' })
    .expect(401);

  //campos no validos
  await request(app)
    .patch('/usuario/me')
    .set('Authorization', `Bearer ${usuario.get('tokens')[0]}`)
    .send({ color: 'morado' })
    .expect(400);

});

test('Eliminacion logica del usuario', async() => {
  const usuario = await Usuario.findOne({ correo: usuarioUno.correo }, { require: false });
  await request(app)
    .delete('/usuario/me/low')
    .set('Authorization', `Bearer ${usuario.get('tokens')[0]}`)
    .send()
    .expect(200);

  //modificar estatus del usuario sin estar autenticado
  await request(app)
    .delete('/usuario/me/low')
    .send()
    .expect(401);
});

test('Subir avatar al perfil', async() => {
  const usuario = await Usuario.findOne({ correo: usuarioUno.correo }, { require: false });
  await request(app)
    .post('/usuario/me/avatar')
    .set('Authorization', `Bearer ${usuario.get('tokens')[0]}`)
    .attach('avatar', 'tests/fixtures/rothy-4.jpg')
    .expect(200)

  //comprobar si la foto se guardo
  const user = await Usuario.findOne({ correo: usuarioUno.correo }, { require: false });
  expect(user.get('fotografia')).toEqual(expect.any(Buffer));
})
