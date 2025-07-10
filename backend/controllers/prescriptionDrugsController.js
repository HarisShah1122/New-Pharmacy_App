const PrescriptionDrug = require('../models/PrescriptionDrug');
const Prescription = require('../models/Prescription');

module.exports.controller = function (app) {
  app.get('/drugs', async (req, res) => {
    try {
      const drugs = await PrescriptionDrug.findAll();
      res.json({ data: drugs });
    } catch (error) {
      console.log(error); 
      res.status(500).json({ error: 'Failed to fetch drugs', details: error.message });
    }
  });

  app.get('/drugs/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const drug = await PrescriptionDrug.findByPk(id);
      if (!drug) return res.status(404).json({ error: 'Drug not found' });
      res.json({ data: drug });
    } catch (error) {
      console.log(error); 
      res.status(500).json({ error: 'Failed to fetch drug', details: error.message });
    }
  });

  app.post('/drugs', async (req, res) => {
    try {
      const drugs = req.body;
      if (!Array.isArray(drugs) || drugs.length === 0) {
        return res.status(400).json({ error: 'Request body must be a non-empty array of drugs' });
      }

      for (const drug of drugs) {
        const { prescription_id, ndc_drug_code, dispensed_quantity, days_of_supply, instructions } = drug;
        if (!prescription_id || !ndc_drug_code || !dispensed_quantity || !days_of_supply) {
          return res.status(400).json({ error: 'Required fields missing in one or more drugs' });
        }

        const prescription = await Prescription.findByPk(prescription_id);
        if (!prescription) {
          return res.status(404).json({ error: `Prescription with ID ${prescription_id} not found` });
        }
      }

      const newDrugs = await PrescriptionDrug.bulkCreate(drugs);
      res.status(201).json({ message: 'Drugs added successfully', data: newDrugs });
    } catch (error) {
      console.log(error); 
      res.status(500).json({ error: 'Failed to add drugs', details: error.message });
    }
  });

  app.put('/drugs/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { prescription_id, ndc_drug_code, dispensed_quantity, days_of_supply, instructions } = req.body;
      const drug = await PrescriptionDrug.findByPk(id);
      if (!drug) return res.status(404).json({ error: 'Drug not found' });

      await drug.update({ prescription_id, ndc_drug_code, dispensed_quantity, days_of_supply, instructions });
      res.json({ message: 'Drug updated successfully', data: drug });
    } catch (error) {
      console.log(error); 
      res.status(500).json({ error: 'Failed to update drug', details: error.message });
    }
  });

  app.delete('/drugs/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const drug = await PrescriptionDrug.findByPk(id);
      if (!drug) return res.status(404).json({ error: 'Drug not found' });

      await drug.destroy();
      res.json({ message: 'Drug deleted successfully' });
    } catch (error) {
      console.log(error); 
      res.status(500).json({ error: 'Failed to delete drug', details: error.message });
    }
  });
};
