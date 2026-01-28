const express = require('express');
const taskController = require('./task.controller');
const taskValidation = require('./task.validation');
const { validate, sanitize } = require('../../middleware/validation.middleware');
const { isAuthenticated } = require('../../middleware/auth.middleware');

const router = express.Router();

// All routes require authentication
router.use(isAuthenticated);

// Dashboard and special routes (must be before :id route)
router.get('/dashboard', taskController.getDashboard);
router.get('/due-soon', taskController.getDueSoon);
router.get('/overdue', taskController.getOverdue);

// Task CRUD
router.post(
  '/',
  sanitize,
  validate(taskValidation.create),
  taskController.create
);

router.get(
  '/',
  validate(taskValidation.getAll),
  taskController.getAll
);

router.get(
  '/:id',
  validate(taskValidation.getById),
  taskController.getById
);

router.put(
  '/:id',
  sanitize,
  validate(taskValidation.update),
  taskController.update
);

router.delete(
  '/:id',
  validate(taskValidation.getById),
  taskController.remove
);

module.exports = router;