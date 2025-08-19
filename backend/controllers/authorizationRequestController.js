const { validationResult } = require("express-validator");
const express = require("express");
const axios = require("axios");
const { Sequelize } = require("sequelize");
const sequelize = require("../config/database");
const User = require("../models/Users");
const MemberAuthorization = require("../models/MemberAuthorization");
const router = express.Router();
const validationAuthorizationRequest = require("../helpers/validationAuthorizationRequest");
const generateRequestId = () => {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString();
};

async function generateRandomDate() {
  const start = new Date('2025-06-13');
  const end = new Date('2025-08-13');
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
}

async function getRandomMemberId() {
  const users = await User.findAll();
  if (users.length === 0) {
    throw new Error('No users found in the database');
  }
  const randomUser = users[Math.floor(Math.random() * users.length)];
  return `TEST-PAYER-${randomUser.id}`;
}

function generateRandomDiagnosisCode() {
  const letter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
  const number = Math.floor(Math.random() * 100).toString().padStart(2, '0');
  const decimal = Math.random() > 0.5 ? `.${Math.floor(Math.random() * 10)}` : '';
  return `${letter}${number}${decimal}`;
}

function generateRandomDrugCode() {
  const firstPart = Math.floor(Math.random() * 100).toString().padStart(2, '0');
  const secondPart = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${firstPart}-${secondPart}`;
}

function generateRandomFileRefId() {
  return Math.floor(Math.random() * 1000000).toString();
}

function generateRandomFileRef() {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 40; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

module.exports.controller = function (app) {
  app.post("/authorization-requests", validationAuthorizationRequest, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: errors.array().map((err) => err.msg).join(", "),
      });
    }

    try {
      const requestId = generateRequestId();
      const requestBody = {
        ...req.body,
        requestId: requestId,
      };
      console.log('Request Body:', requestBody);
      console.log('Stringified Request Body:', JSON.stringify(requestBody));

      const newRequest = await MemberAuthorization.create({
        memberId: requestBody.memberId,
      });

      res.status(201).json({
        message: "Authorization request saved successfully",
        data: newRequest,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: "Failed to save authorization request",
        details: error.message,
      });
    }
  });
  
 
  
  app.post("/authorization-requests/generate", async (req, res) => {
    const count = req.body.count || 5;
    try {
      for (let i = 0; i < count; i++) {
        console.log(`Generating request ${i + 1} of ${count}`);
  
      
        const totalCount = await MemberAuthorization.count();
        if (totalCount === 0) {
          return res.status(404).json({ error: "No member records found" });
        }
  
       
        const randomOffset = Math.floor(Math.random() * totalCount);
  
    
        const randomMember = await MemberAuthorization.findOne({}, { offset: randomOffset });
        const memberId = randomMember?.id;
        if (!memberId) {
          throw new Error("Failed to fetch random memberId");
        }
  
        const eRxDate = await generateRandomDate();
        const requestId = generateRequestId();
  
        const payload = {
          type: "Authorization",
          source: `test-pharmacy${Math.floor(Math.random() * 100)}`,
          dispositionFlag: "TEST",
          senderId: `DHA-F-${Math.floor(Math.random() * 1000000)}`,
          receiverId: `INS${Math.floor(Math.random() * 1000)}`,
          payerId: `INS${Math.floor(Math.random() * 1000)}`,
          reqId: requestId,
          memberId: memberId,
          eRxDate: eRxDate,
          prescriberId: `QTR-${Math.floor(Math.random() * 100000)}`,
          diagnoses: [
            { Type: "Principal", Code: generateRandomDiagnosisCode() },
            { Type: "Secondary", Code: generateRandomDiagnosisCode() },
          ],
          drugList: [
            {
              drugReferenceId: Math.floor(Math.random() * 10000000000).toString(),
              drugCode: generateRandomDrugCode(),
              requestedQuantity: Math.floor(Math.random() * 10) + 1,
              requestdaysOfSupply: Math.floor(Math.random() * 30) + 1,
              requestedAmount: Math.floor(Math.random() * 1000) + 50,
            },
          ],
          attachmentList: [
            {
              fileRefId: generateRandomFileRefId(),
              fileDescription: "x-ray",
              fileRef: generateRandomFileRef(),
            },
            {
              fileRefId: generateRandomFileRefId(),
              fileDescription: "blood_test",
              fileRef: generateRandomFileRef(),
            },
          ],
        };
  
        console.log("Request Body:", payload);
  
        try {
          await axios.post("http://localhost:8081/authorization-requests", payload, {
            headers: { "Content-Type": "application/json" },
          });
        } catch (err) {
          console.error(`Failed to generate request ${i + 1}:`, err.response?.data || err.message);
        }
  
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
  
      res.status(200).json({
        message: `Successfully generated ${count} authorization requests`,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: "Failed to generate authorization requests",
        details: error.message,
      });
    }
  });
  
  app.get("/authorization-requests", async (req, res) => {
    try {
      const requests = await MemberAuthorization.findAll();
      res.json({
        data: requests,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: "Failed to fetch authorization requests",
        details: error.message || "Unknown server error",
      });
    }
  });

  app.get("/authorization-requests/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const request = await MemberAuthorization.findByPk(id);
      if (!request) {
        return res.status(404).json({
          error: "Authorization request not found",
        });
      }
      res.json({
        data: request,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: "Failed to fetch authorization request",
        details: error.message,
      });
    }
  });
};