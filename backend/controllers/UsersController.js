const {
  body,
  validationResult
} = require("express-validator");
const bcrypt = require("bcrypt");
const sequelize = require("../config/database");
const {
  validationUser
} = require("../helpers/validation");
const { validationDiagnosisList } = require("../helpers/validation");

const express = require("express");
const router = express.Router();
const Users = require("../models/Users");

module.exports.controller = function (app) {
  app.use(express.json());
  app.use(express.urlencoded({
    extended: true
  }));


  app.get("/check-auth", (req, res) => {
    if (req.session.username) {
      return res.status(200).json({
        message: "Authenticated"
      });
    }
    return res.status(401).json({
      error: "Not authenticated"
    });
  });

  app.get("/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({
          error: "Logout failed: " + err.message
        });
      }
      return res.status(200).json({
        message: "Logged out successfully."
      });
    });
  });
};