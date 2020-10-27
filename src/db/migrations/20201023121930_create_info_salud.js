exports.up = function(knex) {
  return knex.schema.createTable('info_salud', (table) => {
    table.increments();
    table.specificType('alergias_a_medicinas', 'text ARRAY');
    table.text('condiciones_salud');
    table.specificType('medicacion', 'text ARRAY');
    table.integer('usuario_id').notNullable().unique().references('id').inTable('usuario');
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('info_salud');
};
