const { validationResult } = require("express-validator");
const { v4: uuidv4 } = require("uuid");
const models = require("../models");
const { DrugList, DiagnosisList, ClinicianList, HealthAuthorityConfig, HealthAuthorities } = models;
const express = require("express");
const router = express.Router();
const { validateHealthAuthorityConfig } = require("../helpers/validation");

module.exports.controller = function (app) {

    app.get("/api/health/authorities", async (req, res) => {
        try {
            const configs = await HealthAuthorities.findAll();
            res.status(200).json({
                data: configs
            });
        } catch (error) {
            res.status(500).json({
                error: "Failed to fetch health authority configs",
                details: error.message
            });
        }
    });

    app.post("/health-authority-config", validateHealthAuthorityConfig, async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: errors.array().map(err => err.msg).join(", ")
            });
        }

        const { drug_list_id, diagnosis_list_id, clinician_list_id } = req.body;

        try {
            const drugList = await DrugList.findByPk(drug_list_id);
            if (!drugList) {
                return res.status(404).json({
                    error: "Drug list ID does not exist"
                });
            }

            const diagnosisList = await DiagnosisList.findByPk(diagnosis_list_id);
            if (!diagnosisList) {
                return res.status(404).json({
                    error: "Diagnosis list ID does not exist"
                });
            }

            const clinicianList = await ClinicianList.findByPk(clinician_list_id);
            if (!clinicianList) {
                return res.status(404).json({
                    error: "Clinician list ID does not exist"
                });
            }

            const config = await HealthAuthorityConfig.create({
                health_authority_id: uuidv4(),
                drug_list_id,
                diagnosis_list_id,
                clinician_list_id,
            });

            res.status(201).json({
                message: "Health authority config created successfully",
                data: config
            });
        } catch (error) {
            res.status(500).json({
                error: "Failed to create health authority config",
                details: error.message
            });
        }
    });

    app.get("/health-authority-configs", async (req, res) => {
        try {
            const configs = await HealthAuthorityConfig.findAll();
            res.status(200).json({
                data: configs
            });
        } catch (error) {
            res.status(500).json({
                error: "Failed to fetch health authority configs",
                details: error.message
            });
        }
    });

    app.get("/health-authority-configs/:id", async (req, res) => {
        try {
            const config = await HealthAuthorityConfig.findByPk(req.params.id);
            if (!config) {
                return res.status(404).json({
                    error: "Health authority config not found"
                });
            }
            res.status(200).json({
                data: config
            });
        } catch (error) {
            res.status(500).json({
                error: "Failed to fetch health authority config",
                details: error.message
            });
        }
    });

    app.put("/health-authority-configs/:id", async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: errors.array().map(err => err.msg).join(", ")
            });
        }

        try {
            const config = await HealthAuthorityConfig.findByPk(req.params.id);
            if (!config) {
                return res.status(404).json({
                    error: "Health authority config not found"
                });
            }

            const { drug_list_id, diagnosis_list_id, clinician_list_id } = req.body;

            const drugList = await DrugList.findByPk(drug_list_id);
            if (!drugList) {
                return res.status(404).json({
                    error: "Drug list ID does not exist"
                });
            }

            const diagnosisList = await DiagnosisList.findByPk(diagnosis_list_id);
            if (!diagnosisList) {
                return res.status(404).json({
                    error: "Diagnosis list ID does not exist"
                });
            }

            const clinicianList = await ClinicianList.findByPk(clinician_list_id);
            if (!clinicianList) {
                return res.status(404).json({
                    error: "Clinician list ID does not exist"
                });
            }

            await config.update({
                drug_list_id,
                diagnosis_list_id,
                clinician_list_id,
            });

            res.status(200).json({
                message: "Health authority config updated successfully",
                data: config
            });
        } catch (error) {
            res.status(500).json({
                error: "Failed to update health authority config",
                details: error.message
            });
        }
    });

    app.delete("/health-authority-configs/:id", async (req, res) => {
        try {
            const config = await HealthAuthorityConfig.findByPk(req.params.id);
            if (!config) {
                return res.status(404).json({
                    error: "Health authority config not found"
                });
            }

            await config.destroy();
            res.status(204).json({
                message: "Health authority config deleted"
            });
        } catch (error) {
            res.status(500).json({
                error: "Failed to delete health authority config",
                details: error.message
            });
        }
    });

}