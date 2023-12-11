const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');
const upload = require('../src/middleware/multer.middleware');

const router = express.Router();

router.post(
  '/signup',
  upload.fields([
    {
      name: 'photo',
      maxCount: 1
    }
  ]),
  authController.signup
);

router.post('/login', authController.login);

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
