const express = require("express");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Users = require("../models/Users");
const validateUser = require("../helpers/validateUser");

const JWT_SECRET = process.env.JWT_SECRET || "8Kj9mPq2v";

// JWT Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Access denied, no token provided" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: "Invalid token" });
  }
};

exports.controller = (app) => {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Login route
  

  // Check authentication route - uses JWT middleware
  app.get("/check-auth", authenticateToken, (req, res) => {
    res.status(200).json({ message: `Authenticated as ${req.user.email}` });
  });

  // Remove /logout route entirely since no session is used
};
