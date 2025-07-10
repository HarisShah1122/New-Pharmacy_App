const { Op } = require("sequelize");
const { v4: uuidv4 } = require("uuid");
const { body, validationResult } = require("express-validator");
const Prescription = require("../models/Prescription");
const sequelize = require("../config/database");
const { validationPrescription } = require("../helpers/validation");

module.exports.controller = function (app) {
  app.post(
    "/save_prescription",
    validationPrescription,
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: "Validation failed",
          details: errors.array(),
        });
      }

      let transaction;
      try {
        transaction = await sequelize.transaction();

        const {
          erx_no,
          erx_date,
          prescriber_id,
          member_id,
          payer_tpa,
          emirates_id,
          reason_of_unavailability,
          name,
          gender,
          date_of_birth,
          weight,
          mobile,
          email,
          fill_date,
          physician,
          prescription_date,
        } = req.body;

        const prescriptionData = {
          id: uuidv4(),
          erx_no,
          erx_date: new Date(erx_date),
          prescriber_id,
          member_id,
          name,
          payer_tpa,
          emirates_id,
          reason_of_unavailability,
          gender,
          date_of_birth: new Date(date_of_birth),
          weight: parseInt(weight),
          mobile,
          email,
          fill_date: new Date(fill_date),
          physician,
          prescription_date: new Date(prescription_date),
        };

        const prescription = await Prescription.create(prescriptionData, {
          transaction,
        });

        await transaction.commit();
        res.status(201).json({
          message: "Prescription saved successfully",
          prescription_id: prescription.id,
        });
      } catch (error) {
        console.log(error); 
        if (transaction) await transaction.rollback();
        return res.status(500).json({
          error: "Failed to save prescription",
          details: error.message,
        });
      }
    }
  );

  app.get("/prescriptions/:id", async (req, res) => {
    try {
      const { id } = req.params;

      const prescription = await Prescription.findOne({
        where: { id },
      });

      if (!prescription) {
        return res.status(404).json({ error: "Prescription not found" });
      }

      res.status(200).json(prescription);
    } catch (error) {
      console.log(error); 
      console.error(error);
      res.status(500).json({
        error: "Failed to fetch prescription",
        details: error.message,
      });
    }
  });
};