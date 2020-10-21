const jwt = require('jsonwebtoken');
const Usuario = require('../modelos/usuario');

const auth = async(req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const usuario = await Usuario.findOne({ id: decoded._id }, { require: false });
    const isExistToken = usuario.get('tokens').find((objeto) => objeto === token);
    if (!isExistToken) {
      throw new Error();
    }
    req.usuario = usuario;
    req.token = token;
    next()
  } catch (e) {
    res.status(401).send({ error: e.message });
  }
}

module.exports = auth;
