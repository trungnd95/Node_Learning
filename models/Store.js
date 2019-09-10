const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
const slug = require("slugs");

const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: "Please enter a store name"
  },
  slug: String,
  description: {
    type: String,
    trim: true
  },
  tags: [String],
  created: {
    type: Date,
    default: Date.now
  },
  location: {
    type: {
      type: String,
      default: "Point"
    },
    coordinates: [{
      type: Number,
      required: "You must supply coordinates"
    }],
    address: {
      type: String,
      required: "You must supply an address"
    }
  },
  photo: String,
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: 'Your must supply the author'
  }
}, {
  toJSON: {
    virtuals: true
  },
  toObject: {
    virtuals: true
  }
});

//--- Define indexes
storeSchema.indexes({
  name: 'text',
  description: 'text'
})

storeSchema.index({
  location: "2dsphere"
})

storeSchema.pre("save", async function (next) {
  if (!this.isModified("name")) {
    next();
    return;
  }
  this.slug = slug(this.name);

  const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, "i");
  const storeWithSlug = await this.constructor.find({
    slug: slugRegEx
  });
  if (storeWithSlug.length) {
    this.slug = `${this.slug}-${storeWithSlug.length + 1}`;
  }
  next();
});

storeSchema.statics.getTagsList = function () {
  return this.aggregate([{
      $unwind: "$tags"
    },
    {
      $group: {
        _id: "$tags",
        count: {
          $sum: 1
        }
      }
    },
    {
      $sort: {
        count: -1
      }
    }
  ]);
};

storeSchema.statics.getTopStores = function () {
  return this.aggregate([
    //--- Look up stores and populate reviews
    {
      $lookup: {
        from: "reviews",
        localField: "_id",
        foreignField: "store",
        as: "reviews"
      }
    },
    //--- Filter for only items that have 2 or more reviews => reviews.1 mean that second review in list review must to exist
    {
      $match: {
        'reviews.1': {
          $exists: true
        }
      }
    },
    //--- Add the average review field
    {
      $addFields: {
        averageRating: {
          $avg: '$reviews.rating'
        }
      }
    },

    //--- Sorting it by our new field, highest reviews first
    {
      $sort: {
        averageRating: -1
      }
    },
    //--- Limit to at most 10
    {
      $limit: 10
    }
  ])
}
//find reviews where store._id === review.store
storeSchema.virtual('reviews', {
  ref: 'Review', // Which model to link ?
  localField: '_id', // which field on the store?
  foreignField: 'store' // which field on the review?
})

function autopopulate(next) {
  this.populate('reviews');
  next();
}

storeSchema.pre("find", autopopulate);
storeSchema.pre("findOne", autopopulate);

module.exports = mongoose.model("Store", storeSchema);