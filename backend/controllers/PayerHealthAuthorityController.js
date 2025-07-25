const { Op } = require('sequelize');
const PayerHealthAuthority = require('../models/PayerHealthAuthority');
const Payer = require('../models/Payer');

const sendResponse = (res, status, success, message, data = null, error = null) => {
  res.status(status).json({ success, message, data, error });
};

module.exports.controller = function (app) {
  app.post('/health-authority/register', async (req, res) => {
    const { payer_id, user_name, code, password, status } = req.body;

    if (!payer_id || !user_name) {
      return sendResponse(res, 400, false, 'Payer ID and User Name are required');
    }

    try {
      const payer = await Payer.findByPk(payer_id);
      if (!payer) {
        return sendResponse(res, 404, false, 'Payer not found');
      }

      const existingCredential = await PayerHealthAuthority.findOne({ where: { payer_id } });
      if (existingCredential) {
        return sendResponse(res, 409, false, 'Health Authority credential already exists for this payer');
      }

      const existingUserName = await PayerHealthAuthority.findOne({ where: { user_name } });
      if (existingUserName) {
        return sendResponse(res, 409, false, 'User name is already in use');
      }

      const newCredential = await PayerHealthAuthority.create({
        payer_id,
        user_name,
        code,
        password,
        status: status || 'active',
      });

      sendResponse(res, 201, true, 'Health Authority credential registered successfully', { credential: newCredential });
    } catch (error) {
      sendResponse(res, 500, false, 'Failed to register HA credential', null, error.message);
    }
  });

  app.get('/health-authority', async (req, res) => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;
      const { count, rows } = await PayerHealthAuthority.findAndCountAll({
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      sendResponse(res, 200, true, 'Health Authority credentials retrieved successfully', {
        credentials: rows,
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / limit),
      });
    } catch (error) {
      sendResponse(res, 500, false, 'Failed to fetch HA credentials', null, error.message);
    }
  });

  app.get('/payer/:payer_id/ha-credential', async (req, res) => {
    const { payer_id } = req.params;

    try {
      const payer = await Payer.findByPk(payer_id);
      if (!payer) {
        return sendResponse(res, 404, false, 'Payer not found');
      }

      const haCredential = await PayerHealthAuthority.findOne({ where: { payer_id } });
      if (!haCredential) {
        return sendResponse(res, 200, true, 'No credential found.', {
          id: null,
          payer_id,
          user_name: 'default_user',
          code: '',
          password: '',
          status: 'active',
          created_at: null,
        });
      }
      sendResponse(res, 200, true, 'HA credential retrieved successfully', haCredential);
    } catch (error) {
      sendResponse(res, 500, false, 'Failed to fetch HA credential', null, error.message);
    }
  });

  app.put('/health-authority/:id', async (req, res) => {
    const { id } = req.params;
    const { user_name, code, password, status } = req.body;

    try {
      const credential = await PayerHealthAuthority.findByPk(id);
      if (!credential) {
        return sendResponse(res, 404, false, 'HA credential not found');
      }

      const updates = {};
      if (user_name) {
        const existingUserName = await PayerHealthAuthority.findOne({
          where: { user_name, id: { [Op.ne]: id } },
        });
        if (existingUserName) {
          return sendResponse(res, 409, false, 'User name is already in use');
        }
        updates.user_name = user_name;
      }
      if (code) updates.code = code;
      if (password) updates.password = password;
      if (status) updates.status = status;

      await credential.update(updates);
      sendResponse(res, 200, true, 'HA credential updated successfully', credential);
    } catch (error) {
      sendResponse(res, 500, false, 'Failed to update HA credential', null, error.message);
    }
  });

  app.delete('/health-authority/:id', async (req, res) => {
    const { id } = req.params;

    try {
      const credential = await PayerHealthAuthority.findByPk(id);
      if (!credential) {
        return sendResponse(res, 404, false, 'HA credential not found');
      }

      await credential.destroy();
      sendResponse(res, 200, true, 'HA credential deleted successfully');
    } catch (error) {
      sendResponse(res, 500, false, 'Failed to delete HA credential', null, error.message);
    }
  });
};