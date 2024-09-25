// userController.ts
import express, { Request, Response } from 'express';
import pool from '../db'; // Chemin relatif pour accéder à db.ts à partir de controllers/
import { QueryResult } from 'pg';

const router = express.Router();

interface User {
    id_user: number;
    name: string;
    mail: string;
    password?: string;
    index: number;
}

// READ - Obtenir tous les utilisateurs
router.get('/api/users', async (req: Request, res: Response) => {
    try {
        const result: QueryResult<User> = await pool.query('SELECT * FROM users');
        res.json(result.rows);
    } catch (error: any) {
        console.error(error.message);
        res.status(500).send('Erreur du serveur');
    }
});
// Mise à jour de l'ordre des utilisateurs
router.put('/api/users/order', async (req, res) => {
    const { users } = req.body; // Array d'utilisateurs avec leur nouvel index

    try {
        const promises = users.map(async (user: { id_user: number; index: number }) => {
            const { id_user, index } = user;
            await pool.query(
                'UPDATE users SET "index" = $1 WHERE id_user = $2',
                [index, id_user]
            );
        });

        await Promise.all(promises);
        res.status(200).send("Ordre des utilisateurs mis à jour");
    } catch (error) {
        console.error(error);
        res.status(500).send("Erreur lors de la mise à jour de l'ordre");
    }
});

// Ajouter un utilisateur aux favoris
router.post('/api/users/:id_user/favoris', async (req: Request, res: Response) => {
    const { id_user } = req.params;  // ID de l'utilisateur qui est ajouté en favoris
    const { id_favoris_user } = req.body as { id_favoris_user: number }; // ID de l'utilisateur qui ajoute le favori

    try {
        const result: QueryResult = await pool.query(
            'INSERT INTO favoris (id_user, id_favoris_user) VALUES ($1, $2) RETURNING *',
            [id_favoris_user, id_user]
        );
        res.status(201).json(result.rows[0]);
    } catch (error: any) {
        console.error(error.message);
        res.status(500).send('Erreur lors de l\'ajout du favori');
    }
});

// Retirer un utilisateur des favoris
router.delete('/api/users/:id_user/favoris', async (req: Request, res: Response) => {
    const { id_user } = req.params;  // ID de l'utilisateur qui est retiré des favoris
    const { id_favoris_user } = req.body as { id_favoris_user: number }; // ID de l'utilisateur qui retire le favori

    try {
        await pool.query(
            'DELETE FROM favoris WHERE id_user = $1 AND id_favoris_user = $2',
            [id_favoris_user, id_user]
        );
        res.status(204).send();
    } catch (error: any) {
        console.error(error.message);
        res.status(500).send('Erreur lors du retrait du favori');
    }
});

// Obtenir tous les favoris d'un utilisateur
router.get('/api/users/:id_user/favoris', async (req: Request, res: Response) => {
    const { id_user } = req.params;

    try {
        const result: QueryResult = await pool.query(
            `SELECT u.* 
             FROM users u 
             JOIN favoris f ON u.id_user = f.id_user 
             WHERE f.id_favoris_user = $1`,
            [id_user]
        );
        res.json(result.rows);
    } catch (error: any) {
        console.error(error.message);
        res.status(500).send('Erreur lors de la récupération des favoris');
    }
});


// CREATE - Ajouter un utilisateur
router.post('/api/users', async (req: Request, res: Response) => {
    const { name, mail, password } = req.body as {
        name: string;
        mail: string;
        password: string;
    };
    try {
        const result: QueryResult<User> = await pool.query(
            'INSERT INTO users (name, mail, password) VALUES ($1, $2, $3) RETURNING *',
            [name, mail, password]
        );
        res.status(201).json(result.rows[0]);
    } catch (error: any) {
        console.error(error.message);
        res.status(500).send('Erreur du serveur');
    }
});

// UPDATE - Modifier un utilisateur par ID
router.put('/api/users/:id_user', async (req: Request, res: Response) => {
    const { id_user } = req.params;
    const { name, mail } = req.body as { name: string; mail: string };
    try {
        const result: QueryResult<User> = await pool.query(
            'UPDATE users SET name = $1, mail = $2 WHERE id_user = $3 RETURNING *',
            [name, mail, id_user]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }
        res.json(result.rows[0]);
    } catch (error: any) {
        console.error(error.message);
        res.status(500).send('Erreur du serveur');
    }
});

// DELETE - Supprimer un utilisateur par ID
router.delete('/api/users/:id_user', async (req: Request, res: Response) => {
    const { id_user } = req.params;
    try {
        const result: QueryResult<User> = await pool.query(
            'DELETE FROM users WHERE id_user = $1 RETURNING *',
            [id_user]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }
        res.status(204).send();
    } catch (error: any) {
        console.error(error.message);
        res.status(500).send('Erreur du serveur');
    }
});

export default router;
