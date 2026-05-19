import Service from "../models/service.model.js";
import User from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  uploadImage,
  deleteFileByUrl,
  deleteMultipleFiles,
} from "../utils/cloudinary.js";
import mongoose from "mongoose";
import Category from "../models/category.model.js";

// ==================== HELPER FUNCTIONS ====================

const validatePackages = (packages) => {
  if (!packages || packages.length === 0) {
    throw new ApiError(400, "At least one package is required");
  }

  // Check for duplicate package titles
  const titles = packages.map((p) => p.title.toLowerCase());
  if (new Set(titles).size !== titles.length) {
    throw new ApiError(400, "Package titles must be unique");
  }

  // Validate each package
  packages.forEach((pkg, index) => {
    if (!pkg.title || !pkg.description || !pkg.price || !pkg.deliveryTime) {
      throw new ApiError(
        400,
        `Package ${index + 1} has missing required fields`,
      );
    }
    if (pkg.price < 0) {
      throw new ApiError(400, `Package ${index + 1} price cannot be negative`);
    }
    if (pkg.deliveryTime < 1) {
      throw new ApiError(
        400,
        `Package ${index + 1} delivery time must be at least 1 day`,
      );
    }
  });

  // Ensure only one featured package
  const featuredCount = packages.filter((p) => p.isFeatured).length;
  if (featuredCount > 1) {
    throw new ApiError(400, "Only one package can be featured");
  }
};

const validateTags = (tags) => {
  if (tags && tags.length > 5) {
    throw new ApiError(400, "Maximum 5 tags allowed");
  }
  return tags;
};

const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
};

// ==================== CREATE SERVICE ====================

const createService = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    category,
    subCategory,
    location,
    videoLink,
    tags,
    requirements,
    packages,
    extraOffers,
    faqs,
  } = JSON.parse(req.body.data || "{}");

  // Validation
  if (!title || !description || !category || !packages) {
    throw new ApiError(400, "Missing required fields");
  }

  // Validate packages
  validatePackages(packages);

  // Validate tags
  const validatedTags = validateTags(tags);

  // Check if slug is unique
  const slug = generateSlug(title);
  const existingService = await Service.findOne({ slug });
  if (existingService) {
    throw new ApiError(400, "A service with this title already exists");
  }

  // Handle gallery images
  const gallery = [];
  if (req.files && req.files.length > 0) {
    if (req.files.length > 10) {
      throw new ApiError(400, "Maximum 10 images allowed");
    }

    // Upload images to Cloudinary
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      try {
        const result = await uploadImage(
          file.buffer,
          `services/${slug}/image-${i}`,
        );
        gallery.push({
          url: result.secure_url,
          publicId: result.public_id,
          isMain: i === 0, // First image is main
        });
      } catch (error) {
        console.error("Error uploading image:", error);
        throw new ApiError(500, "Failed to upload images");
      }
    }
  }

  // Create service
  const service = await Service.create({
    title,
    slug,
    description,
    category,
    subCategory: subCategory || null,
    location: location || "remote",
    videoLink: videoLink || "",
    tags: validatedTags || [],
    requirements: requirements || "",
    packages,
    extraOffers: extraOffers || [],
    faqs: faqs || [],
    gallery,
    seller: req.user._id,
    status: "published",
  });

  // Populate seller info
  await service.populate(
    "seller",
    "firstName lastName displayName profileImage",
  );

  // After service creation
  Category.findByIdAndUpdate(service.category, {
    $inc: { serviceCount: 1 },
  }).catch((err) => console.error("Failed to update category count:", err));

  return res
    .status(201)
    .json(new ApiResponse(201, service, "Service created successfully"));
});

// ==================== GET SERVICES (with filters) ====================

const getServices = asyncHandler(async (req, res) => {
  const {
    category,
    subCategory,
    seller,
    minPrice,
    maxPrice,
    deliveryTime,
    location,
    tags,
    status = "published",
    search,
    sortBy = "createdAt",
    sortOrder = "desc",
    page = 1,
    limit = 10,
  } = req.query;

  const query = {};

  // Filter by status
  if (status) {
    query.status = status;
  }

  // Filter by category
  if (category) {
    query.category = category;
  }

  // Filter by subCategory
  if (subCategory) {
    query.subCategory = subCategory;
  }

  // Filter by seller
  if (seller) {
    query.seller = seller;
  }

  // Filter by location
  if (location) {
    query.location = location;
  }

  // Filter by tags
  if (tags) {
    const tagsArray = Array.isArray(tags) ? tags : tags.split(",");
    query.tags = { $in: tagsArray };
  }

  // Filter by price range (checking all packages)
  if (minPrice || maxPrice) {
    query["packages.price"] = {};
    if (minPrice) query["packages.price"].$gte = Number(minPrice);
    if (maxPrice) query["packages.price"].$lte = Number(maxPrice);
  }

  // Filter by delivery time
  if (deliveryTime) {
    query["packages.deliveryTime"] = { $lte: Number(deliveryTime) };
  }

  // Search by text
  if (search) {
    query.$text = { $search: search };
  }

  const skip = (Number(page) - 1) * Number(limit);
  const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

  const services = await Service.find(query)
    .populate(
      "seller",
      "firstName lastName displayName profileImage skills categories tagline",
    )
    .populate("category", "name slug")
    .populate("subCategory", "name slug")
    .sort(sort)
    .skip(skip)
    .limit(Number(limit));

  const total = await Service.countDocuments(query);

  // Get min and max price from all services (for filters)
  const priceStats = await Service.aggregate([
    { $match: { status: "published" } },
    { $unwind: "$packages" },
    {
      $group: {
        _id: null,
        minPrice: { $min: "$packages.price" },
        maxPrice: { $max: "$packages.price" },
      },
    },
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        services,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
        filters: {
          priceRange: priceStats[0] || { minPrice: 0, maxPrice: 0 },
        },
      },
      "Services fetched successfully",
    ),
  );
});

// ==================== GET SERVICE BY SLUG ====================

const getServiceBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const service = await Service.findOne({ slug })
    .populate(
      "seller",
      "firstName lastName displayName profileImage email phone country city createdAt lastLogin isVerified languages englishLevel bio freelancerType skills categories",
    )
    .populate("category", "name slug")
    .populate("subCategory", "name slug");

  if (!service) {
    throw new ApiError(404, "Service not found");
  }

  // Increment view count (if not the seller viewing)
  if (!req.user || req.user._id.toString() !== service.seller._id.toString()) {
    await service.incrementViews();
  }

  // Get similar services
  const similarServices = await Service.findSimilar(service._id);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        service,
        similar: similarServices,
      },
      "Service fetched successfully",
    ),
  );
});

const getServiceById = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;

  const service = await Service.findById(serviceId)
    .populate(
      "seller",
      "firstName lastName displayName profileImage email phone country city createdAt lastLogin isVerified languages englishLevel bio freelancerType skills categories reviewCount rating",
    )
    .populate("category", "name slug")
    .populate("subCategory", "name slug");

  if (!service) {
    throw new ApiError(404, "Service not found");
  }

  // Increment view count (if not the seller viewing)
  if (!req.user || req.user._id.toString() !== service.seller._id.toString()) {
    await service.incrementViews();
  }

  // Get similar services
  const similarServices = await Service.findSimilar(service._id);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        service,
        similar: similarServices,
      },
      "Service fetched successfully",
    ),
  );
});

// ==================== GET SELLER SERVICES ====================

const getSellerServices = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const sellerId = req.user._id;

  const query = { seller: sellerId };
  if (status) {
    query.status = status;
  }

  const services = await Service.find(query)
    .populate("category", "name")
    .populate("subCategory", "name")
    .sort({ createdAt: -1 });

  // Get stats
  const stats = await Service.aggregate([
    { $match: { seller: req.user._id, status: { $ne: "archived" } } },
    {
      $group: {
        _id: null,
        published: {
          $sum: {
            $cond: [{ $eq: ["$status", "published"] }, 1, 0],
          },
        },
        pending: {
          $sum: {
            $cond: [{ $eq: ["$status", "pending"] }, 1, 0],
          },
        },
        draft: {
          $sum: {
            $cond: [{ $eq: ["$status", "draft"] }, 1, 0],
          },
        },
        paused: {
          $sum: {
            $cond: [{ $eq: ["$status", "paused"] }, 1, 0],
          },
        },
        totalViews: { $sum: "$views" },
        totalClicks: { $sum: "$clicks" },
        totalOrders: { $sum: "$totalOrders" },
        totalRevenue: { $sum: "$totalRevenue" },
      },
    },
  ]);

  const statsObject = stats[0] || {
    published: 0,
    pending: 0,
    draft: 0,
    paused: 0,
    totalViews: 0,
    totalClicks: 0,
    totalOrders: 0,
    totalRevenue: 0,
  };

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        services,
        stats: statsObject,
      },
      "Seller services fetched successfully",
    ),
  );
});

// ==================== UPDATE SERVICE ====================

const updateService = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;
  const updates = JSON.parse(req.body.data || "{}");

  // Find service by slug instead of ID
  const service = await Service.findById(serviceId);

  if (!service) {
    throw new ApiError(404, "Service not found");
  }

  // Check ownership
  if (
    service.seller.toString() !== req.user._id.toString() &&
    req.user.userType !== "admin"
  ) {
    throw new ApiError(403, "You don't have permission to update this service");
  }

  // Validate packages if being updated
  if (updates.packages) {
    validatePackages(updates.packages);
  }

  // Validate tags if being updated
  if (updates.tags) {
    updates.tags = validateTags(updates.tags);
  }

  // Handle removed images (if sent from frontend)
  if (updates.removedImages && updates.removedImages.length > 0) {
    // Filter out removed images from gallery
    const remainingGallery = service.gallery.filter(
      (img) =>
        !updates.removedImages.includes(img.publicId) &&
        !updates.removedImages.includes(img._id?.toString()),
    );

    // Update gallery without removed images
    service.gallery = remainingGallery;
  }

  // Handle new gallery images
  if (req.files && req.files.length > 0) {
    const currentTotal = service.gallery.length;
    if (currentTotal + req.files.length > 10) {
      throw new ApiError(400, "Maximum 10 images allowed");
    }

    const newGallery = [...service.gallery];

    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      try {
        const result = await uploadImage(
          file.buffer,
          `services/${service.slug}/image-${Date.now()}`,
        );
        newGallery.push({
          url: result.secure_url,
          publicId: result.public_id,
          isMain: newGallery.length === 0, // First image becomes main if no images
        });
      } catch (error) {
        console.error("Error uploading image:", error);
        throw new ApiError(500, "Failed to upload images");
      }
    }

    updates.gallery = newGallery;
  }

  // Store old category before updating
  const oldCategoryId = service.category?.toString();

  // Update title and regenerate slug if title changed
  if (updates.title && updates.title !== service.title) {
    updates.slug = generateSlug(updates.title);

    // Check if new slug is unique
    const existingService = await Service.findOne({
      slug: updates.slug,
      _id: { $ne: service._id }, // Use service._id instead of serviceId
    });
    if (existingService) {
      throw new ApiError(400, "A service with this title already exists");
    }
  }

  // Remove removedImages from updates before applying (so it doesn't get saved to the document)
  delete updates.removedImages;

  // Update service
  Object.assign(service, updates);
  await service.save();

  await service.populate(
    "seller",
    "firstName lastName displayName profileImage",
  );

  // Check if category changed (compare old with new)
  if (updates.category && oldCategoryId !== updates.category.toString()) {
    // Decrement old category
    if (oldCategoryId) {
      Category.findByIdAndUpdate(oldCategoryId, {
        $inc: { serviceCount: -1 },
      }).catch((err) =>
        console.error("Failed to update old category count:", err),
      );
    }
    // Increment new category
    Category.findByIdAndUpdate(updates.category, {
      $inc: { serviceCount: 1 },
    }).catch((err) =>
      console.error("Failed to update new category count:", err),
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, service, "Service updated successfully"));
});

// ==================== DELETE SERVICE ====================

const deleteService = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;

  const service = await Service.findById(serviceId);

  if (!service) {
    throw new ApiError(404, "Service not found");
  }

  // Check ownership
  if (
    service.seller.toString() !== req.user._id.toString() &&
    req.user.userType !== "admin"
  ) {
    throw new ApiError(403, "You don't have permission to delete this service");
  }

  // Delete images from Cloudinary
  if (service.gallery && service.gallery.length > 0) {
    const publicIds = service.gallery.map((img) => img.publicId);
    try {
      await deleteMultipleFiles(publicIds);
    } catch (error) {
      console.error("Error deleting images:", error);
      // Continue even if image deletion fails
    }
  }

  // Soft delete by archiving
  service.status = "archived";
  await service.save();

  // After service deletion
  Category.findByIdAndUpdate(service.category, {
    $inc: { serviceCount: -1 },
  }).catch((err) => console.error("Failed to update category count:", err));

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Service deleted successfully"));
});

// ==================== TOGGLE SERVICE STATUS ====================

const toggleServiceStatus = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;
  const { status } = req.body;

  if (!["draft", "published", "paused"].includes(status)) {
    throw new ApiError(400, "Invalid status");
  }

  const service = await Service.findById(serviceId);

  if (!service) {
    throw new ApiError(404, "Service not found");
  }

  // Check ownership
  if (service.seller.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You don't have permission to update this service");
  }

  service.status = status;
  if (status === "published" && !service.publishedAt) {
    service.publishedAt = new Date();
  }
  await service.save();

  return res
    .status(200)
    .json(new ApiResponse(200, service, `Service ${status} successfully`));
});

// ==================== UPDATE GALLERY ====================

const updateGallery = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;
  const { images } = req.body; // Array of image URLs to keep

  const service = await Service.findById(serviceId);

  if (!service) {
    throw new ApiError(404, "Service not found");
  }

  // Check ownership
  if (service.seller.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You don't have permission to update this service");
  }

  // Find images to delete
  const imagesToDelete = service.gallery.filter(
    (img) => !images.includes(img.url),
  );

  // Delete from Cloudinary
  if (imagesToDelete.length > 0) {
    const publicIds = imagesToDelete.map((img) => img.publicId);
    try {
      await deleteMultipleFiles(publicIds);
    } catch (error) {
      console.error("Error deleting images:", error);
    }
  }

  // Update gallery
  service.gallery = service.gallery.filter((img) => images.includes(img.url));

  // Ensure at least one main image
  if (
    !service.gallery.some((img) => img.isMain) &&
    service.gallery.length > 0
  ) {
    service.gallery[0].isMain = true;
  }

  await service.save();

  return res
    .status(200)
    .json(
      new ApiResponse(200, service.gallery, "Gallery updated successfully"),
    );
});

// ==================== ADD REVIEW ====================

const addReview = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;
  const { rating, comment } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    throw new ApiError(400, "Rating must be between 1 and 5");
  }

  const service = await Service.findById(serviceId);

  if (!service) {
    throw new ApiError(404, "Service not found");
  }

  // Check if user has purchased this service (would need Order model)
  // For now, we'll allow any authenticated user to review

  await service.updateRating(rating);

  // Here you would also save the review in a separate Reviews collection
  // For now, we'll just update the rating

  return res
    .status(200)
    .json(new ApiResponse(200, { rating }, "Review added successfully"));
});

// ==================== INCREMENT VIEWS ====================

const incrementViews = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;
  const { unique } = req.query;

  const service = await Service.findById(serviceId);

  if (!service) {
    throw new ApiError(404, "Service not found");
  }

  await service.incrementViews(unique === "true");

  return res
    .status(200)
    .json(new ApiResponse(200, { views: service.views }, "Views incremented"));
});

// ==================== INCREMENT SAVES ====================

const incrementSaves = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;

  const service = await Service.findById(serviceId);

  if (!service) {
    throw new ApiError(404, "Service not found");
  }

  await service.incrementSaves();

  return res
    .status(200)
    .json(new ApiResponse(200, { saves: service.saves }, "Service saved"));
});

// ==================== DECREMENT SAVES ====================

const decrementSaves = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;

  const service = await Service.findById(serviceId);

  if (!service) {
    throw new ApiError(404, "Service not found");
  }

  await service.decrementSaves();

  return res
    .status(200)
    .json(new ApiResponse(200, { saves: service.saves }, "Service unsaved"));
});

// ==================== INCREMENT SHARES ====================

const incrementShares = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;

  const service = await Service.findById(serviceId);

  if (!service) {
    throw new ApiError(404, "Service not found");
  }

  await service.incrementShares();

  return res
    .status(200)
    .json(
      new ApiResponse(200, { shares: service.shares }, "Shares incremented"),
    );
});

// ==================== SEARCH SERVICES (advanced) ====================

const searchServices = asyncHandler(async (req, res) => {
  const {
    q,
    category,
    minPrice,
    maxPrice,
    deliveryTime,
    location,
    sellerLevel,
    rating,
    tags,
    sortBy = "relevance",
    page = 1,
    limit = 20,
  } = req.query;

  const pipeline = [];

  // Match stage
  const match = { status: "published" };

  // Text search
  if (q) {
    pipeline.push({
      $match: {
        $text: { $search: q },
      },
    });

    // Add text score for relevance sorting
    if (sortBy === "relevance") {
      pipeline.push({
        $addFields: {
          score: { $meta: "textScore" },
        },
      });
    }
  }

  // Category filter
  if (category) {
    match.category = mongoose.Types.ObjectId(category);
  }

  // Price range filter
  if (minPrice || maxPrice) {
    match["packages.price"] = {};
    if (minPrice) match["packages.price"].$gte = Number(minPrice);
    if (maxPrice) match["packages.price"].$lte = Number(maxPrice);
  }

  // Delivery time filter
  if (deliveryTime) {
    match["packages.deliveryTime"] = { $lte: Number(deliveryTime) };
  }

  // Location filter
  if (location) {
    match.location = location;
  }

  // Rating filter
  if (rating) {
    match.rating = { $gte: Number(rating) };
  }

  // Tags filter
  if (tags) {
    const tagsArray = Array.isArray(tags) ? tags : tags.split(",");
    match.tags = { $in: tagsArray };
  }

  pipeline.push({ $match: match });

  // Lookup seller info
  pipeline.push({
    $lookup: {
      from: "users",
      localField: "seller",
      foreignField: "_id",
      as: "sellerInfo",
    },
  });

  pipeline.push({
    $unwind: {
      path: "$sellerInfo",
      preserveNullAndEmptyArrays: true,
    },
  });

  // Filter by seller level if needed
  if (sellerLevel) {
    pipeline.push({
      $match: {
        "sellerInfo.freelancerType": sellerLevel,
      },
    });
  }

  // Sorting
  const sortStage = {};
  switch (sortBy) {
    case "price_asc":
      sortStage["packages.price"] = 1;
      break;
    case "price_desc":
      sortStage["packages.price"] = -1;
      break;
    case "rating_desc":
      sortStage.rating = -1;
      sortStage.reviewCount = -1;
      break;
    case "newest":
      sortStage.createdAt = -1;
      break;
    case "popular":
      sortStage.totalSales = -1;
      sortStage.views = -1;
      break;
    case "relevance":
      if (q) {
        sortStage.score = { $meta: "textScore" };
      } else {
        sortStage.createdAt = -1;
      }
      break;
    default:
      sortStage.createdAt = -1;
  }

  if (Object.keys(sortStage).length > 0) {
    pipeline.push({ $sort: sortStage });
  }

  // Pagination
  const skip = (Number(page) - 1) * Number(limit);
  pipeline.push({ $skip: skip });
  pipeline.push({ $limit: Number(limit) });

  // Project fields
  pipeline.push({
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
      deliveryTime: 1,
      location: 1,
      tags: 1,
      createdAt: 1,
      "sellerInfo._id": 1,
      "sellerInfo.firstName": 1,
      "sellerInfo.lastName": 1,
      "sellerInfo.displayName": 1,
      "sellerInfo.profileImage": 1,
      "sellerInfo.freelancerType": 1,
      score: { $meta: "textScore" },
    },
  });

  const services = await Service.aggregate(pipeline);

  // Get total count for pagination
  const countPipeline = [{ $match: match }, { $count: "total" }];
  const countResult = await Service.aggregate(countPipeline);
  const total = countResult[0]?.total || 0;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        services,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
      "Search results fetched successfully",
    ),
  );
});

// ==================== GET SERVICE STATS (for seller) ====================

const getServiceStats = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;

  const service = await Service.findById(serviceId);

  if (!service) {
    throw new ApiError(404, "Service not found");
  }

  // Check ownership
  if (
    service.seller.toString() !== req.user._id.toString() &&
    req.user.userType !== "admin"
  ) {
    throw new ApiError(403, "You don't have permission to view these stats");
  }

  // Get daily views for last 30 days (you would need a separate analytics collection for this)
  // For now, return basic stats

  const stats = {
    overview: {
      views: service.views,
      uniqueViews: service.uniqueViews,
      saves: service.saves,
      shares: service.shares,
      totalSales: service.totalSales,
      totalRevenue: service.totalRevenue,
      ordersInQueue: service.ordersInQueue,
      rating: service.rating,
      reviewCount: service.reviewCount,
    },
    ratingDistribution: service.ratingDistribution,
    lastOrderAt: service.lastOrderAt,
    lastViewAt: service.lastViewAt,
    publishedAt: service.publishedAt,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, stats, "Service stats fetched successfully"));
});

// ==================== ADMIN: GET ALL SERVICES ====================

const adminGetAllServices = asyncHandler(async (req, res) => {
  const {
    status,
    seller,
    category,
    search,
    page = 1,
    limit = 20,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  const query = {};

  if (status) query.status = status;
  if (seller) query.seller = seller;
  if (category) query.category = category;
  if (search) {
    query.$text = { $search: search };
  }

  const skip = (Number(page) - 1) * Number(limit);
  const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

  const services = await Service.find(query)
    .populate(
      "seller",
      "firstName lastName email userType displayName profileImage freelancerType createdAt",
    )
    .populate("category", "name")
    .populate("subCategory", "name")
    .sort(sort)
    .skip(skip)
    .limit(Number(limit));

  const total = await Service.countDocuments(query);

  // Get summary stats
  const stats = await Service.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        totalViews: { $sum: "$views" },
        totalSales: { $sum: "$totalSales" },
        totalRevenue: { $sum: "$totalRevenue" },
      },
    },
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        services,
        stats,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
      "All services fetched successfully",
    ),
  );
});

// ==================== ADMIN: UPDATE SERVICE STATUS ====================

const adminUpdateServiceStatus = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;
  const { status, featured, featuredUntil } = req.body;

  const service = await Service.findById(serviceId);

  if (!service) {
    throw new ApiError(404, "Service not found");
  }

  if (status) {
    if (!["draft", "published", "paused", "archived"].includes(status)) {
      throw new ApiError(400, "Invalid status");
    }
    service.status = status;

    if (status === "published" && !service.publishedAt) {
      service.publishedAt = new Date();
    }
  }

  if (featured !== undefined) {
    service.featured = featured;
    if (featured && featuredUntil) {
      service.featuredUntil = new Date(featuredUntil);
    } else if (!featured) {
      service.featuredUntil = null;
    }
  }

  await service.save();

  return res
    .status(200)
    .json(new ApiResponse(200, service, "Service status updated successfully"));
});

// ==================== ADMIN: DELETE SERVICE (hard delete) ====================

const adminDeleteService = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;

  const service = await Service.findById(serviceId);

  if (!service) {
    throw new ApiError(404, "Service not found");
  }

  // Delete images from Cloudinary
  if (service.gallery && service.gallery.length > 0) {
    const publicIds = service.gallery.map((img) => img.publicId);
    try {
      await deleteMultipleFiles(publicIds);
    } catch (error) {
      console.error("Error deleting images:", error);
    }
  }

  await Service.findByIdAndDelete(serviceId);

  // After service deletion
  Category.findByIdAndUpdate(service.category, {
    $inc: { serviceCount: -1 },
  }).catch((err) => console.error("Failed to update category count:", err));

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Service permanently deleted"));
});

// ==================== ADMIN: GET SERVICE FOR EDITING ====================

const adminGetServiceForEdit = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;

  const service = await Service.findById(serviceId)
    .populate(
      "seller",
      "firstName lastName displayName email profileImage freelancerType rating reviewCount totalSales totalRevenue createdAt location isVerified",
    )
    .populate("category", "name slug _id")
    .populate("subCategory", "name slug _id");

  if (!service) {
    throw new ApiError(404, "Service not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, service, "Service fetched successfully"));
});

// ==================== ADMIN: UPDATE SERVICE ====================

const adminUpdateService = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;
  const updates = JSON.parse(req.body.data || "{}");

  const service = await Service.findById(serviceId);

  if (!service) {
    throw new ApiError(404, "Service not found");
  }

  // Validate packages if being updated
  if (updates.packages) {
    validatePackages(updates.packages);
  }

  // Validate tags if being updated
  if (updates.tags) {
    updates.tags = validateTags(updates.tags);
  }

  // Handle removed images
  if (updates.removedImages && updates.removedImages.length > 0) {
    // Filter out removed images from gallery
    const remainingGallery = service.gallery.filter(
      (img) =>
        !updates.removedImages.includes(img._id?.toString()) &&
        !updates.removedImages.includes(img.publicId),
    );

    service.gallery = remainingGallery;

    // Delete images from Cloudinary (optional)
    // You can implement this if needed
  }

  // Handle new gallery images
  if (req.files && req.files.length > 0) {
    const currentTotal = service.gallery.length;
    if (currentTotal + req.files.length > 10) {
      throw new ApiError(400, "Maximum 10 images allowed");
    }

    const newGallery = [...service.gallery];

    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      try {
        const result = await uploadImage(
          file.buffer,
          `services/${service.slug}/image-${Date.now()}`,
        );
        newGallery.push({
          url: result.secure_url,
          publicId: result.public_id,
          isMain: newGallery.length === 0,
        });
      } catch (error) {
        console.error("Error uploading image:", error);
        throw new ApiError(500, "Failed to upload images");
      }
    }

    updates.gallery = newGallery;
  }

  // Store old category before updating
  const oldCategoryId = service.category?.toString();

  // Update title and regenerate slug if title changed
  if (updates.title && updates.title !== service.title) {
    updates.slug = generateSlug(updates.title);

    // Check if new slug is unique
    const existingService = await Service.findOne({
      slug: updates.slug,
      _id: { $ne: serviceId },
    });
    if (existingService) {
      throw new ApiError(400, "A service with this title already exists");
    }
  }

  // Remove temporary fields from updates
  delete updates.removedImages;
  delete updates.moderationNotes;

  // Update service
  Object.assign(service, updates);
  await service.save();

  await service.populate(
    "seller",
    "firstName lastName displayName profileImage",
  );

  // Check if category changed (compare old with new)
  if (updates.category && oldCategoryId !== updates.category.toString()) {
    // Decrement old category
    if (oldCategoryId) {
      Category.findByIdAndUpdate(oldCategoryId, {
        $inc: { serviceCount: -1 },
      }).catch((err) =>
        console.error("Failed to update old category count:", err),
      );
    }
    // Increment new category
    Category.findByIdAndUpdate(updates.category, {
      $inc: { serviceCount: 1 },
    }).catch((err) =>
      console.error("Failed to update new category count:", err),
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, service, "Service updated successfully"));
});

// ==================== ADMIN: UPDATE SERVICE STATUS ====================

// const adminUpdateServiceStatus = asyncHandler(async (req, res) => {
//   const { serviceId } = req.params;
//   const { status, featured, verification, rejectionReason } = req.body;

//   const service = await Service.findById(serviceId);

//   if (!service) {
//     throw new ApiError(404, "Service not found");
//   }

//   if (status) {
//     if (!["published", "pending", "draft", "rejected", "paused"].includes(status)) {
//       throw new ApiError(400, "Invalid status");
//     }
//     service.status = status;

//     if (status === "published" && !service.publishedAt) {
//       service.publishedAt = new Date();
//     }
//   }

//   if (featured !== undefined) {
//     service.featured = featured;
//     if (featured) {
//       service.featuredUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
//     } else {
//       service.featuredUntil = null;
//     }
//   }

//   if (verification) {
//     // You might want to add a verification field to your schema
//     service.verification = verification;
//   }

//   if (rejectionReason) {
//     service.rejectionReason = rejectionReason;
//   }

//   await service.save();

//   return res.status(200).json(
//     new ApiResponse(200, service, "Service status updated successfully")
//   );
// });

export {
  createService,
  getServices,
  getServiceBySlug,
  getServiceById,
  getSellerServices,
  updateService,
  deleteService,
  toggleServiceStatus,
  updateGallery,
  addReview,
  incrementViews,
  incrementSaves,
  decrementSaves,
  incrementShares,
  searchServices,
  getServiceStats,
  adminGetAllServices,
  adminUpdateServiceStatus,
  adminDeleteService,
  adminGetServiceForEdit,
  adminUpdateService,
};
