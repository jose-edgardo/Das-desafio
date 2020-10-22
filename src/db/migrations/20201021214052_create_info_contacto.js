exports.up = function(knex) {
  return knex.schema.createTable('info_contacto', (table) => {
    table.increments();
    table.text('dirrecion').notNullable();
    table.string('telefono', 9).notNullable();
    table.integer('idmunicipio').references('id').inTable('municipio');
    table.integer('idUsuario').notNullable().unique().references('id').inTable('usuario');
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('info_contacto');
};
