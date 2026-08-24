const pool = require("../database/connection");
const { v2: cloudinary } = require('cloudinary');
const fs = require('fs/promises');
const path = require('path');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadProjectImage = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'Selecione uma imagem.' });
    }

    try {
        const hasCloudinary = process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET;
        let imageUrl;

        if (hasCloudinary) {
            const result = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: 'tks/projects', resource_type: 'image' },
                    (error, uploadedFile) => error ? reject(error) : resolve(uploadedFile)
                );
                stream.end(req.file.buffer);
            });
            imageUrl = result.secure_url;
        } else {
            const extension = req.file.mimetype.split('/')[1] === 'jpeg' ? 'jpg' : req.file.mimetype.split('/')[1];
            const relativePath = path.join('uploads', 'projects', `${Date.now()}-${req.user.id}.${extension}`);
            const absolutePath = path.join(__dirname, '..', '..', relativePath);
            await fs.mkdir(path.dirname(absolutePath), { recursive: true });
            await fs.writeFile(absolutePath, req.file.buffer);
            imageUrl = `${req.protocol}://${req.get('host')}/${relativePath.replace(/\\/g, '/')}`;
        }

        return res.status(201).json({ success: true, image: imageUrl });
    } catch (error) {
        console.error('Erro ao enviar imagem:', error);
        return res.status(502).json({ success: false, message: 'Não foi possível enviar a imagem.' });
    }
};

const getPublicProjects = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, title, description, image, link, category, created_at
             FROM projects
             ORDER BY created_at DESC`
        );

        return res.json({
            success: true,
            projects: result.rows,
        });

    } catch (error) {
        console.error("Erro ao buscar projetos públicos:", error);

        return res.status(500).json({
            success: false,
            message: "Erro interno do servidor.",
        });
    }
};

// =========================
// LISTAR PROJETOS DO USUÁRIO
// =========================

const getProjects = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await pool.query(
            `SELECT id, title, description, image, link, category, created_at
             FROM projects
             WHERE user_id = $1
             ORDER BY created_at DESC`,
            [userId]
        );

        return res.json({
            success: true,
            projects: result.rows,
        });

    } catch (error) {
        console.error("Erro ao buscar projetos:", error);

        return res.status(500).json({
            success: false,
            message: "Erro interno do servidor.",
        });
    }
};

const getPublicProject = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, title, description, image, link, category, created_at
             FROM projects WHERE id = $1`,
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Projeto não encontrado." });
        }

        return res.json({ success: true, project: result.rows[0] });
    } catch (error) {
        console.error("Erro ao buscar projeto público:", error);
        return res.status(500).json({ success: false, message: "Erro interno do servidor." });
    }
};

// =========================
// CRIAR PROJETO
// =========================

const createProject = async (req, res) => {
    try {
        const userId = req.user.id;
        const { title, description, image, link, category } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({
                success: false,
                message: "O título do projeto é obrigatório.",
            });
        }

        if (link && !/^https?:\/\//i.test(link.trim())) {
            return res.status(400).json({
                success: false,
                message: "O link deve começar com http:// ou https://.",
            });
        }

        const result = await pool.query(
            `INSERT INTO projects
                     (user_id, title, description, image, link, category)
                 VALUES ($1, $2, $3, $4, $5, $6)
                 RETURNING id, title, description, image, link, category, created_at`,
            [
                userId,
                title.trim(),
                description?.trim() || null,
                image?.trim() || null,
                link?.trim() || null,
                category?.trim() || null,
            ]
        );

        return res.status(201).json({
            success: true,
            message: "Projeto criado com sucesso.",
            project: result.rows[0],
        });

    } catch (error) {
        console.error("Erro ao criar projeto:", error);

        return res.status(500).json({
            success: false,
            message: "Erro interno do servidor.",
        });
    }
};

const updateProject = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { title, description, image, link, category } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({ success: false, message: "O título do projeto é obrigatório." });
        }

        if (link && !/^https?:\/\//i.test(link.trim())) {
            return res.status(400).json({ success: false, message: "O link deve começar com http:// ou https://." });
        }

        const result = await pool.query(
            `UPDATE projects
             SET title = $1, description = $2, image = $3, link = $4, category = $5
             WHERE id = $6 AND user_id = $7
             RETURNING id, title, description, image, link, category, created_at`,
            [title.trim(), description?.trim() || null, image?.trim() || null, link?.trim() || null, category?.trim() || null, id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Projeto não encontrado." });
        }

        return res.json({ success: true, project: result.rows[0] });
    } catch (error) {
        console.error("Erro ao atualizar projeto:", error);
        return res.status(500).json({ success: false, message: "Erro interno do servidor." });
    }
};

// =========================
// EXCLUIR PROJETO
// =========================

const deleteProject = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const result = await pool.query(
            `DELETE FROM projects
             WHERE id = $1
             AND user_id = $2
             RETURNING id`,
            [id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Projeto não encontrado.",
            });
        }

        return res.json({
            success: true,
            message: "Projeto excluído com sucesso.",
        });

    } catch (error) {
        console.error("Erro ao excluir projeto:", error);

        return res.status(500).json({
            success: false,
            message: "Erro interno do servidor.",
        });
    }
};

module.exports = {
    uploadProjectImage,
    getPublicProjects,
    getPublicProject,
    getProjects,
    createProject,
    updateProject,
    deleteProject,
};