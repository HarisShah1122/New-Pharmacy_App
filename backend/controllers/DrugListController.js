const express = require("express");
const { validationResult } = require("express-validator");
const models = require("../models/index");
const { validationDrugList } = require('../helpers/validation');
const Drug = models.Drug;
const DrugList = models.DrugList;
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports.controller = function (app) {
  app.post('/drug-lists', async (req, res) => {
    const transaction = await DrugList.sequelize.transaction();
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        await transaction.rollback();
        return res.status(400).json({
          error: errors.array().map(err => err.msg).join(', '),
        });
      }

      const { drugs } = req.body;
      if (!drugs || !Array.isArray(drugs) || drugs.length === 0) {
        await transaction.rollback();
        return res.status(400).json({ error: 'Drugs array is required and cannot be empty' });
      }

      const seenNames = new Set();
      const seenCodes = new Set();
      const duplicateIndexes = [];

      for (const [index, drug] of drugs.entries()) {
        const name = drug.name?.toLowerCase();
        const code = drug.code?.toLowerCase();

        if (!name || !code) {
          await transaction.rollback();
          return res.status(400).json({
            error: `Name and code are required at index ${index}`,
          });
        }

        if (seenNames.has(name) || seenCodes.has(code)) {
          duplicateIndexes.push(index);
        } else {
          seenNames.add(name);
          seenCodes.add(code);
        }

        const existingName = await DrugList.findOne({
          where: { name: { [Op.eq]: drug.name } },
          transaction,
        });
        if (existingName) {
          await transaction.rollback();
          return res.status(400).json({
            error: `A drug list with name '${drug.name}' already exists at index ${index}`,
          });
        }

        const existingCode = await DrugList.findOne({
          where: { code: { [Op.eq]: drug.code } },
          transaction,
        });
        if (existingCode) {
          await transaction.rollback();
          return res.status(400).json({
            error: `A drug list with code '${drug.code}' already exists at index ${index}`,
          });
        }
      }

      if (duplicateIndexes.length > 0) {
        await transaction.rollback();
        return res.status(400).json({
          error: `Duplicate name or code found at indexes: ${duplicateIndexes.join(', ')}`,
        });
      }

      const newDrugLists = await DrugList.bulkCreate(
        drugs.map(drug => ({
          drug_list_id: uuidv4(), 
          name: drug.name,
          code: drug.code,
          status: drug.status && ['active', 'inactive'].includes(drug.status) ? drug.status : 'active',
        })),
        { validate: true, transaction }
      );

      await transaction.commit();
      res.status(201).json({
        message: 'Drug lists created successfully',
        data: newDrugLists.map(list => ({
          drug_list_id: list.drug_list_id,
          name: list.name,
          code: list.code,
          status: list.status,
          createdAt: list.createdAt,
          updatedAt: list.updatedAt,
        })),
      });
    } catch (error) {
      await transaction.rollback();
      if (error.name === 'SequelizeUniqueConstraintError') {
        const field = error.errors[0]?.path || 'unknown';
        return res.status(400).json({
          error: `A drug list with this ${field} already exists`,
          details: error.message,
        });
      }
      console.error('Error creating drug lists:', error);
      res.status(500).json({
        error: 'Failed to create drug lists',
        details: error.message,
      });
    }
  });
  
  app.get('/api/drug-lists', async (req, res) => {
    try {
      const drugLists = await models.DrugList.findAll({
        attributes: ['drug_list_id', 'name'],
      });
      res.status(200).json({ data: drugLists });
    } catch (error) {
      console.error('Error fetching drug lists:', error);
      res.status(500).json({
        error: 'Failed to fetch drug lists',
        details: error.message,
      });
    }
  });
  app.get("/drug-lists", async (req, res) => {
    try {
      const drugLists = await DrugList.findAll({
        attributes: ['drug_list_id', 'name', 'code', 'status', 'createdAt', 'updatedAt'],
      });
      res.status(200).json({
        data: drugLists.map(list => ({
          drug_list_id: list.drug_list_id,
          name: list.name,
          code: list.code,
          status: list.status,
          createdAt: list.createdAt,
          updatedAt: list.updatedAt,
        })),
      });
    } catch (error) {
      console.error('Error fetching drug lists:', error);
      res.status(500).json({
        error: "Failed to fetch drug lists",
        details: error.message,
      });
    }
  });

  app.get("/drug-lists/:drug_list_id", async (req, res) => {
    try {
      const drugList = await DrugList.findByPk(req.params.drug_list_id, {
        attributes: ['drug_list_id', 'name', 'code', 'status', 'createdAt', 'updatedAt'],
      });
      if (!drugList) return res.status(404).json({ error: "Drug list not found" });
      res.status(200).json({
        data: {
          drug_list_id: drugList.drug_list_id,
          name: drugList.name,
          code: drugList.code,
          status: drugList.status,
          createdAt: drugList.createdAt,
          updatedAt: drugList.updatedAt,
        },
      });
    } catch (error) {
      console.error('Error fetching drug list:', error);
      res.status(500).json({
        error: "Failed to fetch drug list",
        details: error.message,
      });
    }
  });
  app.get('/api/drug-lists', async (req, res) => {
    try {
      const drugLists = await models.DrugList.findAll({
        attributes: ['drug_list_id', 'name', 'code', 'status', 'createdAt', 'updatedAt'],
      });
      res.status(200).json({ data: drugLists });
    } catch (error) {
      console.error('Error fetching drug lists:', error);
      res.status(500).json({ error: 'Failed to fetch drug lists', details: error.message });
    }
  });
  app.put("/drug-lists/:drug_list_id", validationDrugList, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: errors.array().map(err => err.msg).join(", "),
      });
    }

    try {
      const drugList = await DrugList.findByPk(req.params.drug_list_id);
      if (!drugList) return res.status(404).json({ error: "Drug list not found" });

      const { name, code, status } = req.body;

      if (name && name !== drugList.name) {
        const existingName = await DrugList.findOne({ where: { name } });
        if (existingName) {
          return res.status(400).json({
            error: "A drug list with this name already exists",
          });
        }
      }

      if (code && JSON.stringify(code) !== JSON.stringify(drugList.code)) {
        const existingCode = await DrugList.findOne({ where: { code } });
        if (existingCode) {
          return res.status(400).json({
            error: "A drug list with this code already exists",
          });
        }
      }

      await drugList.update({
        name: name || drugList.name,
        code: code || drugList.code,
        status: status !== undefined ? status : drugList.status,
      });

      res.status(200).json({
        message: "Drug list updated successfully",
        data: {
          drug_list_id: drugList.drug_list_id,
          name: drugList.name,
          code: drugList.code,
          status: drugList.status,
          createdAt: drugList.createdAt,
          updatedAt: drugList.updatedAt,
        },
      });
    } catch (error) {
      console.error('Error updating drug list:', error);
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({
          error: "A drug list with this name or code already exists",
          details: error.message,
        });
      }
      res.status(500).json({
        error: "Failed to update drug list",
        details: error.message,
      });
    }
  });

app.put('/drug-lists/:id/activate', async (req, res) => {
  try {
    const drugList = await DrugList.findByPk(req.params.id);
    if (!drugList) {
      return res.status(404).json({ error: 'Drug list not found' });
    }
    if (drugList.status === 'ACTIVE') {
      return res.status(400).json({ error: 'Drug list is already active' });
    }
    await drugList.update({ status: 'ACTIVE' });
    res.status(200).json({
      message: 'Drug list activated successfully',
      data: drugList,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to activate drug list',
      details: error.message,
    });
  }
});

app.put('/drug-lists/:id/deactivate', async (req, res) => {
  try {
    const drugList = await DrugList.findByPk(req.params.id);
    if (!drugList) {
      return res.status(404).json({ error: 'Drug list not found' });
    }
    if (drugList.status === 'INACTIVE') {
      return res.status(400).json({ error: 'Drug list is already inactive' });
    }
    await drugList.update({ status: 'INACTIVE' });
    res.status(200).json({
      message: 'Drug list deactivated successfully',
      data: drugList,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to deactivate drug list',
      details: error.message,
    });
  }
});
  app.delete("/drug-lists/:drug_list_id", async (req, res) => {
    try {
      const drugList = await DrugList.findByPk(req.params.drug_list_id);
      if (!drugList) return res.status(404).json({ error: "Drug list not found" });

      const associatedDrugs = await Drug.findOne({
        where: { drug_list_id: req.params.drug_list_id },
      });
      if (associatedDrugs) {
        return res.status(400).json({
          error: "Cannot delete drug list with associated drugs",
        });
      }

      await drugList.destroy();
      res.status(200).json({ message: "Drug list permanently deleted" });
    } catch (error) {
      console.error('Error deleting drug list:', error);
      res.status(500).json({
        error: "Failed to delete drug list",
        details: error.message,
      });
    }
  });
};
