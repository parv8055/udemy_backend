const express = require('express');
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
const router = express.Router();
router.get(
  '/top-5-cheap',
  tourController.aliasTopTours,
  tourController.getAllTours
);
router.get('/tour-stats', tourController.getTourStats);
router.get('/monthly-plan/:year', tourController.getMonthlyPlan);

router.get('/', tourController.getAllTours);
router.get('/:id', tourController.getTour);

router.use(authController.protect, authController.restrictTo('admin', 'user'));
router.post('/', tourController.createTour);
router
  .route('/:id')
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
