const uuid = require("uuid/v4");
const { hash, verify } = require("../util/password");

module.exports = knex => {
  const registerUser = (username, password) =>
    hash(password).then(password_hashed =>
      knex("users")
        .insert({ username, password_hashed })
        .returning("*")
    );

  const loginUser = (username, password) =>
    new Promise((resolve, reject) => {
      let foundUser;

      findByUsername(username)
        .then(([user]) => {
          if (user) {
            foundUser = user;
            return verify(password, user.password_hashed);
          } else {
            reject("user not found");
          }
        })
        .then(valid => {
          if (valid) {
            resolve(foundUser);
          } else {
            reject("Invalid Password");
          }
        })
        .catch(e => {
          reject("user not found");
        });
    });

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
    register: (username, password) =>
      new Promise((resolve, reject) => {
        registerUser(username, password)
          .then(([user]) => generateLoginToken(user))
          .then(([user]) => resolve(user))
          .catch(e => reject(e));
      }),
    login: (username, password) =>
      new Promise((resolve, reject) => {
        loginUser(username, password)
          .then(user => generateLoginToken(user))
          .then(([user]) => resolve(user))
          .catch(e => reject(e));
      }),
    find,
    findByUsername,
    findByToken
  };
};
