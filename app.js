require('dotenv').config({ path: 'variables.env' });
const debug = require('debug')('app:inicio');
//const dbDebug = require('debug')('app:db');

const express = require('express');
const config = require('config');
const Joi = require('joi');
//const logger = require('./logger');
const morgan = require('morgan');

const app = express(); // Body

//Middleware para body
app.use(express.json());
app.use(express.urlencoded({ extended: true })); //usuarios/valu1=&value2&value3=
app.use(express.static('public')); //Hacer publicos archivos  de la carpeta de public

//Configuracion de entornos
console.log('Aplicacion: ' + config.get('nombre'));
console.log('DB server: ' + config.get('configDB.host'));

if (app.get('env') === 'development') {
  app.use(morgan('tiny'));
  //console.log('Morgan Habilitado');
  debug('Morgan esta habilitado.');
}

//Trabajo con la base de datos
debug('Conectando con la db');

//Midleware personalizados
//app.use(logger);

// Middleware de 3ro

const usuarios = [
  { id: 1, nombre: 'Armando' },
  { id: 2, nombre: 'Pablo' },
  { id: 3, nombre: 'Ana' },
];
app.get('/', (req, res) => {
  res.send('Hola mundo desde express');
});

app.get('/api/usuarios', (req, res) => {
  res.send(usuarios);
});

app.get('/api/usuarios/:id', (req, res) => {
  let usuario = existeUsuario(req.params.id);
  if (!usuario) {
    res.status(404).send('El usuario no fue encontrado');
    return;
  }

  res.send(usuario.nombre);
});

///*¨****  POSTS ****///////////
app.post('/api/usuarios', (req, res) => {
  // Validación
  const { error, value } = validarUsuario(req.body.nombre);

  if (!error) {
    const usuario = {
      id: usuarios.length + 1,
      nombre: value.nombre,
    };
    usuarios.push(usuario);
    res.send(usuario);
  } else {
    const mensaje = error.details[0].message;
    res.status(400).send(mensaje);
  }
});

app.put('/api/usuarios/:id', (req, res) => {
  //Encontrar si existe el usuario a modificar
  let usuario = existeUsuario(req.params.id);
  if (!usuario) {
    res.status(404).send('El usuario no fue encontrado');
    return;
  }
  const { error, value } = validarUsuario(req.body.nombre);

  if (error) {
    const mensaje = error.details[0].message;
    res.status(400).send(mensaje);
    return;
  }
  usuario.nombre = value.nombre;
  res.send(usuario);
});

app.delete('/api/usuarios/:id', (req, res) => {
  let usuario = existeUsuario(req.params.id);
  if (!usuario) {
    res.status(404).send('El usuario no fue encontrado');
    return;
  }

  const index = usuarios.indexOf(usuario);
  usuarios.splice(index, 1);
  res.send(usuario);
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Escuchando en el puerto ${port}...`);
});

function existeUsuario(id) {
  return usuarios.find((u) => u.id === parseInt(id));
}

function validarUsuario(nom) {
  const schema = Joi.object({
    nombre: Joi.string().min(3).required(),
  });
  return schema.validate({ nombre: nom });
}
