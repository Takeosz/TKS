const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const pool = require("../database/connection");

// =========================
// CADASTRO
// =========================

const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Nome, email e senha são obrigatórios.",
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "A senha deve ter pelo menos 6 caracteres.",
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await pool.query(
            "SELECT id FROM users WHERE email = $1",
            [normalizedEmail]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Este email já está cadastrado.",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            `INSERT INTO users (name, email, password)
             VALUES ($1, $2, $3)
             RETURNING id, name, email, role, avatar_url`,
            [
                name.trim(),
                normalizedEmail,
                hashedPassword,
            ]
        );

        return res.status(201).json({
            success: true,
            message: "Usuário cadastrado com sucesso.",
            user: result.rows[0],
        });

    } catch (error) {
        console.error("Erro no cadastro:", error);

        return res.status(500).json({
            success: false,
            message: "Erro interno do servidor.",
        });
    }
};

// =========================
// LOGIN
// =========================

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email e senha são obrigatórios.",
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const result = await pool.query(
            "SELECT id, name, email, password, role, avatar_url FROM users WHERE email = $1",
            [normalizedEmail]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Email ou senha incorretos.",
            });
        }

        const user = result.rows[0];

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: "Email ou senha incorretos.",
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar_url: user.avatar_url,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "30d",
            }
        );

        return res.json({
            success: true,
            message: "Login realizado com sucesso.",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar_url: user.avatar_url,
            },
        });

    } catch (error) {
        console.error("Erro no login:", error);

        return res.status(500).json({
            success: false,
            message: "Erro interno do servidor.",
        });
    }
};

// =========================
// ALTERAR SENHA
// =========================

const resetPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;

        if (!email || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Email e nova senha são obrigatórios.",
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: "A nova senha deve ter pelo menos 6 caracteres.",
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const userResult = await pool.query(
            "SELECT id FROM users WHERE email = $1",
            [normalizedEmail]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Usuário não encontrado.",
            });
        }

        const hashedPassword = await bcrypt.hash(
            newPassword,
            10
        );

        await pool.query(
            "UPDATE users SET password = $1 WHERE email = $2",
            [hashedPassword, normalizedEmail]
        );

        return res.json({
            success: true,
            message: "Senha alterada com sucesso.",
        });

    } catch (error) {
        console.error("Erro ao alterar senha:", error);

        return res.status(500).json({
            success: false,
            message: "Erro interno do servidor.",
        });
    }
};

module.exports = {
    register,
    login,
    resetPassword,
};
