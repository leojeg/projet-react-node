"use strict";
// auth.ts
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = __importDefault(require("../db")); // Chemin vers votre fichier de configuration de la base de données
const router = express_1.default.Router();
const secretKey = '+8UPKc5tu4*Ya3/***'; // Clé secrète pour signer le JWT
// REGISTER - Inscription d'un utilisateur
router.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, mail, password } = req.body;
    try {
        // Vérifier si l'utilisateur existe déjà
        const userExists = yield db_1.default.query('SELECT * FROM users WHERE mail = $1', [mail]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: 'Utilisateur déjà existant' });
        }
        // Hacher le mot de passe
        const salt = yield bcryptjs_1.default.genSalt(10);
        const hashedPassword = yield bcryptjs_1.default.hash(password, salt);
        // Insérer l'utilisateur dans la base de données
        const newUserResult = yield db_1.default.query('INSERT INTO users (name, mail, password) VALUES ($1, $2, $3) RETURNING *', [name, mail, hashedPassword]);
        const newUser = newUserResult.rows[0];
        res
            .status(201)
            .json({ message: 'Utilisateur créé avec succès', user: newUser });
    }
    catch (error) {
        console.error(error.message);
        res.status(500).send('Erreur du serveur');
    }
}));
// LOGIN - Connexion d'un utilisateur
router.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { mail, password } = req.body;
    console.log('mail password : ', mail, password);
    try {
        // Vérifier si l'utilisateur existe
        const userResult = yield db_1.default.query('SELECT * FROM users WHERE mail = $1', [mail]);
        console.log('Résultat de la requête utilisateur : ', userResult.rows);
        if (userResult.rows.length === 0) {
            return res.status(400).json({ message: 'Utilisateur non trouvé' });
        }
        const user = userResult.rows[0];
        // Vérifier le mot de passe
        const isMatch = yield bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Mot de passe incorrect' });
        }
        // Créer un token JWT
        const token = jsonwebtoken_1.default.sign({ id_user: user.id_user, name: user.name, mail: user.mail }, secretKey, { expiresIn: '1h' } // Le token expire dans 1 heure
        );
        res.json({ token, message: 'Connexion réussie' });
    }
    catch (error) {
        console.error(error.message);
        res.status(500).send('Erreur du serveur');
    }
}));
exports.default = router;
