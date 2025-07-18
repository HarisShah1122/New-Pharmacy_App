const { validationResult } = require("express-validator");
const { Op } = require("sequelize");
const Drug = require("../models/drugs");
const express = require("express");
const { validationDrug } = require("../helpers/validation");
const router = express.Router();

module.exports.controller = function (app) {
  app.post("/drugs", validationDrug, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: errors.array().map((err) => err.msg).join(", "),
      });
    }

    try {
      const drugs = req.body.drugs;

      for (let i = 0; i < drugs.length; i++) {
        const { id } = drugs[i];
        const existingDrug = await Drug.findOne({
          where: { id }
        });
        if (existingDrug) {
          return res.status(400).json({
            error: `Drug with ID ${id} already exists at index ${i}`
          });
        }
      }

      const newDrugs = await Drug.bulkCreate(
        drugs.map(drug => ({
          id: drug.id,
          ndc_drug_code: drug.ndc_drug_code,
          ha_code: drug.ha_code,
          trade_name: drug.trade_name,
          status: drug.status,
          manufacturer: drug.manufacturer,
          local_agent: drug.local_agent,
          dosage_form: drug.dosage_form,
          package_type: drug.package_type,
          package_size: drug.package_size,
          granular_unit: drug.granular_unit,
          unit_type: drug.unit_type,
          active_ingredients: drug.active_ingredients,
          strengths: drug.strengths,
          start_date: drug.start_date,
          end_date: drug.end_date,
          dispensed_quantity: drug.dispensed_quantity,
          days_of_supply: drug.days_of_supply,
          instructions: drug.instructions || null,
          drug_list_id: drug.drug_list_id,
        })), {
          validate: true
        }
      );
      res.status(201).json({
        message: "Drugs added successfully",
        data: newDrugs
      });
    } catch (error) {
      res.status(500).json({
        error: "Failed to add drugs",
        details: error.message
      });
    }
  });

  app.get("/drugs", async (req, res) => {
    try {
      const { drug_list_id, ndc_drug_code } = req.query;
      const where = {};
      if (drug_list_id) {
        where.drug_list_id = drug_list_id;
      }
      if (ndc_drug_code) {
        where.ndc_drug_code = {
          [Op.like]: `%${ndc_drug_code}%`
        };
      }
      const drugs = await Drug.findAll({ where });
      res.json({
        data: drugs
      });
    } catch (error) {
      res.status(500).json({
        error: "Failed to fetch drugs",
        details: error.message || 'Unknown server error'
      });
    }
  });

  app.get("/drugs/:id", async (req, res) => {
    try {
      const { id } = req.params;
      console.log(`Fetching drug with ID: ${id}`);
      const drug = await Drug.findByPk(id);
      if (!drug) {
        console.log(`Drug not found for ID: ${id}`);
        return res.status(404).json({
          error: "Drug not found"
        });
      }
      console.log('Drug data:', drug.toJSON());
      res.json({
        data: drug
      });
    } catch (error) {
      console.error('Error in /drugs/:id:', error);
      res.status(500).json({
        error: "Failed to fetch drug",
        details: error.message
      });
    }
  });

  app.put("/drugs/:id", async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: errors.array().map((err) => err.msg).join(", "),
      });
    }

    try {
      const { id } = req.params;
      const {
        ndc_drug_code,
        ha_code,
        trade_name,
        status,
        manufacturer,
        local_agent,
        dosage_form,
        package_type,
        package_size,
        granular_unit,
        unit_type,
        active_ingredients,
        strengths,
        start_date,
        end_date,
        dispensed_quantity,
        days_of_supply,
        instructions,
        drug_list_id
      } = req.body;

      const drug = await Drug.findByPk(id);
      if (!drug) return res.status(404).json({
        error: "Drug not found"
      });

      await drug.update({
        ndc_drug_code,
        ha_code,
        trade_name,
        status,
        manufacturer,
        local_agent,
        dosage_form,
        package_type,
        package_size,
        granular_unit,
        unit_type,
        active_ingredients,
        strengths,
        start_date,
        end_date,
        dispensed_quantity,
        days_of_supply,
        instructions: instructions || null,
        drug_list_id
      });
      res.json({
        message: "Drug updated successfully",
        data: drug
      });
    } catch (error) {
      res.status(500).json({
        error: "Failed to update drug",
        details: error.message
      });
    }
  });

  app.delete("/drugs/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const drug = await Drug.findByPk(id);
      if (!drug) return res.status(404).json({
        error: "Drug not found"
      });

      await drug.destroy();
      res.json({
        message: "Drug deleted successfully"
      });
    } catch (error) {
      res.status(500).json({
        error: "Failed to delete drug",
        details: error.message
      });
    }
  });
};