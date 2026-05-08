import mongoose, { Schema } from "mongoose";

const packageSchema = new Schema({
  title: {
    type: String,
    required: [true, "Package title is required"],
    trim: true,
  },
  description: {
    type: String,
    required: [true, "Package description is required"],
    trim: true,
  },
  price: {
    type: Number,
    required: [true, "Package price is required"],
    min: [0, "Price cannot be negative"],
  },
  deliveryTime: {
    type: Number,
    required: [true, "Delivery time is required"],
    min: [1, "Delivery time must be at least 1 day"],
  },
  revisions: {
    type: Number,
    default: 0, // 0 means unlimited
    min: 0,
  },
  features: [
    {
      type: String,
      trim: true,
    },
  ],
  isFeatured: {
    type: Boolean,
    default: false,
  },
});

const extraOfferSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  deliveryTime: {
    type: Number,
    min: 1,
  },
});

const faqSchema = new Schema({
  question: {
    type: String,
    required: true,
    trim: true,
  },
  answer: {
    type: String,
    required: true,
    trim: true,
  },
});

const galleryImageSchema = new Schema({
  url: {
    type: String,
    required: true,
  },
  publicId: {
    type: String,
    required: true,
  },
  isMain: {
    type: Boolean,
    default: false,
  },
});

const serviceSchema = new Schema(
  {
    // ==================== BASIC INFORMATION ====================
    title: {
      type: String,
      required: [true, "Service title is required"],
      trim: true,
      minlength: [10, "Title must be at least 10 characters"],
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Service description is required"],
    },

    // Category & Subcategory
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },

    // Location
    location: {
      type: String,
      // enum: ["remote", "us", "uk", "ca", "au", "in", "eu", ""],
      default: "remote",
    },

    // ==================== SELLER INFORMATION ====================
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ==================== MEDIA ====================
    gallery: [galleryImageSchema],
    videoLink: {
      type: String,
      validate: {
        validator: function (v) {
          if (!v) return true;
          // YouTube URL validation
          return /^(https?\:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/.test(
            v,
          );
        },
        message: "Please enter a valid YouTube URL",
      },
    },

    // ==================== PRICING & PACKAGES ====================
    packages: {
      type: [packageSchema],
      validate: {
        validator: function (packages) {
          return packages.length >= 1;
        },
        message: "At least one package is required",
      },
    },

    // ==================== EXTRA OFFERS ====================
    extraOffers: [extraOfferSchema],

    // ==================== REQUIREMENTS & FAQ ====================
    requirements: {
      type: String,
      trim: true,
    },
    faqs: [faqSchema],

    // ==================== TAGS & SEO ====================
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    metaTitle: {
      type: String,
      trim: true,
    },
    metaDescription: {
      type: String,
      trim: true,
    },

    // ==================== STATUS & PUBLISHING ====================
    status: {
      type: String,
      enum: ["draft", "published", "paused", "archived", "pending"],
      default: "published",
    },
    publishedAt: {
      type: Date,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    featuredUntil: {
      type: Date,
    },

    // ==================== STATISTICS & ANALYTICS ====================
    views: {
      type: Number,
      default: 0,
    },
    uniqueViews: {
      type: Number,
      default: 0,
    },
    totalSales: {
      type: Number,
      default: 0,
    },
    totalOrders: {
      type: Number,
      default: 0,
    },
    totalRevenue: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    saves: {
      type: Number,
      default: 0,
    },
    shares: {
      type: Number,
      default: 0,
    },
    clicks: {
      type: Number,
      default: 0,
    },
    impressions: {
      type: Number,
      default: 0,
    },
    cancellationRate: {
      type: Number,
      default: 0,
    },

    // ==================== RATING DISTRIBUTION ====================
    ratingDistribution: {
      1: { type: Number, default: 0 },
      2: { type: Number, default: 0 },
      3: { type: Number, default: 0 },
      4: { type: Number, default: 0 },
      5: { type: Number, default: 0 },
    },

    // ==================== ORDERS QUEUE ====================
    ordersInQueue: {
      type: Number,
      default: 0,
    },

    // ==================== SEARCH OPTIMIZATION ====================
    searchKeywords: [
      {
        type: String,
        trim: true,
      },
    ],

    // ==================== TIMESTAMPS ====================
    lastOrderAt: {
      type: Date,
    },
    lastViewAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// ==================== INDEXES ====================
// serviceSchema.index({ slug: 1 });
serviceSchema.index({ seller: 1, status: 1 });
serviceSchema.index({ category: 1, status: 1 });
serviceSchema.index({ tags: 1 });
serviceSchema.index({
  title: "text",
  description: "text",
  tags: "text",
  "packages.title": "text",
  "packages.description": "text",
});
serviceSchema.index({ price: 1, rating: -1, totalSales: -1 });
serviceSchema.index({ status: 1, publishedAt: -1 });
serviceSchema.index({ featured: 1, featuredUntil: 1 });

// ==================== MIDDLEWARE ====================

// Generate slug before saving
serviceSchema.pre("save", function (next) {
  if (this.isModified("title")) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  // Set publishedAt when status changes to published
  if (
    this.isModified("status") &&
    this.status === "published" &&
    !this.publishedAt
  ) {
    this.publishedAt = new Date();
  }

  // Ensure only one featured package
  if (this.packages && this.packages.length > 0) {
    const featuredCount = this.packages.filter((p) => p.isFeatured).length;
    if (featuredCount > 1) {
      // Automatically fix by keeping only the first featured
      let foundFeatured = false;
      this.packages.forEach((pkg) => {
        if (pkg.isFeatured && !foundFeatured) {
          foundFeatured = true;
        } else if (pkg.isFeatured) {
          pkg.isFeatured = false;
        }
      });
    }
  }

  // Generate search keywords from tags and title
  if (this.isModified("tags") || this.isModified("title")) {
    this.searchKeywords = [
      ...new Set([
        ...this.tags.map((tag) => tag.toLowerCase()),
        ...this.title
          .toLowerCase()
          .split(" ")
          .filter((word) => word.length > 2),
      ]),
    ];
  }

  next();
});

// ==================== VIRTUAL PROPERTIES ====================

// Get main image
serviceSchema.virtual("mainImage").get(function () {
  // Check if gallery exists and is an array with items
  if (!this.gallery || !Array.isArray(this.gallery) || this.gallery.length === 0) {
    return null;
  }
  
  const mainImage = this.gallery.find((img) => img && img.isMain === true);
  return mainImage ? mainImage.url : this.gallery[0]?.url || null;
});

// Get average response time (can be calculated from orders)
serviceSchema.virtual("avgResponseTime").get(function () {
  // This would be calculated from actual orders
  return null;
});

// Get completion rate (can be calculated from orders)
serviceSchema.virtual("completionRate").get(function () {
  // This would be calculated from actual orders
  return null;
});

// ==================== INSTANCE METHODS ====================

// Update rating when new review is added
serviceSchema.methods.updateRating = function (newRating) {
  const oldTotal = this.reviewCount * this.rating;
  this.reviewCount += 1;
  this.rating = (oldTotal + newRating) / this.reviewCount;

  // Update distribution
  this.ratingDistribution[Math.floor(newRating)] += 1;

  return this.save();
};

// Increment view count
serviceSchema.methods.incrementViews = function (unique = false) {
  this.views += 1;
  if (unique) this.uniqueViews += 1;
  this.lastViewAt = new Date();
  return this.save();
};

// Increment saves
serviceSchema.methods.incrementSaves = function () {
  this.saves += 1;
  return this.save();
};

// Decrement saves
serviceSchema.methods.decrementSaves = function () {
  if (this.saves > 0) this.saves -= 1;
  return this.save();
};

// Increment shares
serviceSchema.methods.incrementShares = function () {
  this.shares += 1;
  return this.save();
};

// Record order completion
serviceSchema.methods.recordOrder = function (amount) {
  this.totalOrders += 1;
  this.totalSales += 1;
  this.totalRevenue += amount;
  this.lastOrderAt = new Date();

  // Decrement orders in queue if this was in queue
  if (this.ordersInQueue > 0) {
    this.ordersInQueue -= 1;
  }

  return this.save();
};

// Add to queue
serviceSchema.methods.addToQueue = function () {
  this.ordersInQueue += 1;
  return this.save();
};

// Remove from queue
serviceSchema.methods.removeFromQueue = function () {
  if (this.ordersInQueue > 0) {
    this.ordersInQueue -= 1;
  }
  return this.save();
};

// Check if service is available
serviceSchema.methods.isAvailable = function () {
  return this.status === "published" && this.seller?.isActive !== false;
};

// Get package by title or index
serviceSchema.methods.getPackage = function (packageIdentifier) {
  if (typeof packageIdentifier === "number") {
    return this.packages[packageIdentifier];
  }
  return this.packages.find(
    (p) => p.title.toLowerCase() === packageIdentifier.toLowerCase(),
  );
};

// ==================== STATIC METHODS ====================

// Find similar services
serviceSchema.statics.findSimilar = function (serviceId, limit = 4) {
  return this.aggregate([
    { $match: { _id: { $ne: serviceId }, status: "published" } },
    { $sample: { size: limit } },
    {
      $lookup: {
        from: "users",
        localField: "seller",
        foreignField: "_id",
        as: "seller",
      },
    },
    { $unwind: "$seller" },
    {
      $project: {
        title: 1,
        slug: 1,
        description: 1,
        price: 1,
        packages: 1,
        gallery: 1,
        rating: 1,
        reviewCount: 1,
        totalSales: 1,
        location: 1,
        tags: 1,
        createdAt: 1,
        "seller._id": 1,
        "seller.firstName": 1,
        "seller.lastName": 1,
        "seller.displayName": 1,
        "seller.profileImage": 1,
        "seller.country": 1,
        "seller.isVerified": 1,
        "seller.tagline": 1,
      },
    },
  ]);
};

// Get featured services
serviceSchema.statics.getFeatured = function (limit = 6) {
  const now = new Date();
  return this.find({
    featured: true,
    featuredUntil: { $gt: now },
    status: "published",
  })
    .sort({ rating: -1, totalSales: -1 })
    .limit(limit)
    .populate("seller", "firstName lastName displayName profileImage");
};

// Get top rated services
serviceSchema.statics.getTopRated = function (limit = 6) {
  return this.find({ status: "published", reviewCount: { $gt: 0 } })
    .sort({ rating: -1, reviewCount: -1 })
    .limit(limit)
    .populate("seller", "firstName lastName displayName profileImage");
};

// Get trending services (most views in last 7 days)
serviceSchema.statics.getTrending = function (limit = 6) {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  return this.find({
    status: "published",
    lastViewAt: { $gte: sevenDaysAgo },
  })
    .sort({ views: -1 })
    .limit(limit)
    .populate("seller", "firstName lastName displayName profileImage");
};

const Service = mongoose.model("Service", serviceSchema);

export default Service;