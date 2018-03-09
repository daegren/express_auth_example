module.exports = knex => {
  const getPublicPosts = () => knex('posts').where({ public: true });
  const getPosts = user =>
    knex('posts')
      .where({ public: true })
      .orWhere({ user_id: user.id });
  const findPost = id =>
    new Promise((resolve, reject) => {
      knex('posts')
        .where({ id })
        .limit(1)
        .then(([post]) => {
          if (post) {
            resolve(post);
          } else {
            reject(`Post with id ${id} not found`);
          }
        })
        .catch(e => reject(e));
    });

  const createPost = (post, user) =>
    new Promise((resolve, reject) => {
      knex('posts')
        .insert({
          ...post,
          user_id: user.id
        })
        .returning('id')
        .then(([post]) => {
          console.log(post);
          resolve(post);
        })
        .catch(e => {
          reject(e);
        });
    });

  return {
    getPublicPosts,
    getPosts,
    findPost,
    createPost
  };
};
