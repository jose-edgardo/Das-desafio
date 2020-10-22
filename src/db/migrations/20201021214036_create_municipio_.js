exports.up = function(knex) {
  return knex.schema.createTable('municipio', (table) => {
    table.increments();
    table.text('municipio').notNullable();
    table.integer('idDepartamento').notNullable().references('id').inTable('departamento');
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('municipio');
};
