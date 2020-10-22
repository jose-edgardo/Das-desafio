exports.up = function(knex) {
  return knex.schema.createTable('departamento', (table) => {
    table.increments();
    table.text('departamento').notNullable().unique();
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('departamento');
};
