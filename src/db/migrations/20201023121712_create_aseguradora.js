exports.up = function(knex) {
  return knex.schema.createTable('aseguradora', (table) => {
    table.increments();
    table.text('aseguradora').notNullable().unique();
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('aseguradora');
};
