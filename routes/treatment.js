const express = require('express');
const { treatmentOps } = require('../database');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

// Get all user's treatment plans
router.get('/', (req, res) => {
    const plans = treatmentOps.getUserPlans(req.session.userId);
    res.json(plans);
});

// Get specific treatment plan
router.get('/:id', (req, res) => {
    const { id } = req.params;
    const plan = treatmentOps.getPlanById(parseInt(id), req.session.userId);

    if (!plan) {
        return res.status(404).json({ error: 'Treatment plan not found' });
    }

    // Get tasks for this plan
    const tasks = treatmentOps.getTasks(plan.id);
    const completedTasks = {};
    tasks.forEach(task => {
        const key = `${task.day_number}-${task.task_index}`;
        completedTasks[key] = task.completed === 1;
    });

    res.json({
        ...plan,
        completedTasks
    });
});

// Create new treatment plan
router.post('/', (req, res) => {
    const planData = req.body;

    const plan = treatmentOps.create(req.session.userId, planData);

    res.json(plan);
});

// Delete treatment plan
router.delete('/:id', (req, res) => {
    const { id } = req.params;

    treatmentOps.delete(parseInt(id), req.session.userId);

    res.json({ message: 'Treatment plan deleted successfully' });
});

// Update task completion
router.put('/:id/tasks', (req, res) => {
    const { id } = req.params;
    const { dayNumber, taskIndex, completed } = req.body;

    // Verify plan belongs to user
    const plan = treatmentOps.getPlanById(parseInt(id), req.session.userId);
    if (!plan) {
        return res.status(404).json({ error: 'Treatment plan not found' });
    }

    treatmentOps.updateTask(parseInt(id), dayNumber, taskIndex, completed);

    res.json({ message: 'Task updated successfully' });
});

module.exports = router;
