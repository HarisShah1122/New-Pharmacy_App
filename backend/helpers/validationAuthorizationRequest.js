const { body } = require("express-validator");

const validationAuthorizationRequest = [
  body("type")
    .notEmpty()
    .withMessage("Type is required")
    .isString()
    .withMessage("Type must be a string")
    .equals("Authorization")
    .withMessage("Type must be 'Authorization'"),
  body("source")
    .notEmpty()
    .withMessage("Source is required")
    .isString()
    .withMessage("Source must be a string")
    .matches(/^test-pharmacy\d+$/)
    .withMessage("Source must be in the format 'test-pharmacy' followed by digits"),
  body("dispositionFlag")
    .notEmpty()
    .withMessage("Disposition flag is required")
    .isString()
    .withMessage("Disposition flag must be a string")
    .equals("TEST")
    .withMessage("Disposition flag must be 'TEST'"),
  body("senderId")
    .notEmpty()
    .withMessage("Sender ID is required")
    .isString()
    .withMessage("Sender ID must be a string")
    .matches(/^DHA-F-\d+$/)
    .withMessage("Sender ID must be in the format 'DHA-F-' followed by digits"),
  body("receiverId")
    .notEmpty()
    .withMessage("Receiver ID is required")
    .isString()
    .withMessage("Receiver ID must be a string")
    .matches(/^INS\d+$/)
    .withMessage("Receiver ID must be in the format 'INS' followed by digits"),
  body("payerId")
    .notEmpty()
    .withMessage("Payer ID is required")
    .isString()
    .withMessage("Payer ID must be a string")
    .matches(/^INS\d+$/)
    .withMessage("Payer ID must be in the format 'INS' followed by digits"),
  body("memberId")
    .notEmpty()
    .withMessage("Member ID is required")
    .isString()
    .withMessage("Member ID must be a string")
    .matches(/^TEST-PAYER-\d+$/)
    .withMessage("Member ID must be in the format 'TEST-PAYER-' followed by digits"),
  body("eRxDate")
    .notEmpty()
    .withMessage("eRx date is required")
    .isString()
    .withMessage("eRx date must be a string")
    .matches(/^\d{2}\/\d{2}\/\d{4}$/)
    .withMessage("eRx date must be in the format 'MM/DD/YYYY'"),
  body("prescriberId")
    .notEmpty()
    .withMessage("Prescriber ID is required")
    .isString()
    .withMessage("Prescriber ID must be a string")
    .matches(/^QTR-\d+$/)
    .withMessage("Prescriber ID must be in the format 'QTR-' followed by digits"),
  body("diagnoses")
    .isArray({ min: 1 })
    .withMessage("Diagnoses must be a non-empty array"),
  body("diagnoses.*.Type")
    .notEmpty()
    .withMessage("Diagnosis type is required")
    .isString()
    .withMessage("Diagnosis type must be a string")
    .isIn(["Principal", "Secondary"])
    .withMessage("Diagnosis type must be 'Principal' or 'Secondary'"),
  body("diagnoses.*.Code")
    .notEmpty()
    .withMessage("Diagnosis code is required")
    .isString()
    .withMessage("Diagnosis code must be a string")
    .matches(/^[A-Z]\d{2}(\.\d)?$/)
    .withMessage("Diagnosis code must be in the format 'XNN' or 'XNN.N' (e.g., 'D28.2')"),
  body("drugList")
    .isArray({ min: 1 })
    .withMessage("Drug list must be a non-empty array"),
  body("drugList.*.drugReferenceId")
    .notEmpty()
    .withMessage("Drug reference ID is required")
    .isString()
    .withMessage("Drug reference ID must be a string")
    .matches(/^\d+$/)
    .withMessage("Drug reference ID must be numeric"),
  body("drugList.*.drugCode")
    .notEmpty()
    .withMessage("Drug code is required")
    .isString()
    .withMessage("Drug code must be a string")
    .matches(/^\d{2}-\d{4}$/)
    .withMessage("Drug code must be in the format 'NN-NNNN'"),
  body("drugList.*.requestedQuantity")
    .notEmpty()
    .withMessage("Requested quantity is required")
    .isInt({ min: 1 })
    .withMessage("Requested quantity must be a positive integer"),
  body("drugList.*.requestdaysOfSupply")
    .notEmpty()
    .withMessage("Requested days of supply is required")
    .isInt({ min: 1 })
    .withMessage("Requested days of supply must be a positive integer"),
  body("drugList.*.requestedAmount")
    .notEmpty()
    .withMessage("Requested amount is required")
    .isInt({ min: 1 })
    .withMessage("Requested amount must be a positive integer"),
  body("attachmentList")
    .isArray({ min: 1 })
    .withMessage("Attachment list must be a non-empty array"),
  body("attachmentList.*.fileRefId")
    .notEmpty()
    .withMessage("File reference ID is required")
    .isString()
    .withMessage("File reference ID must be a string")
    .matches(/^\d+$/)
    .withMessage("File reference ID must be numeric"),
  body("attachmentList.*.fileDescription")
    .notEmpty()
    .withMessage("File description is required")
    .isString()
    .withMessage("File description must be a string"),
  body("attachmentList.*.fileRef")
    .notEmpty()
    .withMessage("File reference is required")
    .isString()
    .withMessage("File reference must be a string"),
];

module.exports = validationAuthorizationRequest;