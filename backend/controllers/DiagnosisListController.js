const express = require('express');
const { validationResult } = require('express-validator');
const { validationDiagnosisList } = require('../helpers/validation');
const { DiagnosisList, sequelize } = require('../models');
const { v4: uuidv4 } = require('uuid');
const { Op } = require('sequelize');

const sendResponse = (res, status, success, message, data = null, error = null) => {
  res.status(status).json({
    success,
    message,
    data,
    error,
  });
};

module.exports.controller = function (app) {
  app.post('/diagnosis-list', async (req, res) => {
    const transaction = await DiagnosisList.sequelize.transaction();
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        await transaction.rollback();
        return res.status(400).json({
          error: errors.array().map(err => err.msg).join(', '),
        });
      }

      let diagnosisLists = req.body.diagnosisList || [req.body];

      const seenNames = new Set();
      const seenCodes = new Set();
      const duplicateIndexes = [];

      diagnosisLists.forEach((list, index) => {
        const name = list.name?.toLowerCase();
        const code = list.code?.toLowerCase();

        if (seenNames.has(name) || seenCodes.has(code)) {
          duplicateIndexes.push(index);
        } else {
          seenNames.add(name);
          seenCodes.add(code);
        }
      });

      if (duplicateIndexes.length > 0) {
        await transaction.rollback();
        return res.status(400).json({
          error: `Duplicate name or code found at indexes: ${duplicateIndexes.join(', ')}`,
        });
      }

      for (const [index, list] of diagnosisLists.entries()) {
        const { name, code, diagnosis_list_id } = list;

        if (diagnosis_list_id) {
          const parentList = await DiagnosisList.findByPk(diagnosis_list_id, { transaction });
          if (!parentList) {
            await transaction.rollback();
            return res.status(400).json({
              error: `Invalid diagnosis_list_id '${diagnosis_list_id}' at index ${index}. No DiagnosisList record found. Use a valid ID from the diagnosislists table or set to null.`,
            });
          }
        }

        const existingName = await DiagnosisList.findOne({
          where: { name: { [Op.eq]: name } }, 
          transaction,
        });
        if (existingName) {
          await transaction.rollback();
          return res.status(400).json({
            error: `A diagnosis list with name '${name}' already exists at index ${index}`,
          });
        }

        const existingCode = await DiagnosisList.findOne({
          where: sequelize.where(
            sequelize.fn('LOWER', sequelize.col('code')),
            code.toLowerCase()
          ),
          transaction,
        });
        if (existingCode) {
          await transaction.rollback();
          return res.status(400).json({
            error: `A diagnosis list with code '${code}' already exists at index ${index}`,
          });
        }
      }

      const newDiagnosisList = await DiagnosisList.bulkCreate(
        diagnosisLists.map(list => ({
          id: uuidv4(),
          name: list.name,
          code: list.code,
          status: list.status || 'inactive',
          diagnosis_list_id: list.diagnosis_list_id || null,
        })),
        { validate: true, transaction }
      );

      await transaction.commit();
      res.status(201).json({
        message: 'Diagnosis lists created successfully',
        data: newDiagnosisList,
      });
    } catch (error) {
      await transaction.rollback();
      if (error.name === 'SequelizeUniqueConstraintError') {
        const field = error.errors[0]?.path || 'unknown';
        return res.status(400).json({
          error: `A diagnosis list with this ${field} already exists`,
          details: error.message,
        });
      }
      res.status(500).json({
        error: 'Failed to create diagnosis lists',
        details: error.message,
      });
    }
  });
  app.get('/api/diagnosis-lists', async (req, res) => {
    try {
      const diagnosisLists = await DiagnosisList.findAll({
        attributes: ['id', 'name'],
      });
      sendResponse(res, 200, true, 'Diagnosis lists retrieved successfully', diagnosisLists);
    } catch (error) {
      sendResponse(res, 500, false, 'Failed to fetch diagnosis lists', null, error.message);
    }
  });

  app.put('/diagnosis-list/:id', validationDiagnosisList, async (req, res) => {
    const transaction = await DiagnosisList.sequelize.transaction();
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        await transaction.rollback();
        return res.status(400).json({
          error: errors.array().map(err => err.msg).join(', '),
        });
      }

      const { id } = req.params;
      const diagnosisList = await DiagnosisList.findByPk(id, { transaction });
      if (!diagnosisList) {
        await transaction.rollback();
        return res.status(404).json({ error: 'Diagnosis list not found' });
      }

      const { name, code, status, diagnosis_list_id } = req.body;

      let validParentList = null;
      if (diagnosis_list_id && diagnosis_list_id !== diagnosisList.diagnosis_list_id) {
        validParentList = await DiagnosisList.findByPk(diagnosis_list_id, { transaction });
      }
      const finalDiagnosisListId = validParentList ? diagnosis_list_id : null;

      if (name && name !== diagnosisList.name) {
        const existingName = await DiagnosisList.findOne({
          where: { name: { [Op.eq]: name } }, 
          transaction,
        });
        if (existingName) {
          await transaction.rollback();
          return res.status(400).json({
            error: `A diagnosis list with name '${name}' already exists`,
          });
        }
      }

      if (code && code !== diagnosisList.code) {
        const existingCode = await DiagnosisList.findOne({
          where: { code: { [Op.eq]: code } }, 
          transaction,
        });
        if (existingCode) {
          await transaction.rollback();
          return res.status(400).json({
            error: `A diagnosis list with code '${code}' already exists`,
          });
        }
      }

      await diagnosisList.update(
        {
          name: name || diagnosisList.name,
          code: code || diagnosisList.code,
          status: status !== undefined ? status : diagnosisList.status,
          diagnosis_list_id: finalDiagnosisListId !== undefined ? finalDiagnosisListId : diagnosisList.diagnosis_list_id,
        },
        { transaction }
      );

      await transaction.commit();
      res.status(200).json({
        message: 'Diagnosis list updated successfully',
        data: diagnosisList,
      });
    } catch (error) {
      await transaction.rollback();
      if (error.name === 'SequelizeUniqueConstraintError') {
        const field = error.errors[0]?.path || 'unknown';
        return res.status(400).json({
          error: `A diagnosis list with this ${field} already exists`,
          details: error.message,
        });
      }
      res.status(500).json({
        error: 'Failed to update diagnosis list',
        details: error.message,
      });
    }
  });
  app.put('/diagnosis-list/:id/activate', async (req, res) => {
    try {
      const diagnosisList = await DiagnosisList.findByPk(req.params.id);
      if (!diagnosisList) {
        return res.status(404).json({ error: 'Diagnosis list not found' });
      }
      if (diagnosisList.status === 'ACTIVE') {
        return res.status(400).json({ error: 'Diagnosis list is already active' });
      }
      await diagnosisList.update({ status: 'ACTIVE' });
      res.status(200).json({
        message: 'Diagnosis list activated successfully',
        data: diagnosisList,
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to activate diagnosis list',
        details: error.message,
      });
    }
  });
  
  app.put('/diagnosis-list/:id/deactivate', async (req, res) => {
    try {
      const diagnosisList = await DiagnosisList.findByPk(req.params.id);
      if (!diagnosisList) {
        return res.status(404).json({ error: 'Diagnosis list not found' });
      }
      if (diagnosisList.status === 'INACTIVE') {
        return res.status(400).json({ error: 'Diagnosis list is already inactive' });
      }
      await diagnosisList.update({ status: 'INACTIVE' });
      res.status(200).json({
        message: 'Diagnosis list deactivated successfully',
        data: diagnosisList,
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to deactivate diagnosis list',
        details: error.message,
      });
    }
  });
  app.get('/diagnosis-list', async (req, res) => {
    try {
      const diagnosisLists = await DiagnosisList.findAll({
        attributes: ['id', 'name', 'code', 'status', 'diagnosis_list_id'],
      });
      sendResponse(res, 200, true, 'Diagnosis lists retrieved successfully', diagnosisLists);
    } catch (error) {
      sendResponse(res, 500, false, 'Failed to fetch diagnosis lists', null, error.message);
    }
  });
};

