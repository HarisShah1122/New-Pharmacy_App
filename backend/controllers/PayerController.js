const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');
const Payer = require('../models/Payer');
const { registerPayerValidation, updatePayerValidation } = require('../helpers/validation');

const sendResponse = (res, status, success, message, data = null, error = null) => {
  res.status(status).json({
    success,
    message,
    data,
    error,
  });
};

module.exports.controller = function (app) {
  app.post('/payer/register', registerPayerValidation, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendResponse(res, 400, false, 'Validation failed', null, errors.array());
    }

    const { email, payer_name, address, contact_info, status } = req.body;
    try {
      const trimmedPayerName = payer_name.trim();
      const existingPayer = await Payer.findOne({
        where: {
          [Op.or]: [{ email }, { payer_name }],
        },
      });
      if (existingPayer) {
        const duplicateField = existingPayer.email === email ? 'Email' : 'Payer name';
        return sendResponse(res, 409, false, `${duplicateField} is already in use.`);
      }

      const newPayer = await Payer.create({
        email,
        payer_name,
        address,
        contact_info,
        status: status || 'active',
      });

      sendResponse(res, 201, true, 'Payer registered successfully', { payer: newPayer });
    } catch (error) {
      console.error('Error in POST /payer/register:', error);
      sendResponse(res, 500, false, 'Failed to register payer', null, error.message);
    }
  });

  app.get('/payer', async (req, res) => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;
  
      const { count, rows } = await Payer.findAndCountAll({
        limit: parseInt(limit),
        offset,
        order: [['createdAt', 'DESC']], 
      });
  
      sendResponse(res, 200, true, 'Payers retrieved successfully', {
        payers: rows,
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / limit),
      });
    } catch (error) {
      sendResponse(res, 500, false, 'Failed to fetch payers', null, error.message);
    }
  });

  app.get('/payer/:id', async (req, res) => {
    try {
      const payer = await Payer.findByPk(req.params.id);
      if (!payer) return sendResponse(res, 404, false, 'Payer not found');
      sendResponse(res, 200, true, 'Payer retrieved successfully', payer);
    } catch (error) {
    
      sendResponse(res, 500, false, 'Failed to fetch payer', null, error.message);
    }
  });

  app.put('/payer/:id', updatePayerValidation, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendResponse(res, 400, false, 'Validation failed', null, errors.array());
    }

    try {
      const { email, payer_name, address, contact_info, status } = req.body;
      const payer = await Payer.findByPk(req.params.id);
      if (!payer) return sendResponse(res, 404, false, 'Payer not found');

      const updates = {};
      if (email) updates.email = email;
      if (payer_name) updates.payer_name = payer_name;
      if (address) updates.address = address;
      if (contact_info) updates.contact_info = contact_info;
      if (status) updates.status = status;

      await payer.update(updates);
      const updatedPayer = await Payer.findByPk(req.params.id);
      sendResponse(res, 200, true, 'Payer updated successfully', updatedPayer);
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return sendResponse(res, 409, false, 'Email or payer name already in use');
      }
      
      sendResponse(res, 500, false, 'Failed to update payer', null, error.message);
    }
  });
  app.put('/payer/:id/activate', async (req, res) => {
    try {
      const payer = await Payer.findByPk(req.params.id);
      if (!payer) {
        return res.status(404).json({ error: 'Payer not found' });
      }
      if (payer.status === 'ACTIVE') {
        return res.status(400).json({ error: 'Payer is already active' });
      }
      await payer.update({ status: 'ACTIVE' });
      res.status(200).json({
        message: 'Payer activated successfully',
        data: payer,
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to activate payer',
        details: error.message,
      });
    }
  });
  
  app.put('/payer/:id/deactivate', async (req, res) => {
    try {
      const payer = await Payer.findByPk(req.params.id);
      if (!payer) {
        return res.status(404).json({ error: 'Payer not found' });
      }
      if (payer.status === 'INACTIVE') {
        return res.status(400).json({ error: 'Payer is already inactive' });
      }
      await payer.update({ status: 'INACTIVE' });
      res.status(200).json({
        message: 'Payer deactivated successfully',
        data: payer,
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to deactivate payer',
        details: error.message,
      });
    }
  });
  app.delete('/payer/:id', async (req, res) => {
    try {
      const payer = await Payer.findByPk(req.params.id);
      if (!payer) return sendResponse(res, 404, false, 'Payer not found');

      await payer.destroy();
      sendResponse(res, 200, true, 'Payer deleted successfully');
    } catch (error) {
   
      sendResponse(res, 500, false, 'Failed to delete payer', null, error.message);
    }
  });
};
