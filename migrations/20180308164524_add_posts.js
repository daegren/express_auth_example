exports.up = function(knex, Promise) {
  return knex.schema.createTable('posts', table => {
    table.increments();
    table.integer('user_id').references('users.id');
    table.string('title').notNullable();
    table.text('body').notNullable();
    table.boolean('public').defaultTo(false);
    table.timestamps();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('posts');
};
