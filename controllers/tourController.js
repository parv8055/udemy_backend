const Tour = require('../models/tourModel');
const ApiError = require('../src/utils/ApiError');
const ApiResponse = require('../src/utils/ApiResponse');
const APIFeatures = require('../src/utils/apiFeatures');

exports.aliasTopTours = async (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingAverage,price';
  req.query.fields = 'name,price,ratingAverage,summary,dfficulty';
  next();
};
exports.getAllTours = async (req, res) => {
  try {
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const tours = await features.query;
    res.status(201).json(new ApiResponse(201, tours));
  } catch (err) {
    res.status(400).json(new ApiError(404, err));
  }
};

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    res.status(201).json(new ApiResponse(201, tour));
  } catch (err) {
    res.status(400).json(new ApiError(404, err));
  }
};
exports.getTourStats = async (req, res) => {
  try {
    const stats = await Tour.aggregate([
      // filter the data that has rating greter than 4.5
      {
        $match: { ratingsAverage: { $gte: 4.5 } }
      },
      //from the filterd data group the data by
      // difficulty and should show the following
      {
        $group: {
          _id: '$difficulty',
          numTours: { $sum: 1 },
          numRatings: { $sum: '$ratingsQuantity' },
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' }
        }
      },
      // sort by the feilds that we have given above
      // and sort by acc(1) or dec(-1)
      {
        $sort: {
          avgRating: 1
        }
      },
      {
        $match: { _id: { $ne: 'easy' } }
      }
    ]);

    res.status(200).json(new ApiResponse(201, stats));
  } catch (err) {
    res.status(400).json(new ApiError(404, err));
  }
};
exports.getMonthlyPlan = async (req, res) => {
  try {
    const year = +req.params.year;
    const plan = await Tour.aggregate([
      //unwind destructs the start dates array
      {
        $unwind: '$startDates'
      },
      // filter the data that has rating greter than 4.5
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`)
          }
        }
      },
      //from the filterd data group the data by
      // difficulty and should show the following
      {
        $group: {
          _id: { $month: '$startDates' },
          numTours: { $sum: 1 },
          tours: { $push: '$name' }
        }
      },
      // sort by the feilds that we have given above
      // and sort by acc(1) or dec(-1)
      {
        $sort: {
          _id: 1
        }
      },
      //helps to add feilds to the filtered group
      {
        $addFields: {
          month: '$_id'
        }
      },
      //helps to remove the feild from the filtered proup
      {
        $project: {
          _id: 0
        }
      }
    ]);

    res.status(201).json(new ApiResponse(201, plan));
  } catch (err) {
    res.status(400).json(new ApiError(404, err));
  }
};

exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);
    res.status(201).json(new ApiResponse(201, newTour));
  } catch (err) {
    res.status(400).json(new ApiError(404, err));
  }
};

exports.updateTour = async (req, res) => {
  try {
    const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    res
      .status(201)
      .json(new ApiResponse(201, updatedTour, 'Tour updated successfully'));
  } catch (err) {
    res.status(400).json(new ApiError(404, err));
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    res
      .status(201)
      .json(new ApiResponse(201, null, 'Tour deleted successfully'));
  } catch (err) {
    res.status(404).json(new ApiError(404, err));
  }
};
