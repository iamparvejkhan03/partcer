// models/category.model.js
import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    level: {
      type: Number,
      default: 0, // 0: parent, 1: subcategory
      min: 0,
      max: 1,
    },
    image: {
      url: String,
      publicId: String,
      filename: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    serviceCount: {
      type: Number,
      default: 0,
    },
    freelancerCount: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

// Generate slug from name before saving
categorySchema.pre("save", function (next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  }
  next();
});

// Set level based on parentCategory
categorySchema.pre("save", async function (next) {
  if (this.parentCategory) {
    const parent = await this.model("Category").findById(this.parentCategory);
    if (parent) {
      if (parent.level === 0) {
        this.level = 1; // Subcategory
      } else {
        throw new Error(
          "Cannot create subcategory under another subcategory. Maximum 2 levels allowed.",
        );
      }
    }
  } else {
    this.level = 0; // Parent category
  }
  next();
});

// Get child categories
categorySchema.methods.getChildren = async function () {
  return await this.model("Category")
    .find({ parentCategory: this._id })
    .sort({ order: 1, name: 1 });
};

// Get all parent categories (level 0)
categorySchema.statics.getParentCategories = function () {
  return this.find({ level: 0 }).sort({ order: 1, name: 1 });
};

// Get subcategories by parent ID
categorySchema.statics.getSubcategories = function (parentId) {
  return this.find({ parentCategory: parentId }).sort({ order: 1, name: 1 });
};

// Update service count
categorySchema.methods.updateServiceCount = async function () {
  const Service = mongoose.model("Service");
  const count = await Service.countDocuments({
    category: this._id,
    status: "active",
  });
  this.serviceCount = count;
  return this.save();
};

// Update freelancer count
categorySchema.methods.updateFreelancerCount = async function () {
  const Freelancer = mongoose.model("User");
  const count = await Freelancer.countDocuments({
    category: this._id,
    status: "active",
  });
  this.freelancerCount = count;
  return this.save();
};

// Indexes for better performance
categorySchema.index({ parentCategory: 1 });
categorySchema.index({ level: 1 });
categorySchema.index({ isActive: 1 });
categorySchema.index({ order: 1 });
// categorySchema.index({ slug: 1 });

const Category = mongoose.model("Category", categorySchema);
export default Category;
