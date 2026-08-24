const express = require("express");

const router = express.Router();

const {
    getMessages,
    getUsers,
    createMessage,
    markAsRead,
    deleteMessage,
} = require("../controllers/messageController");

const authMiddleware = require("../middlewares/authMiddleware");

// =========================
// CAIXA DE ENTRADA
// =========================

router.get(
    "/",
    authMiddleware,
    getMessages
);

// =========================
// LISTAR DESTINATÁRIOS
// =========================

router.get(
    "/users",
    authMiddleware,
    getUsers
);

// =========================
// ENVIAR MENSAGEM
// =========================

router.post(
    "/",
    authMiddleware,
    createMessage
);

// =========================
// MARCAR COMO LIDA
// =========================

router.put(
    "/:id/read",
    authMiddleware,
    markAsRead
);

// =========================
// EXCLUIR
// =========================

router.delete(
    "/:id",
    authMiddleware,
    deleteMessage
);

module.exports = router;