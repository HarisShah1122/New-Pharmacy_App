const { body } = require('express-validator')
const { HealthAuthorityConfig } = require('../models');
const { validationResult } = require('express-validator');

const validationLogin = [
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];
const validationPharmacy = [
 
  body()  
    .isArray({ max: 200 })
    .withMessage('Request must be an array of up to 200 pharmacies'),

  body('*.email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email')
    .normalizeEmail(),
  body('*.password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('*.pharmacy_name')
    .notEmpty()
    .withMessage('Pharmacy name is required')
    .trim(),
  body('*.address')
    .notEmpty()
    .withMessage('Address is required')
    .trim(),
  body('*.contact_info')
    .notEmpty()
    .withMessage('Contact information is required')
    .trim(),
  body('*.healthAuthority')
    .notEmpty()
    .withMessage('Health authority is required')
    .trim(),
];
const validationClinician = [
  body("clinicians")
    .optional()
    .isArray()
    .withMessage("Clinicians must be an array")
    .bail()
    .custom((value, { req }) => {
      const clinicians = value || [req.body];
      if (clinicians.length === 0 || clinicians.length > 1000) {
        throw new Error("Request body must contain clinicians (max 1000)");
      }
      return true;
    }),

  body("clinicians.*.first_name", "First name is required")
    .notEmpty()
    .trim(),

  body("clinicians.*.last_name", "Last name is required")
    .notEmpty()
    .trim(),

  body("clinicians.*.email", "Email is required")
    .notEmpty()
    .isEmail()
    .withMessage("Invalid email")
    .normalizeEmail(),

  body("clinicians.*.license_number", "License number is required")
    .notEmpty()
    .trim(),

  body("clinicians.*.clinician_list_id", "Clinician list ID is required")
    .notEmpty()
    .trim(),

  body("clinicians.*.specialty")
    .optional()
    .isString()
    .trim(),

  body("clinicians.*.phone")
    .optional()
    .isString()
    .trim(),

  body("clinicians.*.status")
    .optional()
    .isIn(["active", "inactive"])
    .withMessage("Status must be either 'active' or 'inactive'"),

  body("first_name")
    .if(body("clinicians").not().exists())
    .notEmpty()
    .withMessage("First name is required")
    .trim(),

  body("last_name")
    .if(body("clinicians").not().exists())
    .notEmpty()
    .withMessage("Last name is required")
    .trim(),

  body("email")
    .if(body("clinicians").not().exists())
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email")
    .normalizeEmail(),

  body("license_number")
    .if(body("clinicians").not().exists())
    .notEmpty()
    .withMessage("License number is required")
    .trim(),

  body("clinician_list_id")
    .if(body("clinicians").not().exists())
    .notEmpty()
    .withMessage("Clinician list ID is required")
    .trim(),

  body("specialty")
    .if(body("clinicians").not().exists())
    .optional()
    .isString()
    .trim(),

  body("phone")
    .if(body("clinicians").not().exists())
    .optional()
    .isString()
    .trim(),

  body("status")
    .if(body("clinicians").not().exists())
    .optional()
    .isIn(["active", "inactive"])
    .withMessage("Status must be either 'active' or 'inactive'"),
];
const validationClinicianList = [
  body("name").isString().notEmpty().withMessage("Name is required"),
  body("code").optional().isString().withMessage("Code must be a string"),
  body("status").optional().isIn(['ACTIVE', 'INACTIVE']).withMessage("Status must be ACTIVE or INACTIVE"),
  body("clinician_list_id").optional().isString().withMessage("clinician_list_id must be a string")
];
    const validateHealthAuthority = [
      body('name')
        .notEmpty()
        .withMessage('Name is required')
        .isString()
        .withMessage('Name must be a string'),
      body('shortName')
        .optional()
        .isString()
        .withMessage('Short name must be a string'),
      body('contact_email')
        .optional()
        .isEmail()
        .withMessage('Contact email must be a valid email address'),
      body('status')
        .notEmpty()
        .withMessage('Status is required')
        .isIn(['ACTIVE', 'INACTIVE'])
        .withMessage("Status must be either 'ACTIVE' or 'INACTIVE'"),
      body('country')
        .optional()
        .isString()
        .withMessage('Country must be a string'),
      body('state')
        .optional()
        .isString()
        .withMessage('State must be a string'),
      body('city')
        .optional()
        .isString()
        .withMessage('City must be a string'),
    ];
    
    const validateHealthAuthoritiesBulk = [
      body('health_authorities')
        .isArray()
        .withMessage('health_authorities must be an array')
        .notEmpty()
        .withMessage('health_authorities array cannot be empty'),
      body('health_authorities.*.name')
        .notEmpty()
        .withMessage('Name is required')
        .isString()
        .withMessage('Name must be a string'),
      body('health_authorities.*.shortName')
        .optional()
        .isString()
        .withMessage('Short name must be a string'),
      body('health_authorities.*.contact_email')
        .optional()
        .isEmail()
        .withMessage('Contact email must be a valid email address'),
      body('health_authorities.*.status')
        .notEmpty()
        .withMessage('Status is required')
        .isIn(['ACTIVE', 'INACTIVE'])
        .withMessage("Status must be either 'ACTIVE' or 'INACTIVE'"),
      body('health_authorities.*.country')
        .optional()
        .isString()
        .withMessage('Country must be a string'),
      body('health_authorities.*.state')
        .optional()
        .isString()
        .withMessage('State must be a string'),
      body('health_authorities.*.city')
        .optional()
        .isString()
        .withMessage('City must be a string'),
    ];

    const validateSettings = [
      body('diagnosisList')
        .optional()
        .isString()
        .trim()
        .notEmpty()
        .withMessage('Diagnosis list must be a non-empty string')
        .custom(async (value) => {
          if (value) {
            const diagnosisList = await DiagnosisList.findOne({
              where: { diagnosis_list_id: { [Op.eq]: value } },
            });
            if (!diagnosisList) {
              throw new Error(`Diagnosis list with ID '${value}' does not exist`);
            }
          }
          return true;
        }),
        body('drugList')
        .optional()
        .isString()
        .trim()
        .notEmpty()
        .withMessage('Drug list must be a non-empty string')
        .custom(async (value) => {
          if (value) {
            const drugList = await DrugList.findOne({
              where: { drug_list_id: { [Op.eq]: value } },
            });
            if (!drugList) {
              throw new Error(`Drug list with ID '${value}' does not exist`);
            }
          }
          return true;
        }),
      body('clinicianList')
        .optional()
        .isString()
        .trim()
        .notEmpty()
        .withMessage('Clinician list must be a non-empty string')
        .custom(async (value) => {
          if (value) {
            const clinicianList = await ClinicianList.findOne({
             where: { clinician_list_id: { [Op.eq]: value } },
            });
            if (!clinicianList) {
              throw new Error(`Clinician list with ID '${value}' does not exist`);
            }
          }
          return true;
        }),
    ];
const validateRequestBody = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: errors.array().map(err => err.msg).join(", ")
    });
  }
  next();
};
const validationPrescription = [
  body('erx_no').notEmpty().withMessage('eRx number is required').isString().trim(),
  body('erx_date').notEmpty().withMessage('eRx date is required').isISO8601().withMessage('Invalid date format'),
  body('prescriber_id').notEmpty().withMessage('Prescriber ID is required').isString().trim(),
  body('member_id').notEmpty().withMessage('Member ID is required').isString().trim(),
  body('payer_tpa').notEmpty().withMessage('Payer TPA is required').isString().trim(),
  body('emirates_id').notEmpty().withMessage('Emirates ID is required').isString().trim(),
  body('reason_of_unavailability').notEmpty().withMessage('Reason of unavailability is required').isString().trim(),
  body('name').notEmpty().withMessage('Patient name is required').isString().trim(),
  body('gender').notEmpty().withMessage('Gender is required').isString().trim(),
  body('date_of_birth').notEmpty().withMessage('Date of birth is required').isISO8601().withMessage('Invalid date format'),
  body('weight').notEmpty().withMessage('Weight is required').isNumeric().withMessage('Weight must be a number'),
  body('mobile').notEmpty().withMessage('Mobile number is required').isString().trim(),
  body('email').notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email format'),
  body('fill_date').notEmpty().withMessage('Fill date is required').isISO8601().withMessage('Invalid date format'),
  body('physician').notEmpty().withMessage('Physician is required').isString().trim(),
  body('prescription_date').notEmpty().withMessage('Prescription date is required').isISO8601().withMessage('Invalid date format'),
  body('drugs').isArray({ min: 1 }).withMessage('At least one drug is required'),
  body('drugs.*.drug_code').notEmpty().withMessage('Drug code is required').isString().trim(),
  body('drugs.*.quantity').notEmpty().withMessage('Quantity is required').isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
  body('drugs.*.days_of_supply').notEmpty().withMessage('Days of supply is required').isInt({ min: 1 }).withMessage('Days of supply must be a positive integer'),
  body('drugs.*.instructions').notEmpty().withMessage('Instructions are required').isString().trim(),
  body('diagnoses').isArray({ min: 1 }).withMessage('At least one diagnosis is required'),
  body('diagnoses.*.icd_code').notEmpty().withMessage('ICD code is required').isString().trim(),
  body('diagnoses.*.diagnosis_code').notEmpty().withMessage('Diagnosis code is required').isString().trim(),
  body('diagnoses.*.description').notEmpty().withMessage('Description is required').isString().trim(),
  body('diagnoses.*.quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
  body('diagnoses.*.days_of_supply').optional().isInt({ min: 1 }).withMessage('Days of supply must be a positive integer'),
];

const validationDrug = [
  body('prescription_id').notEmpty().withMessage('Prescription ID is required').isUUID().withMessage('Invalid UUID format'),
  body('drug_code').notEmpty().withMessage('Drug code is required').isString().trim(),
  body('quantity').notEmpty().withMessage('Quantity is required').isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
  body('days_of_supply').notEmpty().withMessage('Days of supply is required').isInt({ min: 1 }).withMessage('Days of supply must be a positive integer'),
  body('instructions').optional().isString().trim(),
];

const validationDiagnosis = [
  body('prescription_id').notEmpty().withMessage('Prescription ID is required').isUUID().withMessage('Invalid UUID format'),
  body('icd_code').notEmpty().withMessage('ICD code is required').isString().trim(),
  body('is_primary').optional().isBoolean().withMessage('is_primary must be a boolean'),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Validation failed', details: errors.array() });
  }
  next();
};
const registerPayerValidation = [
  body('email').isEmail().withMessage('Invalid email format'),
  body('payer_name').notEmpty().withMessage('Payer name is required'),
  body('address').notEmpty().withMessage('Address is required'),
  body('contact_info').notEmpty().withMessage('Contact info is required'),
  body('status').notEmpty().withMessage('Status is required'),
];

const updatePayerValidation = [
  body('email').optional().isEmail().withMessage('Invalid email format'),
  body('payer_name').optional().notEmpty().withMessage('Payer name is required'),
  body('address').optional().notEmpty().withMessage('Address is required'),
  body('contact_info').optional().notEmpty().withMessage('Contact info is required'),
  body('status').optional().notEmpty().withMessage('Status is required'),
];
const registerPayerHAValidation = [
  body('payer_id')
    .trim()
    .notEmpty()
    .withMessage('Payer ID is required')
    .isUUID()
    .withMessage('Payer ID must be a valid UUID'),
  body('user_name')
    .trim()
    .notEmpty()
    .withMessage('User Name is required')
    .isLength({ min: 3, max: 50 })
    .withMessage('User Name must be between 3 and 50 characters'),
  body('code')
    .trim()
    .notEmpty()
    .withMessage('Code is required')
    .isLength({ min: 3, max: 20 })
    .withMessage('Code must be between 3 and 20 characters'),
  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6, max: 100 })
    .withMessage('Password must be between 6 and 100 characters'),
  body('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Status must be either active or inactive'),
];


const updatePayerHAValidation = [
  body('user_name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('User Name cannot be empty')
    .isLength({ min: 3, max: 50 })
    .withMessage('User Name must be between 3 and 50 characters'),
  body('code')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Code cannot be empty')
    .isLength({ min: 3, max: 20 })
    .withMessage('Code must be between 3 and 20 characters'),
  body('password')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Password cannot be empty')
    .isLength({ min: 6, max: 100 })
    .withMessage('Password must be between 6 and 100 characters'),
  body('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Status must be either active or inactive'),
];
const validationUser = [
  body('healthAuthority')
    .notEmpty()
    .withMessage('Health Authority is required')
    .isIn(['NHS', 'HHS', 'PHAC', 'WHO'])
    .withMessage('Invalid Health Authority'),
  body('firstname').notEmpty().withMessage('First name is required').trim(),
  body('lastname').notEmpty().withMessage('Last name is required').trim(),
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
];
// const validationDrug = [
//   body("drugs")
//     .isArray({ min: 1, max: 1000 })
//     .withMessage("Request body must be a non-empty array of drugs with a maximum of 1000 entries")
//     .custom((drugs) => {
//       const ndcDrugCodes = drugs.map((d) => d.ndc_drug_code);
//       const codeDuplicates = ndcDrugCodes.filter((code, index) => ndcDrugCodes.indexOf(code) !== index);
//       if (codeDuplicates.length > 0) {
//         throw new Error(`Duplicate NDC drug code(s) found: ${[...new Set(codeDuplicates)].join(", ")}`);
//       }
//       const ids = drugs.map((d) => d.id);
//       const idDuplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
//       if (idDuplicates.length > 0) {
//         throw new Error(`Duplicate ID(s) found: ${[...new Set(idDuplicates)].join(", ")}`);
//       }
//       return true;
//     }),

//   body("drugs.*.id")
//     .notEmpty()
//     .withMessage("ID is required for each drug")
//     .isUUID()
//     .withMessage("ID must be a valid UUID"),

//   body("drugs.*.ndc_drug_code")
//     .notEmpty()
//     .withMessage("NDC drug code is required for each drug")
//     .isString()
//     .withMessage("NDC drug code must be a string"),

//   body("drugs.*.ha_code")
//     .optional()
//     .isString()
//     .withMessage("HA code must be a string if provided"),

//   body("drugs.*.trade_name")
//     .optional()
//     .isString()
//     .withMessage("Trade name must be a string if provided"),

//   body("drugs.*.status")
//     .optional()
//     .isString()
//     .withMessage("Status must be a string if provided")
//     .isIn(['active', 'inactive'])
//     .withMessage("Status must be either 'active' or 'inactive'"),

//   body("drugs.*.manufacturer")
//     .optional()
//     .isString()
//     .withMessage("Manufacturer must be a string if provided"),

//   body("drugs.*.local_agent")
//     .optional()
//     .isString()
//     .withMessage("Local agent must be a string if provided"),

//   body("drugs.*.dosage_form")
//     .optional()
//     .isString()
//     .withMessage("Dosage form must be a string if provided"),

//   body("drugs.*.package_type")
//     .optional()
//     .isString()
//     .withMessage("Package type must be a string if provided"),

//   body("drugs.*.package_size")
//     .optional()
//     .isString()
//     .withMessage("Package size must be a string if provided"),

//   body("drugs.*.granular_unit")
//     .optional()
//     .isInt({ min: 0 })
//     .withMessage("Granular unit must be a non-negative integer if provided"),

//   body("drugs.*.unit_type")
//     .optional()
//     .isString()
//     .withMessage("Unit type must be a string if provided"),

//   body("drugs.*.active_ingredients")
//     .optional()
//     .isString()
//     .withMessage("Active ingredients must be a string if provided"),

//   body("drugs.*.strengths")
//     .optional()
//     .isString()
//     .withMessage("Strengths must be a string if provided"),

//   body("drugs.*.start_date")
//     .optional()
//     .isISO8601()
//     .withMessage("Start date must be a valid ISO 8601 date if provided"),

//   body("drugs.*.end_date")
//     .optional()
//     .isISO8601()
//     .withMessage("End date must be a valid ISO 8601 date if provided"),

//   body("drugs.*.dispensed_quantity")
//     .optional()
//     .isInt({ min: 1 })
//     .withMessage("Dispensed Quantity must be a positive integer if provided"),

//   body("drugs.*.days_of_supply")
//     .optional()
//     .isInt({ min: 1 })
//     .withMessage("Days of Supply must be a positive integer if provided"),

//   body("drugs.*.instructions")
//     .optional()
//     .isString()
//     .withMessage("Instructions must be a string if provided"),

//   body("drugs.*.drug_list_id")
//     .notEmpty()
//     .withMessage("Drug list ID is required for each drug")
//     .isUUID()
//     .withMessage("Drug list ID must be a valid UUID"),
// ];
const validationDrugList = [
  body("drug_list_id")
    .optional()
    .isUUID()
    .withMessage("Drug list ID must be a valid UUID if provided"),
  body("name")
    .isString()
    .notEmpty()
    .trim()
    .withMessage("Name is required and must be a non-empty string"),
  body("code")
    .isString()
    .notEmpty()
    .trim()
    .withMessage("Code is required and must be a non-empty string"),
  body("status")
    .optional()
    .isString()
    .isIn(['active', 'inactive'])
    .withMessage("Status must be either 'active' or 'inactive' if provided"),
];
const validationDiagnosisList = [
  body('name').notEmpty().withMessage('Name is required'),
  body('code').notEmpty().withMessage('Code is required'),
 
];

const validationDiagnosisCreate = [
  body('diagnoses')
    .isArray({ min: 1, max: 1000 })
    .withMessage('At least one diagnosis is required (max 1000)')
    .notEmpty()
    .withMessage('Diagnoses array should not be empty'),
  body('diagnoses.*.description')
    .notEmpty()
    .withMessage('Description is required')
    .isString()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Description must be between 1 and 255 characters'),
  body('diagnoses.*.icd_code')
    .notEmpty()
    .withMessage('ICD code is required')
    .isString()
    .trim()
    .isLength({ min: 1, max: 10 })
    .withMessage('ICD code must be between 1 and 10 characters'),
  body('diagnoses.*.diagnosis_code')
    .notEmpty()
    .withMessage('Diagnosis code is required')
    .isString()
    .trim()
    .isLength({ min: 1, max: 10 })
    .withMessage('Diagnosis code must be between 1 and 10 characters'),
  body('diagnoses.*.status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Status must be "active" or "inactive"'),
];

const validationDiagnosisUpdate = [
  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .isString()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Description must be between 1 and 255 characters'),
  body('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Status must be "active" or "inactive"'),
  body('diagnosis_list_id')
    .optional()
    .isUUID()
    .withMessage('Diagnosis list ID must be a valid UUID (e.g., 550e8400-e29b-41d4-a716-446655440000)'),
];
module.exports.validateListIds = [
  body('drug_list_id')
    .notEmpty()
    .withMessage('Drug list ID is required')
    .isUUID()
    .withMessage('Drug list ID should be a valid UUID'),

  body('diagnosis_list_id')
    .notEmpty()
    .withMessage('Diagnose list ID is required')
    .isUUID()
    .withMessage('Diagnose list ID should be a valid UUID'),

  body('clinician_list_id')
    .notEmpty()
    .withMessage('Clinician list ID is required')
    .isUUID()
    .withMessage('Clinician list ID should be a valid UUID'),
];
const validateHealthAuthorityConfig = [
  body('drug_list_id')
    .notEmpty().withMessage('Drug list ID is required'),

  body('diagnosis_list_id')
    .notEmpty().withMessage('Diagnosis list ID is required'),

  // body('clinician_list_id')
  //   .notEmpty().withMessage('Clinician list ID is required'),
  body().custom(async (value) => {
    const { drug_list_id, diagnosis_list_id, clinician_list_id } = value;

    const existing = await HealthAuthorityConfig.findOne({
      where: {
        drug_list_id,
        diagnosis_list_id,
        clinician_list_id,
      }
    });

    if (existing) {
      throw new Error('Configuration with the same drug, diagnosis, and clinician already exists');
    }

    return true;
  }),
];

  module.exports = {
    validationLogin,
    validationPharmacy,
    validationClinician,
    validationClinicianList,
    validationDiagnosisList,
    validationDiagnosis,
    validateHealthAuthorityConfig,
    validationPrescription,
    validate,
    validationUser,
    validationDrug,
    validationDrugList,
    validateHealthAuthority,
    validateSettings,
    validateHealthAuthoritiesBulk,
    validateRequestBody,
    registerPayerValidation, 
    updatePayerValidation,
    registerPayerHAValidation,
    updatePayerHAValidation,
    validationDiagnosisCreate,
    validationDiagnosisUpdate
  }
