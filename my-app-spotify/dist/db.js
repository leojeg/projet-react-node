"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// db.js
const { Pool } = require('pg');
const pool = new Pool({
    user: 'my-bdd-react-node', // Remplace par ton utilisateur PostgreSQL
    host: 'postgresql-my-bdd-react-node.alwaysdata.net', // Remplace par l'hôte PostgreSQL
    database: 'my-bdd-react-node_eventbnb', // Remplace par ta base de données PostgreSQL
    password: 'Bt4rz5oi9*', // Mot de passe PostgreSQL
    port: 5432, // Port par défaut pour PostgreSQL
});
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Erreur de connexion à la base de données', err);
    }
    else {
        console.log('Connexion à la base de données réussie', res.rows);
    }
});
exports.default = pool;
