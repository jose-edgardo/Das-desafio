exports.up = function(knex) {
  return knex.schema.createTable('usuario', (table) => {
    table.increments(),
      table.text('correo').unique().notNullable(),
      table.text('contrasena').notNullable(),
      table.boolean('status').defaultTo(true),
      table.binary('fotografia'),
      table.specificType('tokens', 'text ARRAY');

    //llave foranea
    //table.foreign('author').references('userId').inTable('users');
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('usuario');
};
