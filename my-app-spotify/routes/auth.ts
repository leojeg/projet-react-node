// auth.ts

import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db'; // Chemin vers votre fichier de configuration de la base de données
import { QueryResult } from 'pg';

const router = express.Router();
const secretKey = '+8UPKc5tu4*Ya3/***'; // Clé secrète pour signer le JWT

// Définition des types pour l'utilisateur et les requêtes
interface User {
    id_user: number;
    name: string;
    mail: string;
    password: string;
}

// REGISTER - Inscription d'un utilisateur
router.post('/register', async (req: Request, res: Response) => {
    const { name, mail, password } = req.body as {
        name: string;
        mail: string;
        password: string;
    };

    try {
        // Vérifier si l'utilisateur existe déjà
        const userExists: QueryResult<User> = await pool.query(
            'SELECT * FROM users WHERE mail = $1',
            [mail]
        );

        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: 'Utilisateur déjà existant' });
        }

        // Hacher le mot de passe
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insérer l'utilisateur dans la base de données
        const newUserResult: QueryResult<User> = await pool.query(
            'INSERT INTO users (name, mail, password) VALUES ($1, $2, $3) RETURNING *',
            [name, mail, hashedPassword]
        );

        const newUser = newUserResult.rows[0];

        res
            .status(201)
            .json({ message: 'Utilisateur créé avec succès', user: newUser });
    } catch (error: any) {
        console.error(error.message);
        res.status(500).send('Erreur du serveur');
    }
});

// LOGIN - Connexion d'un utilisateur
router.post('/login', async (req: Request, res: Response) => {
    const { mail, password } = req.body as { mail: string; password: string };
    console.log('mail password : ', mail, password);

    try {
        // Vérifier si l'utilisateur existe
        const userResult: QueryResult<User> = await pool.query(
            'SELECT * FROM users WHERE mail = $1',
            [mail]
        );
        console.log('Résultat de la requête utilisateur : ', userResult.rows);

        if (userResult.rows.length === 0) {
            return res.status(400).json({ message: 'Utilisateur non trouvé' });
        }

        const user = userResult.rows[0];

        // Vérifier le mot de passe
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Mot de passe incorrect' });
        }

        // Créer un token JWT
        const token = jwt.sign(
            { id_user: user.id_user, name: user.name, mail: user.mail },
            secretKey,
            { expiresIn: '1h' } // Le token expire dans 1 heure
        );

        res.json({ token, message: 'Connexion réussie' });
    } catch (error: any) {
        console.error(error.message);
        res.status(500).send('Erreur du serveur');
    }
});

export default router;
