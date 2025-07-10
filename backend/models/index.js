const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Users = require('./Users');
const Clinician = require('./clinicians');
const ClinicianListFactory = require('./clinicianList');
const Prescription = require('./Prescription');
const PrescriptionDrugFactory = require('./PrescriptionDrug');
const PrescriptionDiagnosisFactory = require('./PrescriptionDiagnosis');
const DrugListFactory = require('./DrugList');
const DiagnosisListFactory = require('./DiagnosisList');
const HealthAuthorityConfig = require('./HealthAuthorityConfig')(sequelize);
const HealthAuthority = require('./HealthAuthority');
const PrescriptionDetailFactory = require('./PrescriptionDetail');

try {
  const DiagnosisList = DiagnosisListFactory(sequelize, DataTypes);
  const ClinicianList = ClinicianListFactory(sequelize, DataTypes);
  const DrugList = DrugListFactory(sequelize, DataTypes);
  const PrescriptionDrug = PrescriptionDrugFactory(sequelize, DataTypes);
  const PrescriptionDiagnosis = PrescriptionDiagnosisFactory(sequelize, DataTypes);
  const PrescriptionDetail = PrescriptionDetailFactory(sequelize);

  // Define associations
  Clinician.belongsTo(ClinicianList, { foreignKey: 'clinician_list_id' });
  ClinicianList.hasMany(Clinician, { foreignKey: 'clinician_list_id' });

  PrescriptionDetail.hasMany(PrescriptionDiagnosis, { as: 'diagnoses', foreignKey: 'prescription_id', onDelete: 'CASCADE' });
  PrescriptionDiagnosis.belongsTo(PrescriptionDetail, { foreignKey: 'prescription_id' });

  PrescriptionDetail.hasMany(PrescriptionDrug, { as: 'drugs', foreignKey: 'prescription_id', onDelete: 'CASCADE' });
  PrescriptionDrug.belongsTo(PrescriptionDetail, { foreignKey: 'prescription_id' });

  const models = {
    Users,
    Clinician,
    ClinicianList,
    Prescription,
    PrescriptionDetail,
    PrescriptionDrug,
    DrugList,
    PrescriptionDiagnosis,
    DiagnosisList,
    HealthAuthority,
    HealthAuthorityConfig,
    sequelize,
  };

  sequelize.sync({ force: false }).then(() => {
    console.log('Models synced with database');
  }).catch(err => {
    console.error('Error syncing database:', err);
  });

  module.exports = models;
} catch (err) {
  console.error('Error initializing models:', err);
  throw err;
}