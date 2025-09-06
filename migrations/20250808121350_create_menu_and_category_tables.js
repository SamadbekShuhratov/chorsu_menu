exports.up = function(knex) {
  return knex.schema
    .createTable('categories', table => {
      table.uuid('id').primary();
      table.string('name').notNullable();
    })
    .createTable('menu_items', table => {
      table.uuid('id').primary();
      table.string('name').notNullable();
      table.text('description');
      table.float('price').notNullable();
      table.uuid('categoryId').notNullable().references('id').inTable('categories');
      table.timestamp('createdAt').defaultTo(knex.fn.now());
      table.timestamp('updatedAt').defaultTo(knex.fn.now());
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTable('menu_items')
    .dropTable('categories');
};
