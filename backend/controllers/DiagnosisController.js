const express = require('express');
const { validationResult } = require('express-validator');
const { validationDiagnosisCreate, validationDiagnosisUpdate, validationDiagnosisList } = require('../helpers/validation');
const Diagnosis = require('../models/diagnosis');
const { Op } = require('sequelize');
const router = express.Router();
const models = require('../models');
const DiagnosisList = models.DiagnosisList;
module.exports.controller = function (app) {
  app.get('/diagnoses', async (req, res) => {
    try {
      const { diagnosis_list_id, icd_code } = req.query;

      const where = {};
      if (diagnosis_list_id) {
        where.diagnosis_list_id = diagnosis_list_id;
      }
      if (icd_code) {
        where.icd_code = { [Op.like]: `%${icd_code}%` };
      }

      const diagnoses = await Diagnosis.findAll({ where });
      res.json({
        data: diagnoses,
      });
    } catch (error) {
      console.log(error); 
      res.status(500).json({
        error: 'Failed to fetch diagnoses',
        details: error.message,
      });
    }
  });

  app.get('/diagnoses/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const diagnosis = await Diagnosis.findByPk(id);
      if (!diagnosis) {
        return res.status(404).json({ error: 'Diagnosis not found' });
      }
      res.json({
        data: diagnosis,
      });
    } catch (error) {
      console.log(error); 
      res.status(500).json({
        error: 'Failed to fetch diagnosis',
        details: error.message,
      });
    }
  });

  app.post('/diagnoses', validationDiagnosisCreate, async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: errors.array().map(err => err.msg).join(', '),
        });
      }
  
      const diagnoses = Array.isArray(req.body.diagnoses) ? req.body.diagnoses : [req.body];
  
      const duplicateIndexes = [];
      const seen = new Map(); 
  
      diagnoses.forEach((item, index) => {
        const key1 = `${item.diagnosis_list_id}-${item.icd_code}`;
        const key2 = `${item.diagnosis_list_id}-${item.diagnosis_code}`;
  
        if (seen.has(key1) || seen.has(key2)) {
          duplicateIndexes.push(index);
        } else {
          seen.set(key1, true);
          seen.set(key2, true);
        }
      });
  
      if (duplicateIndexes.length > 0) {
        return res.status(400).json({
          error: `Duplicate entries found at indexes: ${duplicateIndexes.join(', ')}`,
        });
      }
  
  
      for (const [index, diagnosis] of diagnoses.entries()) {
        const { icd_code, diagnosis_code, description, diagnosis_list_id, is_primary } = diagnosis;
  
        if (!icd_code || !diagnosis_code || !description || !diagnosis_list_id) {
          return res.status(400).json({
            error: `Required fields missing in diagnosis at index ${index} (icd_code, diagnosis_code, description, diagnosis_list_id)`,
          });
        }
  
        const diagnosisList = await DiagnosisList.findByPk(diagnosis_list_id);
        if (!diagnosisList) {
          return res.status(400).json({
            error: `Invalid diagnosis_list_id ${diagnosis_list_id} at index ${index}`,
          });
        }
  
        const existingIcd = await Diagnosis.findOne({
          where: { icd_code, diagnosis_list_id },
        });
        if (existingIcd) {
          return res.status(400).json({
            error: `ICD code ${icd_code} already exists for diagnosis list ${diagnosis_list_id} at index ${index}`,
          });
        }
  
        const existingCode = await Diagnosis.findOne({
          where: { diagnosis_code, diagnosis_list_id },
        });
        if (existingCode) {
          return res.status(400).json({
            error: `Diagnosis code ${diagnosis_code} already exists for diagnosis list ${diagnosis_list_id} at index ${index}`,
          });
        }
      }
  
      const newDiagnoses = await Diagnosis.bulkCreate(
        diagnoses.map(diagnosis => ({
          icd_code: diagnosis.icd_code,
          diagnosis_code: diagnosis.diagnosis_code,
          description: diagnosis.description,
          is_primary: diagnosis.is_primary !== undefined ? diagnosis.is_primary : false,
          diagnosis_list_id: diagnosis.diagnosis_list_id,
        })),
        { validate: true }
      );
  
      res.status(201).json({
        message: 'Diagnoses added successfully',
        data: newDiagnoses,
      });
    } catch (error) {
      console.log(error); 
      if (error.name === 'SequelizeUniqueConstraintError') {
        const field = Object.keys(error.fields)[0];
        const value = error.fields[field];
        return res.status(400).json({
          error: `${field} ${value} already exists`,
        });
      }
      res.status(500).json({
        error: 'Failed to add diagnoses',
        details: error.message,
      });
    }
  });
  

  app.put('/diagnoses/:id', validationDiagnosisUpdate, async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: errors.array().map(err => err.msg).join(', '),
        });
      }

      const { id } = req.params;
      const { icd_code, diagnosis_code, description, is_primary, diagnosis_list_id } = req.body;

      const diagnosis = await Diagnosis.findByPk(id);
      if (!diagnosis) {
        return res.status(404).json({ error: 'Diagnosis not found' });
      }

      if (diagnosis_list_id) {
        const diagnosisList = await DiagnosisList.findByPk(diagnosis_list_id);
        if (!diagnosisList) {
          return res.status(400).json({
            error: `Invalid diagnosis_list_id ${diagnosis_list_id}`,
          });
        }
      }

      if (icd_code && diagnosis_list_id) {
        const existing = await Diagnosis.findOne({
          where: {
            icd_code,
            diagnosis_list_id,
            id: { [Op.ne]: id },
          },
        });
        if (existing) {
          return res.status(400).json({
            error: `ICD code ${icd_code} already exists for diagnosis list ${diagnosis_list_id}`,
          });
        }
      }

      if (diagnosis_code && diagnosis_list_id) {
        const existingCode = await Diagnosis.findOne({
          where: {
            diagnosis_code,
            diagnosis_list_id,
            id: { [Op.ne]: id },
          },
        });
        if (existingCode) {
          return res.status(400).json({
            error: `Diagnosis code ${diagnosis_code} already exists for diagnosis list ${diagnosis_list_id}`,
          });
        }
      }

      await diagnosis.update({
        icd_code: icd_code || diagnosis.icd_code,
        diagnosis_code: diagnosis_code || diagnosis.diagnosis_code,
        description: description || diagnosis.description,
        is_primary: is_primary !== undefined ? is_primary : diagnosis.is_primary,
        diagnosis_list_id: diagnosis_list_id || diagnosis.diagnosis_list_id,
      });

      res.json({
        message: 'Diagnosis updated successfully',
        data: diagnosis,
      });
    } catch (error) {
      console.log(error); 
      if (error.name === 'SequelizeUniqueConstraintError') {
        const field = Object.keys(error.fields)[0];
        const value = error.fields[field];
        return res.status(400).json({
          error: `${field} ${value} already exists`,
        });
      }
      res.status(500).json({
        error: 'Failed to update diagnosis',
        details: error.message,
      });
    }
  });

  app.delete('/diagnosis/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const diagnosis = await Diagnosis.findByPk(id);
      if (!diagnosis) {
        return res.status(404).json({ error: 'Diagnosis not found' });
      }

      await diagnosis.destroy();
      res.json({
        message: 'Diagnosis deleted successfully',
      });
    } catch (error) {
      console.log(error); 
      res.status(500).json({
        error: 'Failed to delete diagnosis',
        details: error.message,
      });
    }
  });
};