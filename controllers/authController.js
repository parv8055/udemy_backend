const jwt = require('jsonwebtoken');
const ApiError = require('../src/utils/ApiError');
const ApiResponse = require('../src/utils/ApiResponse');
const catchAsync = require('../src/utils/catchAsync');
const uploadOnCloudinary = require('../src/utils/cloudinary');
const User = require('./../models/userModel');

const responseCookies = (user, statusCode, res) => {
  const token = user.generateAccessToken();
  const cookieOptions = {
    expires: new Date(
      //90 days from now
      Date.now() + process.env.JWT_TOKEN_COOKIE_EXPIRY * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('token', token, cookieOptions);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    success: true,
    message: '🙊Success🙊',
    token,
    user
  });
};

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
  responseCookies(createdUser, 201, res);
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

//authorisation
exports.protect = catchAsync(async (req, res, next) => {
  // 1) checking the token
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw next(
      new ApiError('You are not logged in !Please log in to access', 401)
    );
  }
  // 2) Validate the token
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (err) {
    throw next(new ApiError('Token is not valid', 401));
  }
  // 3) check if the user exist
  const existedUser = await User.findById(decodedToken?._id);
  if (!existedUser) {
    throw next(new ApiError('no user exists with this email', 404));
  }
  // 4) check if user changed password after the jwt issued
  if (existedUser.checkPasswordIsChanged(decodedToken?.iat)) {
    throw next(
      new ApiError('User recently changed password!please login again', 404)
    );
  }
  req.user = existedUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    console.log(req.user.role);
    if (!roles.includes(req.user.role)) {
      throw next(
        new ApiError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};

exports.forgotpassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    throw next(new ApiError('no user exists with this email', 404));
  }
  const resetToken = user.createPasswordResetToken();
  //deactivate validators for saving
  user.save({ validateBeforeSave: false });
  //link to be send to the mail
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/vi/users/resetpassword/${resetToken}`;
  res.status(201).json(new ApiResponse(201, resetToken));
});
exports.resetpassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({
    passwordResetToken: req.params.token,
    passwordResetExpires: { $gt: Date.now() }
  });
  if (!user) {
    throw next(new ApiError('Token is invalid or has expired', 404));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.save();
  const token = user.generateAccessToken();
  res.status(200).json({ success: true, message: '🙊Success🙊', token });
});
exports.updatepassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).select('+password');
  if (!user) {
    throw next(new ApiError('no user exists', 404));
  }
  const isCorrect = await user.checkPassword(req.body.currentPassword);
  if (!isCorrect) {
    throw next(new ApiError('current password is not correct', 404));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  const token = user.generateAccessToken();
  res.status(200).json({ success: true, message: '🙊Success🙊', token });
});
