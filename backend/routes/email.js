const express = require('express');
const router = express.Router();
const emailController = require('../controllers/emailController');
const { startOAuth, fetchBankAlerts } = emailController;

// Start OAuth flow (redirect to provider)
router.get('/connect', startOAuth);
// Fetch and parse bank alert emails
router.get('/alerts', fetchBankAlerts);
// OAuth2 endpoints for Gmail
router.get('/gmail/auth', emailController.initiateGmailOAuth);
router.get('/gmail/callback', emailController.handleGmailOAuthCallback);
router.get('/gmail/emails', emailController.fetchGmailEmails);

// OAuth2 endpoints for Outlook
router.get('/outlook/auth', emailController.initiateOutlookOAuth);
router.get('/outlook/callback', emailController.handleOutlookOAuthCallback);
router.get('/outlook/emails', emailController.fetchOutlookEmails);

// Transaction analytics endpoint
router.get('/analytics', emailController.getTransactionAnalytics);

module.exports = router;
