const jwt = require('jsonwebtoken');
const ApiError = require('../src/utils/ApiError');
const ApiResponse = require('../src/utils/ApiResponse');
const catchAsync = require('../src/utils/catchAsync');
const uploadOnCloudinary = require('../src/utils/cloudinary');
const User = require('./../models/userModel');

exports.signup = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirm } = req.body;

  if ([name, email, password, passwordConfirm].some(e => e?.trim() === '')) {
    throw next(new ApiError('All field is required', 404));
  }
  const existedUser = await User.findOne({ email });
  if (existedUser) {
    throw next(new ApiError('User exists with this email', 404));
  }
  //   console.log(req.files);
  //   let photolocalpath
  //   if (req.files && Array.isArray(req.files.photo) && req.files.photo.length > 0) {
  //     photolocalpath = req.files.photo[0].path
  // }
  // const photo = await uploadOnCloudinary(photolocalpath)

  const newUser = await User.create({
    name,
    email,
    // photo: photo?.secure_url || '',
    password,
    passwordConfirm
  });

  const createdUser = await User.findById(newUser._id).select(
    '-password -refreshToken -__v'
  );
  if (!createdUser) {
    throw next(
      new ApiError('Something went Wrong While registering the user', 500)
    );
  }
  const token = createdUser.generateAccessToken();
  res
    .status(201)
    .json({ success: true, message: '🙊Success🙊', token, createdUser });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if ([email, password].some(e => e?.trim() === '')) {
    throw next(new ApiError('All field is required', 404));
  }

  const existedUser = await User.findOne({ email }).select('+password');
  if (!existedUser) {
    throw next(new ApiError('no user exists with this email', 404));
  }
  const isCorrect = await existedUser.checkPassword(password);
  if (!isCorrect) {
    throw next(new ApiError('Enteried password is not correct', 401));
  }

  const token = existedUser.generateAccessToken();
  res.status(200).json({ success: true, message: '🙊Success🙊', token });
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) checking the token
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw next(
      new ApiError('You are not logged in !Please log in to access', 401)
    );
  }
  // 2) Validate the token
      jwt.verify(token,process.env.)
  // 3) check if the user exist
  // 4) check if user changed password after the jwt issued
  next();
});
