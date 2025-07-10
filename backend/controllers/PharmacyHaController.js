
const PharmacyHACredentials = require('../models/PharmacyHACredentials');

module.exports.controller = function (app) {

  app.post('/pharmacy-ha-credentials', async (req, res) => {
    try {
      const { pharmacy_id, ha_code, ha_username, ha_password, status } = req.body;
      if (!pharmacy_id || !ha_code || !ha_username || !ha_password) {
        return res.status(400).json({ error: 'All fields except status are required' });
      }

      const newRecord = await PharmacyHACredentials.create({
        pharmacy_id,
        ha_code,
        ha_username,
        ha_password,
        status
      });

      res.status(201).json({ message: 'Credential created successfully', data: newRecord });
    } catch (error) {
      console.log(error); 
      res.status(500).json({ error: 'Error creating credentials', details: error.message });
    }
  });


  app.get('/pharmacy-ha-credentials', async (req, res) => {
    try {
      const records = await PharmacyHACredentials.findAll();
      res.json({ data: records });
    } catch (error) {
      console.log(error); 
      res.status(500).json({ error: 'Failed to fetch credentials', details: error.message });
    }
  });

  app.put('/pharmacy-ha-credentials/:id', async (req, res) => {
    try {
      const { pharmacy_id, ha_code, ha_username, ha_password, status } = req.body;
      const credential = await PharmacyHACredentials.findByPk(req.params.id);

      if (!credential) {
        return res.status(404).json({ error: 'Credential not found' });
      }

      await credential.update({
        pharmacy_id,
        ha_code,
        ha_username,
        ha_password,
        status
      });

      res.json({ message: 'Credential updated successfully', data: credential });
    } catch (error) {
      console.log(error); 
      res.status(500).json({ error: 'Error updating credentials', details: error.message });
    }
  });
};
