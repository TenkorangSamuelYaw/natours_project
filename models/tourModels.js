import mongoose from 'mongoose';
import slugify from 'slugify'
const schemaOptions = {
  toJSON: { 
    virtuals: true,
    transform: (doc, ret) => {
      delete ret.id
      return ret
    }
  },
  toObject: { virtuals: true },
};
// Database schema or blueprint, describing the database, validation
const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name'],
    unique: true,
    trim: true,
    maxlength: [50, 'A tour must have 50 characters maximum']
  },
  duration: {
    type: Number,
    required: [true, 'A tour must have a duration'],
  },
  maxGroupSize: {
    type: Number,
    required: [true, 'A tour must have a group size'],
  },
  difficulty: {
    type: String,
    required: [true, 'A tour must have a difficulty level'],
    trim: true,
    enum: [
      {values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either easy, medium or difficult'
      }
    ]
  },
  ratingsAverage: {
    type: Number,
    default: 4.5,
    min: [1, 'Rating must be above 1.0'],
    max: [5, 'Rating must be below 5.0']
  },
  ratingsQuantity: {
    type: Number,
    default: 0,
  },
  price: {
    type: Number,
    required: [true, 'A tour must have a price'],
  },
  priceDiscount: {
    type: Number,
    validate: {
      validator: function(val) {
        // Returns true if priceDiscount is less than actual price, else it raises an error
        return val < this.price; // Why pass val, and we didn't use this.priceDiscount(Ask ChatGPT)
      }, 
      message: 'Discounted price {VALUE} should be less than actual price'
    }
  },
  summary: {
    type: String,
    trim: true,
    required: [true, 'A tour must have a description']
  },
  description: {
    type: String,
    trim: true
  },
  imageCover: {
    type: String,
    required: [true, 'A tour must have a cover image']
  },
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false // Don't return this as part of the query results
  },
  startDates: [Date],
  secretTour: {
    type: Boolean,
    default: false
  }
}, schemaOptions);

// NOTE Virtual properties added here, might be needful in AURA
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// NOTE Document middleware implemented here.
// Called before a document is saved to the database
tourSchema.pre('save', function(next) {
  this.slug = slugify(this.name, {lower: true}); // slugify converts the string passed to it as a url friendly string
  next();
});

/*
// Post hook or post document middleware here
tourSchema.post('save', function(doc, next) {
  console.log(doc);
  next();
});
*/
// NOTE QUERY MIDDLEWARE
// Hook used here is the find hook
// NOTE Using this pre find hook to exclude all secret tours from the results
// To make it work for findOne, findOneAndDelete,... use a regex
tourSchema.pre(/^find/, function(next) {
  this.find({ secretTour: { $ne: true } }); // return all tours where secretTour is false
  this.start = Date.now(); // Won't be persisted in the database
  next();
});

tourSchema.post(/^find/, function(docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds.`);
 // console.log(docs); // Logging all the documents returned in the post hook
  next();
});

// NOTE Aggregation Middleware used here
tourSchema.pre('aggregate', function(next) {
  // this.pipeline() returns an array containing all the aggregations we passed
  this.pipeline().unshift({$match: {secretTour: {$ne: true}}});
  next();
});
// Creating a model(table) from the schema
export const Tour = mongoose.model('Tour', tourSchema);