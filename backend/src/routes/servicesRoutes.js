const express = require("express");

const router = express.Router();

const {
    getPublicService,
    getPublicServices,
    getServices,
    createService,
    updateService,
    deleteService,
} = require("../controllers/serviceController");

const authMiddleware = require("../middlewares/authMiddleware");

// Listar serviços
router.get("/public/:id", getPublicService);
router.get("/public", getPublicServices);
router.get("/:id", getPublicService);
router.get("/", authMiddleware, getServices);

// Criar serviço
router.post("/", authMiddleware, createService);
router.put("/:id", authMiddleware, updateService);

// Excluir serviço
router.delete("/:id", authMiddleware, deleteService);

module.exports = router;