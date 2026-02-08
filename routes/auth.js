const express = require('express');
const fs = require('fs').promises;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const router = express.Router();
const USERS_FILE = './usuarios.json';
const SECRET = 'clave_secreta';

// REGISTRO
router.post('/register', async (req, res, next) => {
    try {
        const { usuario, password } = req.body;

        if (!usuario || !password) {
            return res.status(400).json({ mensaje: 'Datos incompletos' });
        }

        const data = await fs.readFile(USERS_FILE, 'utf8');
        const usuarios = JSON.parse(data);

        if (usuarios.find(u => u.usuario === usuario)) {
            return res.status(409).json({ mensaje: 'Usuario ya existe' });
        }

        const hash = await bcrypt.hash(password, 10);
        usuarios.push({ usuario, password: hash });

        await fs.writeFile(USERS_FILE, JSON.stringify(usuarios, null, 2));

        res.status(201).json({ mensaje: 'Usuario registrado correctamente' });
    } catch (error) {
        next(error);
    }
});

// LOGIN
router.post('/login', async (req, res, next) => {
    try {
        const { usuario, password } = req.body;

        const data = await fs.readFile(USERS_FILE, 'utf8');
        const usuarios = JSON.parse(data);

        const user = usuarios.find(u => u.usuario === usuario);
        if (!user) {
            return res.status(401).json({ mensaje: 'Credenciales incorrectas' });
        }

        const valido = await bcrypt.compare(password, user.password);
        if (!valido) {
            return res.status(401).json({ mensaje: 'Credenciales incorrectas' });
        }

        const token = jwt.sign({ usuario }, SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
