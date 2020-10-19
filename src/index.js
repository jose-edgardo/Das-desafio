const app = require('./app');

const puerto = process.env.PORT;

app.listen(puerto, () => {
  console.log(`Servidor escuchando en el puerto: ${puerto}`);
});
