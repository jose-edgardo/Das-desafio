const Usuario = require('./usuario');

const consulta = async() => {
  try {
    const usuario = await Usuario.where({ 'correo': 'example@ues.com' }).fetch({ require: true });
    console.log(usuario.id)
  } catch (error) {
    console.log(error)
  }
}

consulta();
