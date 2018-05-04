const uuid = require("uuid/v4");

module.exports = knex => {
  const registerUser = username =>
    knex("users")
      .insert({ username })
      .returning("*");

  const loginUser = username => findByUsername(username);

  const generateLoginToken = user =>
    knex("users")
      .where({ id: user.id })
      .update({ token: uuid() })
      .returning("*");

  const find = id =>
    knex("users")
      .where({ id })
      .select("*")
      .limit(1);

  const findByUsername = username =>
    knex("users")
      .where({ username })
      .select("*")
      .limit(1);

  const findByToken = token =>
    knex("users")
      .where({ token })
      .select("*")
      .limit(1);

  return {
    register: username =>
      new Promise((resolve, reject) => {
        registerUser(username)
          .then(([user]) => generateLoginToken(user))
          .then(([user]) => resolve(user))
          .catch(e => reject(e));
      }),
    login: username =>
      new Promise((resolve, reject) => {
        loginUser(username)
          .then(([user]) => generateLoginToken(user))
          .then(([user]) => resolve(user))
          .catch(e => reject(e));
      }),
    find,
    findByUsername,
    findByToken
  };
};
