const mongoose = require('mongoose');
const slugify = require('slugify');
const tourSchema = new mongoose.Schema(
  {
    //fat model and thin controller
    name: {
      type: String,
      required: [true, 'A tour must have name'],
      unique: true,
      trim: true, //remove start and end spaces
      maxlength: [40, 'The name is too long'],
      minlength: [10, 'Name is too short'],
      //  validate: [validator.isAlpha,'Tour must contain only character'], //custom library validator
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have maxGroupSize'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'The difficulty should be easy medium and difficult',
      },
    },

    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0 '],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          //this only points to currect document on NEW document creation
          return val < this.price;
        },
        message: 'Discount price should be less than actual price',
        // we can access the price using ({VALUE}) variable in message
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have Summary'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      //GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      //Embedded documment
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      //referencing
      { type: mongoose.Schema.ObjectId, ref: 'User' },
    ],
  },
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

//tourSchema.index({ price: 1 }); //1 sorting index in ascending
//-1 for decesending order
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});
//Virtual populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour', //same as foreign key
  localField: '_id',
});

//Document Middleware before .save() and .create()
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});
tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v',
  });
  next();
});
// tourSchema.pre('save', async function (next) {
//   const guidesPromise = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromise);
//   next();
// });
// tourSchema.pre('save', function (next) {
//   console.log('Will save this document');
//   next();
// });
// tourSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// });

//Query Middleware
// tourSchema.pre('find', function (next) {//this function is nott used by findone method
//   this.find({ secretTour: { $ne: true } });
//   next();
// });

tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  //this.start = Date.now();
  next();
});

// tourSchema.post(/^find/, function (docs, next) {
//   console.log(`Query took ${Date.now() - this.start}ms`);
//   console.log(docs);
//   next();
// });
//Aggregation middleware
// tourSchema.pre('aggregate', function (next) {
//   //pipe line has the stages which are defined in the controllers
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } }); //unshift will add the stage at the start of array
//   next();
// });

const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
