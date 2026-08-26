const express = require("express");
const { rateLimit } = require('express-rate-limit')

const {
    register,
    login,
    resetPassword,
} = require("../controllers/authController");
const { startOAuth, oauthCallback } = require('../controllers/oauthController')

const router = express.Router();

const recoveryRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { success: false, message: 'Muitas tentativas. Tente novamente mais tarde.' },
})

// =========================
// CADASTRO
// =========================

router.post("/register", register);

// =========================
// LOGIN
// =========================

router.post("/login", login);

// =========================
// ALTERAR SENHA
// =========================

router.post("/reset-password", recoveryRateLimit, resetPassword);

router.get('/:provider', startOAuth)
router.get('/:provider/callback', oauthCallback)

module.exports = router;