const express = require("express");
const {
  validationResult
} = require("express-validator");
const {
  validationPharmacy
} = require("../helpers/validation");
const Pharmacy = require("../models/pharmacy");
const router = express.Router();

module.exports.controller = function (app) {
  
  app.post("/register", validationPharmacy, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: errors.array().map(err => err.msg).join(", ")
      });
    }

    try {
      const pharmacies = Array.isArray(req.body) ? req.body : [req.body];

      const newPharmacies = await Pharmacy.bulkCreate(
        pharmacies.map(pharmacy => ({
          email: pharmacy.email ? pharmacy.email.toLowerCase() : null,
          password: pharmacy.password,
          pharmacy_name: pharmacy.pharmacy_name,
          address: pharmacy.address,
          contact_info: pharmacy.contact_info,
          healthAuthority: pharmacy.healthAuthority
        })), {
          validate: true
        }
      );

      res.status(201).json({
        message: "Pharmacies registered successfully",
        data: newPharmacies
      });
    } catch (error) {
      console.log(error); 
      if (error.name === "SequelizeUniqueConstraintError") {
        return res.status(400).json({
          error: "Email or pharmacy name already exists"
        });
      }
      res.status(500).json({
        error: "Failed to register pharmacies",
        details: error.message
      });
    }
  });

  app.put("/pharmacies/:id", validationPharmacy, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: errors.array().map(err => err.msg).join(", ")
      });
    }

    try {
      const pharmacy = await Pharmacy.findByPk(req.params.id);
      if (!pharmacy) return res.status(404).json({
        error: "Pharmacy not found"
      });

      const {
        email,
        password,
        pharmacy_name,
        address,
        contact_info,
        healthAuthority
      } = Array.isArray(req.body) ? req.body[0] : req.body;

      await pharmacy.update({
        email: email ? email.toLowerCase() : pharmacy.email,
        password: password || pharmacy.password,
        pharmacy_name: pharmacy_name || pharmacy.pharmacy_name,
        address: address || pharmacy.address,
        contact_info: contact_info || pharmacy.contact_info,
        healthAuthority: healthAuthority || pharmacy.healthAuthority
      });

      res.status(200).json({
        message: "Pharmacy updated successfully",
        data: pharmacy
      });
    } catch (error) {
      console.log(error); 
      if (error.name === "SequelizeUniqueConstraintError") {
        return res.status(400).json({
          error: "Email or pharmacy name already exists"
        });
      }
      res.status(500).json({
        error: "Failed to update pharmacy",
        details: error.message
      });
    }
  });

  app.get("/pharmacies", async (req, res) => {
    try {
      const pharmacies = await Pharmacy.findAll();
      res.status(200).json({
        data: pharmacies
      });
    } catch (error) {
      console.log(error); 
      res.status(500).json({
        error: "Failed to fetch pharmacies",
        details: error.message
      });
    }
  });

  app.get("/pharmacies/:id", async (req, res) => {
    try {
      const pharmacy = await Pharmacy.findByPk(req.params.id);
      if (!pharmacy) return res.status(404).json({
        error: "Pharmacy not found"
      });
      res.status(200).json({
        data: pharmacy
      });
    } catch (error) {
      console.log(error); 
      res.status(500).json({
        error: "Failed to fetch pharmacy",
        details: error.message
      });
    }
  });

  app.delete("/pharmacies/:id", async (req, res) => {
    try {
      const pharmacy = await Pharmacy.findByPk(req.params.id);
      if (!pharmacy) return res.status(404).json({
        error: "Pharmacy not found"
      });

      await pharmacy.destroy();
      res.status(200).json({
        message: "Pharmacy permanently deleted"
      });
    } catch (error) {
      console.log(error); 
      res.status(500).json({
        error: "Failed to delete pharmacy",
        details: error.message
      });
    }
  });

}