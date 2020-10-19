exports.up = function(knex) {
  return knex.schema.createTable('usuario', (table) => {
    table.increments(),
      table.text('correo').unique().notNullable(),
      table.text('contrasena').notNullable(),
      table.boolean('status').defaultTo(true),
      table.binary('fotografia')
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('usuario');
};
