const express = require('express');
const router = express.Router();
const { ensureAuth } = require('../middleware/auth');

router.get('/', ensureAuth, async (req, res) => {
  try {
    const docs = {
      baseUrl: `${process.env.API_BASE_URL}/api/v1`,
      endpoints: [
        {
          path: '/data',
          methods: ['GET', 'POST'],
          description: 'Accès aux données principales'
        },
        {
          path: '/analytics',
          methods: ['GET'],
          description: 'Récupération des statistiques'
        }
      ]
    };
    res.json(docs);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;