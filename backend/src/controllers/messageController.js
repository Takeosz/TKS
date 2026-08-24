const pool = require("../database/connection");

// =========================
// SOCKET.IO
// =========================

let io = null;

const setSocketIO = (socketIO) => {
    io = socketIO;
};

// =========================
// LISTAR MENSAGENS
// =========================

const getMessages = async (req, res) => {
    try {
        const userId = Number(req.user.id);

        if (!userId || Number.isNaN(userId)) {
            return res.status(401).json({
                success: false,
                message: "Usuário autenticado inválido.",
            });
        }

        const result = await pool.query(
            `
            SELECT
                m.id,
                m.name,
                m.email,
                m.subject,
                m.message,
                m."read",
                m.created_at,
                m.user_id,
                m.sender_id,
                m.recipient_id,

                sender.name AS sender_name,
                sender.email AS sender_email,

                recipient.name AS recipient_name,
                recipient.email AS recipient_email

            FROM messages m

            LEFT JOIN users sender
                ON sender.id = m.sender_id

            LEFT JOIN users recipient
                ON recipient.id = m.recipient_id

            WHERE
                m.sender_id = $1
                OR m.recipient_id = $1

            ORDER BY m.created_at ASC
            `,
            [userId]
        );

        const messages = result.rows;

        const receivedMessages = messages.filter(
            (message) =>
                Number(message.recipient_id) === userId
        );

        const sentMessages = messages.filter(
            (message) =>
                Number(message.sender_id) === userId
        );

        return res.status(200).json({
            success: true,
            messages,
            receivedMessages,
            sentMessages,
        });
    } catch (error) {
        console.error(
            "Erro ao buscar mensagens:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Erro interno do servidor.",
        });
    }
};

// =========================
// LISTAR USUÁRIOS
// =========================

const getUsers = async (req, res) => {
    try {
        const userId = Number(req.user.id);

        if (!userId || Number.isNaN(userId)) {
            return res.status(401).json({
                success: false,
                message: "Usuário autenticado inválido.",
            });
        }

        const result = await pool.query(
            `
            SELECT
                id,
                name,
                email
            FROM users
            WHERE id <> $1
            ORDER BY name ASC
            `,
            [userId]
        );

        return res.status(200).json({
            success: true,
            users: result.rows,
        });
    } catch (error) {
        console.error(
            "Erro ao buscar usuários:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Erro interno do servidor.",
        });
    }
};

// =========================
// ENVIAR MENSAGEM
// =========================

const createMessage = async (req, res) => {
    try {
        const senderId = Number(req.user.id);
        const recipientId = Number(
            req.body.recipient_id
        );

        const subject =
            typeof req.body.subject === "string"
                ? req.body.subject.trim()
                : "";

        const message =
            typeof req.body.message === "string"
                ? req.body.message.trim()
                : "";

        // =========================
        // VALIDAR REMETENTE
        // =========================

        if (
            !senderId ||
            Number.isNaN(senderId)
        ) {
            return res.status(401).json({
                success: false,
                message: "Usuário autenticado inválido.",
            });
        }

        // =========================
        // VALIDAR DESTINATÁRIO
        // =========================

        if (
            !recipientId ||
            Number.isNaN(recipientId) ||
            recipientId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Destinatário inválido.",
            });
        }

        // =========================
        // VALIDAR MENSAGEM
        // =========================

        if (!message) {
            return res.status(400).json({
                success: false,
                message: "A mensagem é obrigatória.",
            });
        }

        // =========================
        // NÃO ENVIAR PARA SI MESMO
        // =========================

        if (senderId === recipientId) {
            return res.status(400).json({
                success: false,
                message:
                    "Você não pode enviar uma mensagem para sua própria conta.",
            });
        }

        // =========================
        // BUSCAR REMETENTE
        // =========================

        const senderResult = await pool.query(
            `
            SELECT
                id,
                name,
                email
            FROM users
            WHERE id = $1
            `,
            [senderId]
        );

        if (senderResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Remetente não encontrado.",
            });
        }

        const sender = senderResult.rows[0];

        // =========================
        // BUSCAR DESTINATÁRIO
        // =========================

        const recipientResult = await pool.query(
            `
            SELECT
                id,
                name,
                email
            FROM users
            WHERE id = $1
            `,
            [recipientId]
        );

        if (recipientResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Destinatário não encontrado.",
            });
        }

        const recipient = recipientResult.rows[0];

        // =========================
        // CRIAR MENSAGEM
        // =========================

        const result = await pool.query(
            `
            INSERT INTO messages
            (
                name,
                email,
                subject,
                message,
                "read",
                user_id,
                sender_id,
                recipient_id
            )
            VALUES
            (
                $1,
                $2,
                $3,
                $4,
                FALSE,
                $5,
                $6,
                $7
            )
            RETURNING
                id,
                name,
                email,
                subject,
                message,
                "read",
                created_at,
                user_id,
                sender_id,
                recipient_id
            `,
            [
                sender.name,
                sender.email,
                subject || null,
                message,
                senderId,
                senderId,
                recipientId,
            ]
        );

        const newMessage = {
            ...result.rows[0],

            sender_name: sender.name,
            sender_email: sender.email,

            recipient_name: recipient.name,
            recipient_email: recipient.email,
        };

        // =========================
        // SOCKET.IO
        // =========================

        if (io) {
            io.to(`user_${recipientId}`).emit(
                "new_message",
                newMessage
            );

            io.to(`user_${senderId}`).emit(
                "message_sent",
                newMessage
            );
        }

        return res.status(201).json({
            success: true,
            message: "Mensagem enviada com sucesso.",
            data: newMessage,
        });
    } catch (error) {
        console.error(
            "Erro ao enviar mensagem:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Erro interno do servidor.",
        });
    }
};

// =========================
// MARCAR COMO LIDA
// =========================

const markAsRead = async (req, res) => {
    try {
        const messageId = Number(req.params.id);
        const userId = Number(req.user.id);

        if (
            !messageId ||
            Number.isNaN(messageId)
        ) {
            return res.status(400).json({
                success: false,
                message: "ID da mensagem inválido.",
            });
        }

        if (
            !userId ||
            Number.isNaN(userId)
        ) {
            return res.status(401).json({
                success: false,
                message: "Usuário autenticado inválido.",
            });
        }

        const result = await pool.query(
            `
            UPDATE messages
            SET "read" = TRUE

            WHERE id = $1
            AND recipient_id = $2

            RETURNING
                id,
                name,
                email,
                subject,
                message,
                "read",
                created_at,
                user_id,
                sender_id,
                recipient_id
            `,
            [
                messageId,
                userId,
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message:
                    "Mensagem não encontrada ou você não é o destinatário.",
            });
        }

        const updatedMessage = result.rows[0];

        // Buscar dados do remetente e destinatário
        const usersResult = await pool.query(
            `
            SELECT
                id,
                name,
                email
            FROM users
            WHERE id = $1
            OR id = $2
            `,
            [
                updatedMessage.sender_id,
                updatedMessage.recipient_id,
            ]
        );

        const sender = usersResult.rows.find(
            (item) =>
                Number(item.id) ===
                Number(updatedMessage.sender_id)
        );

        const recipient = usersResult.rows.find(
            (item) =>
                Number(item.id) ===
                Number(updatedMessage.recipient_id)
        );

        const message = {
            ...updatedMessage,

            sender_name: sender?.name || null,
            sender_email: sender?.email || null,

            recipient_name: recipient?.name || null,
            recipient_email: recipient?.email || null,
        };

        return res.status(200).json({
            success: true,
            message: "Mensagem marcada como lida.",
            data: message,
        });
    } catch (error) {
        console.error(
            "Erro ao marcar mensagem como lida:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Erro interno do servidor.",
        });
    }
};

// =========================
// EXCLUIR MENSAGEM
// =========================

const deleteMessage = async (req, res) => {
    try {
        const messageId = Number(req.params.id);
        const userId = Number(req.user.id);

        if (
            !messageId ||
            Number.isNaN(messageId)
        ) {
            return res.status(400).json({
                success: false,
                message: "ID da mensagem inválido.",
            });
        }

        if (
            !userId ||
            Number.isNaN(userId)
        ) {
            return res.status(401).json({
                success: false,
                message: "Usuário autenticado inválido.",
            });
        }

        const result = await pool.query(
            `
            DELETE FROM messages

            WHERE id = $1

            AND (
                sender_id = $2
                OR recipient_id = $2
            )

            RETURNING id
            `,
            [
                messageId,
                userId,
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message:
                    "Mensagem não encontrada ou você não tem permissão para excluí-la.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Mensagem excluída com sucesso.",
        });
    } catch (error) {
        console.error(
            "Erro ao excluir mensagem:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Erro interno do servidor.",
        });
    }
};

// =========================
// EXPORTAR
// =========================

module.exports = {
    getMessages,
    getUsers,
    createMessage,
    markAsRead,
    deleteMessage,
    setSocketIO,
};