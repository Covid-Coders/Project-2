// *********************************************************************************
// html-routes.js - Routes for sending users to the various html pages
// *********************************************************************************

// Dependencies
// =============================================================
const path = require("path");
const db = require("../models");
const authenticate = require("../config/authenticate");

// Routes
// =============================================================
module.exports = function (app) {
  // SIGNUP PAGE
  app.get("/signup", function (req, res) {
    if (req.user) {
      res.redirect("/");
    }
    // Route to signup if logged out
    res.render("signup", {
      title: "Sign Up",
      btnId: "signup-btn",
      btnName: "Sign Up",
      routeMsg: "Already have a username?",
      route: "/login",
      routeName: "Login",
    });
  });

  // LOGIN PAGE
  app.get("/login", function (req, res) {
    if (req.user) {
      res.redirect("/");
    }
    // Route to signup if logged out
    res.render("login", {
      title: "Login",
      btnId: "login-btn",
      btnName: "Login",
      routeMsg: "Don't have a username?",
      route: "/signup",
      routeName: "Sign up",
    });
  });

  // HOME PAGE
  app.get("/", authenticate, async function (req, res) {
    try {
      let tags = await db.Tags.findAll().map((tag) => tag.dataValues);
      let resources = await db.Resources.findAll().map(
        (resource) => resource.dataValues
      );
      res.render("index", {
        tags: tags,
        resources: resources,
      });
    } catch (err) {
      res.status(500).send(err);
    }
  });

  // USER SAVED RESOURCES PAGE
  app.get("/saved", authenticate, async function (req, res) {
    try {
      let [result] = await db.Users.findAll({
        where: {
          id: req.user.id,
        },
        include: [
          {
            model: db.Resources,
            require: true,
          },
        ],
      });
      let resources = result.Resources.map((resource) => resource.dataValues);
      // Adding saved to each object in array - https://stackoverflow.com/questions/39827087/add-key-value-pair-to-all-objects-in-array
      resources = resources.map(resource => {
        let object = Object.assign({}, resource);
        object.saved = true;
        return object;
      });
      res.render("saved", {
        username: req.user.username,
        resources: resources,
      });
    } catch (err) {
      res.status(500).send(err);
    }
  });

  // CREATE RESOURCE PAGE
  app.get("/create", authenticate, async function (req, res) {
    try {
      let tags = await db.Tags.findAll().map((tag) => tag.dataValues);
      res.render("create", {
        tags: tags,
      });
    } catch (err) {
      res.status(500).send(err);
    }
  });

  // MANAGE TAGS PAGE
  app.get("/manage", authenticate, async function (req, res) {
    try {
      let tags = await db.Tags.findAll().map((tag) => tag.dataValues);
      tags = tags.map(tag => {
        let object = Object.assign({}, tag);
        object.manage = true;
        return object;
      });
      res.render("manage", {
        tags: tags,
      });
    } catch (err) {
      res.status(500).send(err);
    }
  });

  // SEARCH RESOURCES BY TAGNAME
  app.get("/search/:tagId", authenticate, async function (req, res) {
    try {
      let tags = await db.Tags.findAll().map((tag) => tag.dataValues);
      let [results] = await db.Tags.findAll({
        where: {
          id: +req.params.tagId,
        },
        include: [
          {
            model: db.Resources,
            require: true,
          },
        ],
      });
      let resources = results.Resources.map((resource) => resource.dataValues);
      res.render("index", {
        tags: tags,
        resources: resources,
      });
    } catch (err) {
      res.status(500).send(err);
    }
  });
};
