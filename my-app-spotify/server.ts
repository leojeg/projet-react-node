// server.ts
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import userRoutes from './controllers/users'; // Vérifiez le chemin
import authRoutes from './routes/auth'; // Vérifiez le chemin

const app = express();

// Middleware pour lire le JSON dans les requêtes
app.use(express.json());

// Configuration de CORS
const corsOptions = {
    origin: 'http://localhost:3000', // Autorise uniquement les requêtes depuis localhost:3000
    methods: 'GET,POST,PUT,DELETE', // Méthodes HTTP autorisées
    allowedHeaders: 'Content-Type,Authorization', // En-têtes autorisés
    optionsSuccessStatus: 200, // Pour certaines anciennes versions de navigateurs (comme IE)
};

// Utiliser CORS avec les options définies
app.use(cors(corsOptions));

// Middleware pour parser les requêtes JSON
app.use(bodyParser.json());

// Utiliser les routes des utilisateurs
app.use(authRoutes);
app.use(userRoutes);

// Définir un port
const PORT = process.env.PORT || 5000;

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
