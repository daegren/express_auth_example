// Update with your config settings.

module.exports = {
  development: {
    client: "postgresql",
    connection: {
      database: "express_auth_example",
      user: "postgres",
      password: "postgres"
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: "knex_migrations"
    }
  }
};
