const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// GET /api/load-model
router.get('/load-model', (req, res) => {
  const dataPath = path.join(__dirname, '../data/trainingData.json');
  fs.readFile(dataPath, 'utf8', (err, jsonData) => {
    if (err) {
      return res.status(500).json({
        message: 'Failed to load training data',
        status: 'error',
        data: {}
      });
    }
    let data;
    try {
      data = JSON.parse(jsonData);
    } catch (parseErr) {
      return res.status(500).json({
        message: 'Invalid JSON format',
        status: 'error',
        data: {}
      });
    }
    res.json({
      message: 'Training data loaded',
      status: 'success',
      data
    });
  });
});

module.exports = router;