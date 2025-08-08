const express = require("express");
const { body, validationResult } = require("express-validator");
const models = require("../models/index");
const { v4: uuidv4 } = require("uuid");
const { validationClinicianList } = require("../helpers/validation"); 

const Clinicians = models.Clinician;
const ClinicianList = models.ClinicianList;

module.exports.controller = function (app) {
  app.post("/clinician-lists", validationClinicianList, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: errors.array().map(err => err.msg).join(", "),
      });
    }

    const { name, code, status, clinician_list_id } = req.body;

    try {
      const id = uuidv4();
      if (code) {
        const existingCode = await ClinicianList.findOne({ where: { code } });
        if (existingCode) {
          return res.status(400).json({ error: `Code ${code} already exists` });
        }
      }

      const newClinicianList = await ClinicianList.create({
        id,
        name,
        code,
        status: status || 'ACTIVE',
        clinician_list_id
      });

      res.status(201).json({
        message: "Clinician list created successfully",
        data: newClinicianList,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        error: "Failed to create clinician list",
        details: error.message,
      });
    }
  });

  app.get("/clinician-lists", async (req, res) => {
    try {
      const clinicianLists = await ClinicianList.findAll();
      res.status(200).json({ data: clinicianLists });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        error: "Failed to fetch clinician lists",
        details: error.message,
      });
    }
  });

  app.get("/clinician-lists/:id", async (req, res) => {
    try {
      const clinicianList = await ClinicianList.findByPk(req.params.id);
      if (!clinicianList) {
        return res.status(404).json({ error: "Clinician list not found" });
      }
      res.status(200).json({ data: clinicianList });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        error: "Failed to fetch clinician list",
        details: error.message,
      });
    }
  });

  app.put("/clinician-lists/:id", validationClinicianList, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: errors.array().map(err => err.msg).join(", "),
      });
    }

    try {
      const clinicianList = await ClinicianList.findByPk(req.params.id);
      if (!clinicianList) {
        return res.status(404).json({ error: "Clinician list not found" });
      }

      const { name, code, status, clinician_list_id } = req.body;

      if (code && code !== clinicianList.code) {
        const existingCode = await ClinicianList.findOne({ where: { code } });
        if (existingCode) {
          return res.status(400).json({ error: `Code ${code} already exists` });
        }
      }

      await clinicianList.update({
        name: name || clinicianList.name,
        code: code !== undefined ? code : clinicianList.code,
        status: status || clinicianList.status,
        clinician_list_id: clinician_list_id !== undefined ? clinician_list_id : clinicianList.clinician_list_id
      });

      res.status(200).json({
        message: "Clinician list updated successfully",
        data: clinicianList,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        error: "Failed to update clinician list",
        details: error.message,
      });
    }
  });
  
app.put('/clinician-lists/:id/activate', async (req, res) => {
  try {
    const clinicianList = await ClinicianList.findByPk(req.params.id);
    if (!clinicianList) {
      return res.status(404).json({ error: 'Clinician list not found' });
    }
    if (clinicianList.status === 'ACTIVE') {
      return res.status(400).json({ error: 'Clinician list is already active' });
    }
    await clinicianList.update({ status: 'ACTIVE' });
    res.status(200).json({
      message: 'Clinician list activated successfully',
      data: clinicianList,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to activate clinician list',
      details: error.message,
    });
  }
});

app.put('/clinician-lists/:id/deactivate', async (req, res) => {
  try {
    const clinicianList = await ClinicianList.findByPk(req.params.id);
    if (!clinicianList) {
      return res.status(404).json({ error: 'Clinician list not found' });
    }
    if (clinicianList.status === 'INACTIVE') {
      return res.status(400).json({ error: 'Clinician list is already inactive' });
    }
    await clinicianList.update({ status: 'INACTIVE' });
    res.status(200).json({
      message: 'Clinician list deactivated successfully',
      data: clinicianList,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to deactivate clinician list',
      details: error.message,
    });
  }
});

  app.delete("/clinician-lists/:id", async (req, res) => {
    try {
      const clinicianList = await ClinicianList.findByPk(req.params.id);
      if (!clinicianList) {
        return res.status(404).json({ error: "Clinician list not found" });
      }

      const associatedClinicians = await Clinicians.findOne({
        where: { clinician_list_id: req.params.id },
      });
      if (associatedClinicians) {
        return res.status(400).json({
          error: "Cannot delete clinician list with associated clinicians",
        });
      }

      await clinicianList.destroy();
      res.status(200).json({ message: "Clinician list permanently deleted" });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        error: "Failed to delete clinician list",
        details: error.message,
      });
    }
  });
};