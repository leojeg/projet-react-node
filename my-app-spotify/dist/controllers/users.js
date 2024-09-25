"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const express = require('express');
const router = express.Router();
const pool = require('../db'); // Chemin relatif pour accéder à db.js à partir de controllers/
// READ - Obtenir tous les utilisateurs
router.get('/api/users', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield pool.query('SELECT * FROM users');
        res.json(result.rows);
    }
    catch (error) {
        console.error(error.message);
        res.status(500).send('Erreur du serveur');
    }
}));
// CREATE - Ajouter un utilisateur
router.post('/api/users', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, mail, password } = req.body;
    try {
        const result = yield pool.query('INSERT INTO users (name, mail, password) VALUES ($1, $2, $3) RETURNING *', [name, mail, password]);
        res.status(201).json(result.rows[0]);
    }
    catch (error) {
        console.error(error.message);
        res.status(500).send('Erreur du serveur');
    }
}));
// UPDATE - Modifier un utilisateur par ID
router.put('/api/users/:id_user', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id_user } = req.params;
    const { name, mail } = req.body;
    try {
        const result = yield pool.query('UPDATE users SET name = $1, mail = $2 WHERE id_user = $3 RETURNING *', [name, mail, id_user]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }
        res.json(result.rows[0]);
    }
    catch (error) {
        console.error(error.message);
        res.status(500).send('Erreur du serveur');
    }
}));
// DELETE - Supprimer un utilisateur par ID
router.delete('/api/users/:id_user', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id_user } = req.params;
    try {
        const result = yield pool.query('DELETE FROM users WHERE id_user = $1 RETURNING *', [id_user]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }
        res.status(204).send();
    }
    catch (error) {
        console.error(error.message);
        res.status(500).send('Erreur du serveur');
    }
}));
module.exports = router;
