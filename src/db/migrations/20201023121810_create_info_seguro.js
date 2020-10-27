exports.up = function(knex) {
  return knex.schema.createTable('info_seguro', (table) => {
    table.increments();
    table.integer('numero_identificador').unsigned().notNullable().unique();
    table.date('fecha_vigencia').notNullable();
    table.integer('aseguradora_id').notNullable().references('id').inTable('aseguradora');
    table.integer('usuario_id').notNullable().unique().references('id').inTable('usuario');
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('info_seguro');
};
