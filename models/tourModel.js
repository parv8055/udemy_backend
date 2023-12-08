const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      maxlength: [40, 'A tours name must have less than 40 characters'],
      minlength: [10, 'A tours name must have more than 10 characters']
      // validate: [validator.isAlpha, 'Tour name must only contain character']
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size']
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, difficult'
      }
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1'],
      max: [5, 'Rating must be below 5']
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price']
    },
    priceDiscount: {
      type: Number,
      //CUSTOM VALIDATORS
      //this will not work on update method
      validate: {
        validator: function(val) {
          return val < this.price;
        },
        message: 'discout price ({VALUE}) should be below the regular price'
      }
    },
    summary: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description']
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image']
    },
    images: [String],
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false
    }
  },
  //enabling the virtual properties to show
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

//create a viratural property that we create when fetch
tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7;
});

//only activated when .save() and .create() not on .insertMany()
// tourSchema.pre('save', function(next) {
//   this.slug = slugify(this.name, { lower: true });
//   next();
// });
// tourSchema.pre('save', function(next) {
//   console.log('will save document');
//   next();
// });
// tourSchema.post('save', function(doc, next) {
//   console.log(doc);
//   next();
// });

//work for all the string starts with find
//we can also set new variables to pass data like start here
tourSchema.pre(/^find/, function(next) {
  // tourSchema.pre('find', function(next) {
  this.find({ secretTour: { $ne: true } });
  // this.start = Date.now();
  next();
});

//we can use variables like start here from the pre
// tourSchema.post(/^find/, function(docs, next) {
//   // tourSchema.pre('find', function(next) {
//   console.log(Date.now() - this.start);
//   next();
// });

//AGGREGSTION MIDDLEWARE
//hide the secet tour from the aggrigation
tourSchema.pre('aggregate', function(next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
