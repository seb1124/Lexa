const express = require('express');
const router = express.Router();

// Example endpoint: GET /api/hello
router.get('/load-model', (req, res) => {
  res.json({
    message: 'Hello from Lexa API!',
    status: 'success',
    data: {
      example: 123,
      info: 'This is hardcoded JSON.'
    }
  });
});

module.exports = router;