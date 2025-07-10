const PrescriptionDiagnosis = require('../models/PrescriptionDiagnosis');
const Prescription = require('../models/Prescription');

module.exports.controller = function (app) {

  app.get('/diagnoses', async (req, res) => {
    try {
      const diagnoses = await PrescriptionDiagnosis.findAll();
      res.json({ data: diagnoses });
    } catch (error) {
      console.log(error); 
      res.status(500).json({ error: 'Failed to fetch diagnoses', details: error.message });
    }
  });


  app.get('/diagnoses/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const diagnosis = await PrescriptionDiagnosis.findByPk(id);
      if (!diagnosis) return res.status(404).json({ error: 'Diagnosis not found' });
      res.json({ data: diagnosis });
    } catch (error) {
      console.log(error); 
      res.status(500).json({ error: 'Failed to fetch diagnosis', details: error.message });
    }
  });

  app.post('/diagnoses', async (req, res) => {
    try {
      const diagnoses = req.body;
      if (!Array.isArray(diagnoses) || diagnoses.length === 0) {
        return res.status(400).json({ error: 'Request body must be a non-empty array of diagnoses' });
      }

      for (const diagnosis of diagnoses) {
        const { prescription_id, icd_code, diagnosis_code, description, is_primary } = diagnosis;
        if (!prescription_id || !icd_code || !diagnosis_code || !description) {
          return res.status(400).json({ error: 'Missing required fields in diagnosis data' });
        }
        const prescription = await Prescription.findByPk(prescription_id);
        if (!prescription) {
          return res.status(404).json({ error: `Prescription ID ${prescription_id} not found` });
        }
      }

      const newDiagnoses = await PrescriptionDiagnosis.bulkCreate(diagnoses);
      res.status(201).json({ message: 'Diagnoses added successfully', data: newDiagnoses });
    } catch (error) {
      console.log(error); 
      res.status(500).json({ error: 'Failed to add diagnoses', details: error.message });
    }
  });

  app.put('/diagnoses/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { prescription_id, icd_code, diagnosis_code, description, is_primary } = req.body;

      const diagnosis = await PrescriptionDiagnosis.findByPk(id);
      if (!diagnosis) return res.status(404).json({ error: 'Diagnosis not found' });

      await diagnosis.update({ prescription_id, icd_code, diagnosis_code, description, is_primary });
      res.json({ message: 'Diagnosis updated successfully', data: diagnosis });
    } catch (error) {
      console.log(error); 
      res.status(500).json({ error: 'Failed to update diagnosis', details: error.message });
    }
  });


  app.delete('/diagnoses/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const diagnosis = await PrescriptionDiagnosis.findByPk(id);
      if (!diagnosis) return res.status(404).json({ error: 'Diagnosis not found' });

      await diagnosis.destroy();
      res.json({ message: 'Diagnosis deleted successfully' });
    } catch (error) {
      console.log(error); 
      res.status(500).json({ error: 'Failed to delete diagnosis', details: error.message });
    }
  });
};
