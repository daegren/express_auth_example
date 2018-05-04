const express = require("express");

const router = express.Router();

module.exports = db => {
  const posts = require("../models/Post")(db);
  router.get("/", (req, res) => {
    if (req.currentUser && req.currentUser.id !== -1) {
      posts.getPosts(req.currentUser).then(posts => {
        res.render("posts/index", {
          user: req.currentUser,
          info: req.flash("info"),
          errors: req.flash("errors"),
          posts
        });
      });
    } else {
      posts.getPublicPosts().then(posts => {
        res.render("posts/index", {
          user: req.currentUser,
          info: req.flash("info"),
          errors: req.flash("errors"),
          posts
        });
      });
    }
  });

  // use middleware to intercept the other pages
  router.use((req, res, next) => {
    const securePaths = ["/new", "/create"];

    if (req.currentUser.id === -1 && securePaths.includes(req.path)) {
      req.flash("info", "You must be logged in to create a post");
      res.redirect("/posts");
      return;
    }

    next();
  });

  router.get("/new", (req, res) => {
    res.render("posts/new", {
      user: req.currentUser,
      info: req.flash("info"),
      errors: req.flash("errors")
    });
  });

  router.post("/create", (req, res) => {
    const { title, body, public } = req.body;

    if (title === "" || body === "") {
      req.flash("errors", "You need to provide a title and a body");
      res.redirect("/posts/new");
      return;
    }

    posts
      .createPost({ title, body, public }, req.currentUser)
      .then(id => {
        req.flash("info", "Post created succesfully");
        res.redirect(`/posts/${id}`);
      })
      .catch(e => {
        console.error(e);
        req.flash("errors", "There was an error creating your post");
        res.redirect("/posts/new");
      });
  });

  router.get("/:id", (req, res) => {
    posts
      .findPost(req.params.id)
      .then(post => {
        if (
          (req.currentUser.id === -1 && !post.public) ||
          post.user_id !== req.currentUser.id
        ) {
          req.flash("info", `Post with id ${req.params.id} not found.`);
          res.redirect("/posts");
          return;
        }
        res.render("posts/show", {
          user: req.currentUser,
          info: req.flash("info"),
          errors: req.flash("errors"),
          post
        });
      })
      .catch(e => {
        console.error(e);
        req.flash("info", `Post with id ${req.params.id} not found.`);
        res.redirect("/posts");
      });
  });

  return router;
};
