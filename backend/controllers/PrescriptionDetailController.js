const jwt = require('jsonwebtoken');
const { PrescriptionDetail, PrescriptionDrug, PrescriptionDiagnosis } = require('../models');
const { validationDrug, validationDiagnosis, validate } = require('../helpers/validation');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied, no token provided' });
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET || 'your_secure_secret_key');
    req.user = verified;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid token' });
  }
};

module.exports.controller = (app) => {
  console.log("PrescriptionDetailController loaded");

  app.post('/prescription-detail/add', authenticateToken, async (req, res) => {
    try {
      const { drugs, diagnoses, ...prescriptionData } = req.body;

      const prescription = await PrescriptionDetail.create(prescriptionData, { validate: true });
      const prescriptionId = prescription.id;

      if (drugs && Array.isArray(drugs) && drugs.length > 0) {
        for (const drug of drugs) {
          const drugData = {
            prescription_id: prescriptionId,
            ndc_drug_code: drug.drug_code,
            dispensed_quantity: drug.quantity,
            days_of_supply: drug.days_of_supply,
            instructions: drug.instructions || null,
          };
          await PrescriptionDrug.create(drugData, { validate: true });
        }
      }

      if (diagnoses && Array.isArray(diagnoses) && diagnoses.length > 0) {
        for (const diagnosis of diagnoses) {
          const diagnosisData = {
            prescription_id: prescriptionId,
            icd_code: diagnosis.icd_code,
            diagnosis_code: diagnosis.diagnosis_code,
            description: diagnosis.description,
          };
          await PrescriptionDiagnosis.create(diagnosisData, { validate: true });
        }
      }

      const fullPrescription = await PrescriptionDetail.findByPk(prescriptionId, {
        include: [
          { model: PrescriptionDrug, as: 'drugs' },
          { model: PrescriptionDiagnosis, as: 'diagnoses' },
        ],
      });

      res.status(201).json({ data: fullPrescription });
    } catch (error) {
      console.log(error);
      res.status(400).json({ error: 'Failed to create prescription detail', details: error.message });
    }
  });

  app.post('/prescriptions/fetch', authenticateToken, async (req, res) => {
    try {
      const { id } = req.body;
      if (!id) return res.status(400).json({ error: 'Prescription ID is required' });
      const prescription = await PrescriptionDetail.findByPk(id, {
        include: [
          { model: PrescriptionDrug, as: 'drugs' },
          { model: PrescriptionDiagnosis, as: 'diagnoses' },
        ],
      });
      if (!prescription) return res.status(404).json({ error: 'Prescription not found' });
      res.json({ data: prescription });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Failed to fetch prescription', details: error.message });
    }
  });

  app.post('/prescription-detail/update', authenticateToken, async (req, res) => {
    try {
      const { id, ...updateData } = req.body;
      if (!id) return res.status(400).json({ error: 'Prescription ID is required' });
      const prescription = await PrescriptionDetail.findByPk(id);
      if (!prescription) return res.status(404).json({ error: 'Prescription not found' });
      await prescription.update(updateData, { validate: true });
      res.json({ data: prescription });
    } catch (error) {
      console.log(error);
      res.status(400).json({ error: 'Failed to update prescription', details: error.message });
    }
  });

  app.post('/prescription-detail/delete', authenticateToken, async (req, res) => {
    try {
      const { id } = req.body;
      if (!id) return res.status(400).json({ error: 'Prescription ID is required' });
      const prescription = await PrescriptionDetail.findByPk(id);
      if (!prescription) return res.status(404).json({ error: 'Prescription not found' });
      await prescription.destroy();
      res.json({ message: 'Prescription deleted successfully' });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Failed to delete prescription', details: error.message });
    }
  });

  app.post('/prescription-drugs/add', authenticateToken, validationDrug, validate, async (req, res) => {
    try {
      const drugData = {
        prescription_id: req.body.prescription_id,
        ndc_drug_code: req.body.drug_code,
        dispensed_quantity: req.body.quantity,
        days_of_supply: req.body.days_of_supply,
        instructions: req.body.instructions || null,
      };
      const drug = await PrescriptionDrug.create(drugData, { validate: true });
      res.status(201).json({ data: drug });
    } catch (error) {
      console.log(error);
      res.status(400).json({ error: 'Failed to create prescription drug', details: error.message });
    }
  });

  app.post('/prescription-drugs/delete', authenticateToken, async (req, res) => {
    try {
      const { id } = req.body;
      if (!id) return res.status(400).json({ error: 'Drug ID is required' });
      const drug = await PrescriptionDrug.findByPk(id);
      if (!drug) return res.status(404).json({ error: 'Drug not found' });
      await drug.destroy();
      res.json({ message: 'Drug deleted successfully' });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Failed to delete drug', details: error.message });
    }
  });

  app.post('/prescription-diagnosis/add', authenticateToken, validationDiagnosis, validate, async (req, res) => {
    try {
      const diagnosis = await PrescriptionDiagnosis.create(req.body, { validate: true });
      res.status(201).json({ data: diagnosis });
    } catch (error) {
      console.log(error);
      res.status(400).json({ error: 'Failed to create prescription diagnosis', details: error.message });
    }
  });

  app.post('/prescription-diagnosis/delete', authenticateToken, async (req, res) => {
    try {
      const { id } = req.body;
      if (!id) return res.status(400).json({ error: 'Diagnosis ID is required' });
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