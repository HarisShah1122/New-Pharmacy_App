const { validationResult } = require('express-validator');
const models = require('../models');
const { HealthAuthority } = require('../models');
const express = require('express');
const router = express.Router();

let validateHealthAuthority, validateHealthAuthoritiesBulk, validateSettings;
try {
  const validation = require('../helpers/validation.js');
  validateHealthAuthority = validation.validateHealthAuthority;
  validateHealthAuthoritiesBulk = validation.validateHealthAuthoritiesBulk;
  validateSettings = validation.validateSettings;
} catch (error) {
  validateHealthAuthority = [];
  validateHealthAuthoritiesBulk = [];
  validateSettings = [];
}

if (!Array.isArray(validateHealthAuthoritiesBulk)) {
  validateHealthAuthoritiesBulk = [];
}

module.exports.controller = function (app) {
  app.get('/api/health-authorities', async (req, res) => {
    try {
      const authorities = await HealthAuthority.findAll();
      const formattedAuthorities = authorities.map((authority) => ({
        ...authority.toJSON(),
        status: authority.status.toLowerCase(),
      }));
      res.status(200).json({ data: formattedAuthorities });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to fetch health authorities',
        details: error.message,
      });
    }
  });

  app.get('/api/health-authorities/:id', async (req, res) => {
    try {
      const authority = await HealthAuthority.findByPk(req.params.id);
      if (!authority) {
        return res.status(404).json({ error: 'Health authority not found' });
      }
      res.status(200).json({ data: authority.toJSON() });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to fetch health authority details',
        details: error.message,
      });
    }
  });

  app.post('/api/health-authorities', validateHealthAuthoritiesBulk, async (req, res) => {
    if (!req.body || !req.body.health_authorities) {
      return res.status(400).json({ error: 'Request body with health_authorities array is required' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: errors.array().map((err) => err.msg).join(', '),
      });
    }

    const { health_authorities } = req.body;

    try {
      const createdAuthorities = [];

      for (const authorityData of health_authorities) {
        const { name, shortName, contact_email, status, country, state, city, diagnosisList, drugList, clinicianList } = authorityData;

        if (!name || !status) {
          return res.status(400).json({ error: 'Name and Status are required for each health authority' });
        }

        const existingAuthorityByName = await HealthAuthority.findOne({ where: { name } });
        if (existingAuthorityByName) {
          return res.status(409).json({
            error: `A health authority with the name "${name}" already exists`,
          });
        }

        if (contact_email) {
          const existingAuthorityByEmail = await HealthAuthority.findOne({ where: { contact_email } });
          if (existingAuthorityByEmail) {
            return res.status(409).json({
              error: `A health authority with the contact email "${contact_email}" already exists`,
            });
          }
        }

        if (shortName) {
          const existingAuthorityByShortName = await HealthAuthority.findOne({ where: { shortName } });
          if (existingAuthorityByShortName) {
            return res.status(409).json({
              error: `A health authority with the short name "${shortName}" already exists`,
            });
          }
        }

        const authority = await HealthAuthority.create({
          name,
          shortName,
          contact_email,
          status: status.toUpperCase(),
          country,
          state,
          city,
          diagnosisList,
          drugList,
          clinicianList,
        });
        createdAuthorities.push(authority);
      }

      res.status(201).json({
        message: 'Health authorities created successfully',
        data: createdAuthorities,
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to create health authorities',
        details: error.message,
      });
    }
  });

  app.put('/api/health-authorities/:id', validateHealthAuthority, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: errors.array().map((err) => err.msg).join(', '),
      });
    }

    try {
      const authority = await HealthAuthority.findByPk(req.params.id);
      if (!authority) {
        return res.status(404).json({ error: 'Health authority not found' });
      }

      const { name, shortName, contact_email, status, country, state, city, diagnosisList, drugList, clinicianList } = req.body;

      if (name && name !== authority.name) {
        const existingAuthorityByName = await HealthAuthority.findOne({ where: { name } });
        if (existingAuthorityByName) {
          return res.status(409).json({
            error: `A health authority with the name "${name}" already exists`,
          });
        }
      }

      if (contact_email && contact_email !== authority.contact_email) {
        const existingAuthorityByEmail = await HealthAuthority.findOne({ where: { contact_email } });
        if (existingAuthorityByEmail) {
          return res.status(409).json({
            error: `A health authority with the contact email "${contact_email}" already exists`,
          });
        }
      }

      if (shortName && shortName !== authority.shortName) {
        const existingAuthorityByShortName = await HealthAuthority.findOne({ where: { shortName } });
        if (existingAuthorityByShortName) {
          return res.status(409).json({
            error: `A health authority with the short name "${shortName}" already exists`,
          });
        }
      }

      await authority.update({
        name: name || authority.name,
        shortName: shortName || authority.shortName,
        contact_email: contact_email !== undefined ? contact_email : authority.contact_email,
        status: status ? status.toUpperCase() : authority.status,
        country: country || authority.country,
        state: state || authority.state,
        city: city || authority.city,
        diagnosisList: diagnosisList !== undefined ? diagnosisList : authority.diagnosisList,
        drugList: drugList !== undefined ? drugList : authority.drugList,
        clinicianList: clinicianList !== undefined ? clinicianList : authority.clinicianList,
      });

      res.status(200).json({
        message: 'Health authority updated successfully',
        data: authority,
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to update health authority',
        details: error.message,
      });
    }
  });

  app.put('/api/health-authorities/:id/settings', validateSettings, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: errors.array().map((err) => err.msg).join(', '),
      });
    }

    try {
      const authority = await HealthAuthority.findByPk(req.params.id);
      if (!authority) {
        return res.status(404).json({ error: 'Health authority not found' });
      }

      const { diagnosis_list_id, drug_list_id, clinician_list_id } = req.body;

      await authority.update({
        diagnosisList: diagnosis_list_id !== undefined ? diagnosis_list_id : authority.diagnosisList,
        drugList: drug_list_id !== undefined ? drug_list_id : authority.drugList,
        clinicianList: clinician_list_id !== undefined ? clinician_list_id : authority.clinicianList,
      });

      res.status(200).json({
        message: 'Health authority settings updated successfully',
        data: authority,
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to update health authority settings',
        details: error.message,
      });
    }
  });

  app.put('/api/health-authorities/:id/deactivate', async (req, res) => {
    try {
      const authority = await HealthAuthority.findByPk(req.params.id);
      if (!authority) {
        return res.status(404).json({ error: 'Health authority not found' });
      }

      await authority.update({ status: 'INACTIVE' });

      res.status(200).json({
        message: 'Health authority deactivated successfully',
        data: authority,
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to deactivate health authority',
        details: error.message,
      });
    }
  });
  app.put('/api/health-authorities/:id/activate', async (req, res) => {
    try {
      const authority = await HealthAuthority.findByPk(req.params.id);
      if (!authority) {
        return res.status(404).json({ error: 'Health authority not found' });
      }

      if (authority.status === 'ACTIVE') {
        return res.status(400).json({ error: 'Health authority is already active' });
      }

      await authority.update({ status: 'ACTIVE' });

      res.status(200).json({
        message: 'Health authority activated successfully',
        data: authority,
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to activate health authority',
        details: error.message,
      });
    }
  });
  app.delete('/api/health-authorities/:id', async (req, res) => {
    try {
      const authority = await HealthAuthority.findByPk(req.params.id);
      if (!authority) {
        return res.status(404).json({ error: 'Health authority not found' });
      }

      await authority.destroy();
      res.status(204).json({ message: 'Health authority deleted' });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to delete health authority',
        details: error.message,
      });
    }
  });

  app.get('/api/clinician-lists', async (req, res) => {
    try {
      const clinicianLists = await models.ClinicianList.findAll({
        attributes: ['id', 'name'],
      });
      res.status(200).json({ data: clinicianLists });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to fetch clinician lists',
        details: error.message,
      });
    }
  });
};