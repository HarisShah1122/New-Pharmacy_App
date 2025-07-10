const express = require("express");
const {
  validationResult
} = require("express-validator");
const {
  validationClinician
} = require("../helpers/validation");
const Clinician = require("../models/clinicians");
const router = express.Router();

module.exports.controller = function (app) {

  app.post("/clinicians", validationClinician, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: errors.array().map(err => err.msg).join(", ")
      });
    }

    let clinicians = req.body.clinicians || [req.body];

    try {
      for (let i = 0; i < clinicians.length; i++) {
        const {
          email,
          license_number,
          clinician_list_id
        } = clinicians[i];
        if (clinicians.slice(0, i).some(c => c.email ?.toLowerCase() === email ?.toLowerCase())) {
          return res.status(400).json({
            error: `Duplicate email ${email} at index ${i}`
          });
        }
        if (clinicians.slice(0, i).some(c => c.license_number === license_number)) {
          return res.status(400).json({
            error: `Duplicate license number ${license_number} at index ${i}`
          });
        }
        if (clinicians.slice(0, i).some(c => c.clinician_list_id === clinician_list_id)) {
          return res.status(400).json({
            error: `Duplicate clinician  list ID ${clinician_list_id} at index ${i}`
          });
        }
        const existingEmail = await Clinician.findOne({
          where: {
            email: email.toLowerCase()
          }
        });
        if (existingEmail) {
          return res.status(400).json({
            error: `Email ${email} already exists at index ${i}`
          });
        }
        const existingLicense = await Clinician.findOne({
          where: {
            license_number
          }
        });
        if (existingLicense) {
          return res.status(400).json({
            error: `License number ${license_number} already exists at index ${i}`
          });
        }
      }

      const newClinicians = await Clinician.bulkCreate(
        clinicians.map(clinician => ({
          first_name: clinician.first_name,
          last_name: clinician.last_name,
          email: clinician.email.toLowerCase(),
          specialty: clinician.specialty || null,
          license_number: clinician.license_number,
          phone: clinician.phone || null,
          status: clinician.status || "active",
          clinician_list_id: clinician.clinician_list_id,
        })), {
          validate: true
        }
      );

      res.status(201).json({
        message: "Clinicians created successfully",
        data: newClinicians
      });
    } catch (error) {
      if (error.name === "SequelizeUniqueConstraintError") {
        const field = Object.keys(error.fields)[0];
        const value = error.fields[field];
        const index = clinicians.findIndex(c =>
          (field === "email" && c.email.toLowerCase() === value) ||
          (field === "license_number" && c.license_number === value)
        );
        return res.status(400).json({
          error: `${field === "email" ? "Email" : "License number"} ${value} already exists at index ${index >= 0 ? index : "unknown"}`
        });
      }
      res.status(500).json({
        error: "Failed to create clinicians",
        details: error.message
      });
    }
  });

  app.put("/clinicians/:id", validationClinician, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: errors.array().map(err => err.msg).join(", ")
      });
    }

    try {
      const clinician = await Clinician.findByPk(req.params.id);
      if (!clinician) return res.status(404).json({
        error: "Clinician not found"
      });

      const data = req.body.clinicians ? req.body.clinicians[0] : req.body;
      const {
        first_name,
        last_name,
        email,
        specialty,
        license_number,
        phone,
        status,
        clinician_list_id
      } = data;

      if (email && email.toLowerCase() !== clinician.email) {
        const existingEmail = await Clinician.findOne({
          where: {
            email: email.toLowerCase()
          }
        });
        if (existingEmail) {
          return res.status(400).json({
            error: `Email ${email} already exists`
          });
        }
      }

      if (license_number && license_number !== clinician.license_number) {
        const existingLicense = await Clinician.findOne({
          where: {
            license_number
          }
        });
        if (existingLicense) {
          return res.status(400).json({
            error: `License number ${license_number} already exists`
          });
        }
      }

      await clinician.update({
        first_name: first_name || clinician.first_name,
        last_name: last_name || clinician.last_name,
        email: email ? email.toLowerCase() : clinician.email,
        specialty: specialty !== undefined ? specialty : clinician.specialty,
        license_number: license_number || clinician.license_number,
        phone: phone !== undefined ? phone : clinician.phone,
        status: status || clinician.status,
        clinician_list_id: clinician_list_id || clinician.clinician_list_id,
      });

      res.status(200).json({
        message: "Clinician updated successfully",
        data: clinician
      });
    } catch (error) {
      if (error.name === "SequelizeUniqueConstraintError") {
        const field = Object.keys(error.fields)[0];
        const value = error.fields[field];
        return res.status(400).json({
          error: `${field === "email" ? "Email" : "License number"} ${value} already exists`
        });
      }
      res.status(500).json({
        error: "Failed to update clinician",
        details: error.message
      });
    }
  });

  app.get("/clinicians", async (req, res) => {
    try {
      const clinicians = await Clinician.findAll({
        where: {
          status: "active"
        }
      });
      res.status(200).json({
        data: clinicians
      });
    } catch (error) {
      res.status(500).json({
        error: "Failed to fetch clinicians",
        details: error.message
      });
    }
  });

  app.get("/clinicians/:id", async (req, res) => {
    try {
      const clinician = await Clinician.findByPk(req.params.id);
      if (!clinician) return res.status(404).json({
        error: "Clinician not found"
      });
      res.status(200).json({
        data: clinician
      });
    } catch (error) {
      res.status(500).json({
        error: "Failed to fetch clinician",
        details: error.message
      });
    }
  });

  app.delete("/clinicians/:id", async (req, res) => {
    try {
      const clinician = await Clinician.findByPk(req.params.id);
      if (!clinician) return res.status(404).json({
        error: "Clinician not found"
      });

      await clinician.destroy();
      res.status(200).json({
        message: "Clinician permanently deleted"
      });
    } catch (error) {
      res.status(500).json({
        error: "Failed to delete clinician",
        details: error.message
      });
    }
  });

};