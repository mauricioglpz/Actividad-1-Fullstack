const express = require('express');
const fs = require('fs').promises;
const authMiddleware = require('../middleware/authMiddleware');
const validateTarea = require('../middleware/validateTarea');

const router = express.Router();
const TASKS_FILE = './tareas.json';


router.use(authMiddleware);

// GET
router.get('/', async (req, res, next) => {
    try {
        const data = await fs.readFile(TASKS_FILE, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        next(error);
    }
});

// POST
router.post('/', validateTarea, async (req, res, next) => {
    try {
        const data = await fs.readFile(TASKS_FILE, 'utf8');
        const tareas = JSON.parse(data);

        const nueva = {
            id: Date.now(),
            ...req.body
        };

        tareas.push(nueva);
        await fs.writeFile(TASKS_FILE, JSON.stringify(tareas, null, 2));

        res.status(201).json(nueva);
    } catch (error) {
        next(error);
    }
});

// PUT
router.put('/:id', validateTarea, async (req, res, next) => {
    try {
        const data = await fs.readFile(TASKS_FILE, 'utf8');
        let tareas = JSON.parse(data);

        tareas = tareas.map(t =>
            t.id == req.params.id ? { ...t, ...req.body } : t
        );

        await fs.writeFile(TASKS_FILE, JSON.stringify(tareas, null, 2));
        res.json({ mensaje: 'Tarea actualizada' });
    } catch (error) {
        next(error);
    }
});

// DELETE
router.delete('/:id', async (req, res, next) => {
    try {
        const data = await fs.readFile(TASKS_FILE, 'utf8');
        const tareas = JSON.parse(data).filter(t => t.id != req.params.id);

        await fs.writeFile(TASKS_FILE, JSON.stringify(tareas, null, 2));
        res.json({ mensaje: 'Tarea eliminada' });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
