exports.up = function(knex) {
  return knex.schema.createTable('info_contacto', (table) => {
    table.increments();
    table.text('dirreccion').notNullable();
    table.string('telefono', 9).notNullable();
    table.integer('municipio_id').references('id').inTable('municipio');
    table.integer('usuario_id').notNullable().unique().references('id').inTable('usuario');
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('info_contacto');
};
