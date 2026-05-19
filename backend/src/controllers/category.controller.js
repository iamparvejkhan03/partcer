import Category from "../models/category.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { deleteFile, uploadImage } from "../utils/cloudinary.js";

/**
 * @desc    Create a new category
 * @route   POST /api/v1/admin/categories
 * @access  Private/Admin
 */
export const createCategory = asyncHandler(async (req, res) => {
  const { name, parentCategory, isActive, order } = req.body;

  // Validate required fields
  if (!name || name.trim() === "") {
    throw new ApiError(400, "Category name is required");
  }

  // Generate slug from name
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();

  // Check if category with same name exists
  const existingCategory = await Category.findOne({
    $or: [
      { name: { $regex: new RegExp(`^${name.trim()}$`, "i") } },
      { slug: slug },
    ],
  });

  if (existingCategory) {
    throw new ApiError(400, "Category with this name already exists");
  }

  // Handle image upload
  let imageData = null;
  if (req.file) {
    try {
      const result = await uploadImage(
        req.file.buffer,
        `categories/${Date.now()}`,
        "categories",
      );
      imageData = {
        url: result.secure_url,
        publicId: result.public_id,
        filename: req.file.originalname,
      };
    } catch (uploadError) {
      console.error("Image upload error:", uploadError);
      throw new ApiError(400, "Failed to upload image");
    }
  }

  // Create category
  const category = await Category.create({
    name: name.trim(),
    slug: slug,
    parentCategory: parentCategory || null,
    image: imageData,
    isActive: isActive === "true" || isActive === true,
    order: parseInt(order) || 0,
    createdBy: req.user?._id,
  });

  // Populate parent category for response
  await category.populate("parentCategory", "name");

  return res
    .status(201)
    .json(new ApiResponse(201, category, "Category created successfully"));
});

/**
 * @desc    Get all categories with filters
 * @route   GET /api/v1/admin/categories
 * @access  Private/Admin
 */
export const getAllCategories = asyncHandler(async (req, res) => {
  const {
    search,
    status,
    level,
    sortBy = "order",
    sortOrder = "asc",
  } = req.query;

  // Build filter
  const filter = {};

  if (search) {
    filter.$or = [{ name: { $regex: search, $options: "i" } }];
  }

  if (status === "active") {
    filter.isActive = true;
  } else if (status === "inactive") {
    filter.isActive = false;
  }

  if (level && level !== "all") {
    filter.level = parseInt(level);
  }

  // Build sort
  const sort = {};
  if (sortBy === "order") {
    sort.order = sortOrder === "desc" ? -1 : 1;
    sort.name = 1; // Secondary sort by name
  } else {
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;
  }

  // Get categories
  const categories = await Category.find(filter)
    .populate("parentCategory", "name")
    .sort(sort);

  return res
    .status(200)
    .json(new ApiResponse(200, categories, "Categories fetched successfully"));
});

/**
 * @desc    Get category by ID
 * @route   GET /api/v1/admin/categories/:id
 * @access  Private/Admin
 */
export const getCategoryById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const category = await Category.findById(id).populate(
    "parentCategory",
    "name",
  );

  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, category, "Category fetched successfully"));
});

/**
 * @desc    Update category
 * @route   PUT /api/v1/admin/categories/:id
 * @access  Private/Admin
 */
export const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    name,
    parentCategory,
    isActive,
    order,
    removeImage = false,
  } = req.body;

  // Find category
  const category = await Category.findById(id);
  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  // Check if name is being changed and if it already exists
  if (name && name.trim() !== category.name) {
    // Generate new slug
    const newSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();

    const existingCategory = await Category.findOne({
      $or: [
        { name: { $regex: new RegExp(`^${name.trim()}$`, "i") } },
        { slug: newSlug },
      ],
      _id: { $ne: id },
    });

    if (existingCategory) {
      throw new ApiError(400, "Category with this name already exists");
    }

    category.name = name.trim();
    category.slug = newSlug; // Update slug when name changes
  }

  // Handle parent category change
  if (parentCategory !== undefined) {
    if (parentCategory) {
      if (parentCategory === id) {
        throw new ApiError(400, "Category cannot be its own parent");
      }

      const parent = await Category.findById(parentCategory);
      if (!parent) {
        throw new ApiError(400, "Parent category not found");
      }

      if (parent.level === 1) {
        throw new ApiError(
          400,
          "Cannot create subcategory under another subcategory",
        );
      }
    }
    category.parentCategory = parentCategory || null;
  }

  // Handle image removal
  if (removeImage === "true" || removeImage === true) {
    if (category.image && category.image.publicId) {
      await deleteFile(category.image.publicId, "image");
    }
    category.image = null;
  }

  // Handle new image upload
  if (req.file) {
    try {
      // Delete old image if exists
      if (category.image && category.image.publicId) {
        await deleteFile(category.image.publicId, "image");
      }

      const result = await uploadImage(
        req.file.buffer,
        `categories/${Date.now()}`,
        "categories",
      );
      category.image = {
        url: result.secure_url,
        publicId: result.public_id,
        filename: req.file.originalname,
      };
    } catch (uploadError) {
      console.error("Image upload error:", uploadError);
      throw new ApiError(400, "Failed to upload image");
    }
  }

  // Update other fields
  if (isActive !== undefined) {
    category.isActive = isActive === "true" || isActive === true;
  }
  if (order !== undefined) {
    category.order = parseInt(order) || 0;
  }

  await category.save();
  await category.populate("parentCategory", "name");

  return res
    .status(200)
    .json(new ApiResponse(200, category, "Category updated successfully"));
});

/**
 * @desc    Delete category
 * @route   DELETE /api/v1/admin/categories/:id
 * @access  Private/Admin
 */
export const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const category = await Category.findById(id);
  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  // Check if category has subcategories
  const subcategories = await Category.countDocuments({ parentCategory: id });
  if (subcategories > 0) {
    throw new ApiError(
      400,
      "Cannot delete category with subcategories. Please delete or reassign subcategories first.",
    );
  }

  // Check if category has services
  if (category.freelancerCount > 0 || category.serviceCount > 0) {
    throw new ApiError(
      400,
      `Cannot delete category. There are ${category.freelancerCount} freelancers and ${category.serviceCount} services in this category.`,
    );
  }

  // Delete image from Cloudinary
  if (category.image && category.image.publicId) {
    await deleteFile(category.image.publicId, "image");
  }

  // Delete category
  await category.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Category deleted successfully"));
});

/**
 * @desc    Toggle category status
 * @route   PATCH /api/v1/admin/categories/:id/toggle-status
 * @access  Private/Admin
 */
export const toggleCategoryStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const category = await Category.findById(id);
  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  category.isActive = !category.isActive;
  await category.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        category,
        `Category ${category.isActive ? "activated" : "deactivated"} successfully`,
      ),
    );
});

/**
 * @desc    Get parent categories (level 0)
 * @route   GET /api/v1/admin/categories/parents
 * @access  Private/Admin
 */
export const getParentCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ level: 0 })
    .select("name image order isActive")
    .sort({ order: 1, name: 1 });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        categories,
        "Parent categories fetched successfully",
      ),
    );
});

/**
 * @desc    Get subcategories by parent ID
 * @route   GET /api/v1/admin/categories/:parentId/subcategories
 * @access  Private/Admin
 */
export const getSubcategoriesByParent = asyncHandler(async (req, res) => {
  const { parentId } = req.params;

  const parent = await Category.findById(parentId);
  if (!parent) {
    throw new ApiError(404, "Parent category not found");
  }

  const subcategories = await Category.find({ parentCategory: parentId })
    .select("name image order isActive serviceCount freelancerCount")
    .sort({ order: 1, name: 1 });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        parent: {
          _id: parent._id,
          name: parent.name,
        },
        subcategories,
      },
      "Subcategories fetched successfully",
    ),
  );
});

/**
 * @desc    Get category tree (all categories in hierarchical structure)
 * @route   GET /api/v1/admin/categories/tree
 * @access  Private/Admin
 */
export const getCategoryTree = asyncHandler(async (req, res) => {
  const categories = await Category.find({})
    .populate("parentCategory", "name")
    .sort({ order: 1, name: 1 });

  // Build tree structure
  const categoryMap = {};
  const roots = [];

  categories.forEach((category) => {
    categoryMap[category._id] = {
      ...category.toObject(),
      children: [],
    };
  });

  categories.forEach((category) => {
    if (category.parentCategory) {
      const parentId = category.parentCategory._id || category.parentCategory;
      if (categoryMap[parentId]) {
        categoryMap[parentId].children.push(categoryMap[category._id]);
      }
    } else {
      roots.push(categoryMap[category._id]);
    }
  });

  return res
    .status(200)
    .json(new ApiResponse(200, roots, "Category tree fetched successfully"));
});

// =============================================
// PUBLIC ROUTES (No authentication required)
// =============================================

/**
 * @desc    Get all active parent categories for public
 * @route   GET /api/v1/categories/public/parents
 * @access  Public
 */
export const getPublicParentCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({
    level: 0,
    isActive: true,
  })
    .select("name slug image.url serviceCount freelancerCount order")
    .sort({ order: 1, name: 1 });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        categories,
        "Parent categories fetched successfully",
      ),
    );
});

/**
 * @desc    Get subcategories by parent slug for public
 * @route   GET /api/v1/categories/public/:parentSlug/children
 * @access  Public
 */
export const getPublicSubcategories = asyncHandler(async (req, res) => {
  const { parentSlug } = req.params;

  const parent = await Category.findOne({
    slug: parentSlug,
    isActive: true,
  });

  if (!parent) {
    throw new ApiError(404, "Parent category not found");
  }

  const subcategories = await Category.find({
    parentCategory: parent._id,
    isActive: true,
  })
    .select("name slug image.url order")
    .sort({ order: 1, name: 1 });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        parent: {
          _id: parent._id,
          name: parent.name,
          slug: parent.slug,
        },
        subcategories,
      },
      "Subcategories fetched successfully",
    ),
  );
});

/**
 * @desc    Get category by slug for public
 * @route   GET /api/v1/categories/public/by-slug/:slug
 * @access  Public
 */
export const getPublicCategoryBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const category = await Category.findOne({
    slug,
    isActive: true,
  }).populate("parentCategory", "name slug");

  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, category, "Category fetched successfully"));
});

/**
 * @desc    Get category by ID for public
 * @route   GET /api/v1/categories/public/:id
 * @access  Public
 */
export const getPublicCategoryById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const category = await Category.findById(id)
    .select("name slug description image")
    .where("isActive")
    .equals(true);

  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, category, "Category fetched successfully"));
});

/**
 * @desc    Get subcategories by parent ID for public
 * @route   GET /api/v1/categories/public/:parentId/subcategories
 * @access  Public
 */
// In your category.controller.js
export const getPublicSubcategoriesByParentId = asyncHandler(
  async (req, res) => {
    const { parentId } = req.params;

    // Find parent category to verify it exists and is active
    const parent = await Category.findOne({
      _id: parentId,
      isActive: true,
      level: 0, // Ensure it's a parent category
    });

    if (!parent) {
      throw new ApiError(404, "Parent category not found");
    }

    // Find all active subcategories under this parent
    const subcategories = await Category.find({
      parentCategory: parentId,
      isActive: true,
      level: 1,
    })
      .select("name slug image.url order description")
      .sort({ order: 1, name: 1 });

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          parent: {
            _id: parent._id,
            name: parent.name,
            slug: parent.slug,
          },
          subcategories,
        },
        "Subcategories fetched successfully",
      ),
    );
  },
);
