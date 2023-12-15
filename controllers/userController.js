const User = require('../models/userModel');
const ApiResponse = require('../src/utils/ApiResponse');
const catchAsync = require('../src/utils/catchAsync');

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json(new ApiResponse(200, users));
});
exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};
exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};
exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};
exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};  

exports.updateMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id)
  if (!user) {
    throw next(new ApiError('no user exists', 404));
  }
  user.name = req.body.name;
  user.email = req.body.email;
  await user.save({validateBeforeSave: false });
  res.status(200).json({ success: true, message: '🙊Success🙊' });
})
exports.deleteMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id)
  if (!user) {
    throw next(new ApiError('no user exists', 404));
  }
  user.isActive = false;
  await user.save({validateBeforeSave: false });
  res.status(200).json({ success: true, message: '🙊Success🙊' });
})
