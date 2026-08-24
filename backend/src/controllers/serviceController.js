const pool = require("../database/connection");

const getPublicService = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            `SELECT id, title, description, icon, created_at
             FROM services
             WHERE id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Serviço não encontrado.",
            });
        }

        return res.json({
            success: true,
            service: result.rows[0],
        });
    } catch (error) {
        console.error("Erro ao buscar serviço público:", error);

        return res.status(500).json({
            success: false,
            message: "Erro interno do servidor.",
        });
    }
};

const getPublicServices = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, title, description, icon, created_at
             FROM services
             ORDER BY created_at DESC`
        );

        return res.json({
            success: true,
            services: result.rows,
        });

    } catch (error) {
        console.error("Erro ao buscar serviços públicos:", error);

        return res.status(500).json({
            success: false,
            message: "Erro interno do servidor.",
        });
    }
};

// =========================
// LISTAR SERVIÇOS DO USUÁRIO
// =========================

const getServices = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await pool.query(
            `SELECT id, title, description, icon, created_at
             FROM services
             WHERE user_id = $1
             ORDER BY created_at DESC`,
            [userId]
        );

        return res.json({
            success: true,
            services: result.rows,
        });

    } catch (error) {
        console.error("Erro ao buscar serviços:", error);

        return res.status(500).json({
            success: false,
            message: "Erro interno do servidor.",
        });
    }
};

// =========================
// CRIAR SERVIÇO
// =========================

const createService = async (req, res) => {
    try {
        const userId = req.user.id;

        const {
            title,
            description,
            icon,
        } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({
                success: false,
                message: "O título do serviço é obrigatório.",
            });
        }

        const result = await pool.query(
            `INSERT INTO services
                (user_id, title, description, icon)
             VALUES ($1, $2, $3, $4)
             RETURNING id, title, description, icon, created_at`,
            [
                userId,
                title.trim(),
                description?.trim() || null,
                icon?.trim() || null,
            ]
        );

        return res.status(201).json({
            success: true,
            message: "Serviço criado com sucesso.",
            service: result.rows[0],
        });

    } catch (error) {
        console.error("Erro ao criar serviço:", error);

        return res.status(500).json({
            success: false,
            message: "Erro interno do servidor.",
        });
    }
};

const updateService = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { title, description, icon } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({ success: false, message: "O título do serviço é obrigatório." });
        }

        const result = await pool.query(
            `UPDATE services
             SET title = $1, description = $2, icon = $3
             WHERE id = $4 AND user_id = $5
             RETURNING id, title, description, icon, created_at`,
            [title.trim(), description?.trim() || null, icon?.trim() || null, id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Serviço não encontrado." });
        }

        return res.json({ success: true, service: result.rows[0] });
    } catch (error) {
        console.error("Erro ao atualizar serviço:", error);
        return res.status(500).json({ success: false, message: "Erro interno do servidor." });
    }
};

// =========================
// EXCLUIR SERVIÇO
// =========================

const deleteService = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const result = await pool.query(
            `DELETE FROM services
             WHERE id = $1
             AND user_id = $2
             RETURNING id`,
            [id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Serviço não encontrado.",
            });
        }

        return res.json({
            success: true,
            message: "Serviço excluído com sucesso.",
        });

    } catch (error) {
        console.error("Erro ao excluir serviço:", error);

        return res.status(500).json({
            success: false,
            message: "Erro interno do servidor.",
        });
    }
};

module.exports = {
    getPublicService,
    getPublicServices,
    getServices,
    createService,
    updateService,
    deleteService,
};