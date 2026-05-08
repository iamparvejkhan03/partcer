import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // console.log('Processing field:', file.fieldname, 'File:', file.originalname);
  
  // ============= USER PROFILE FIELDS =============
  if (file.fieldname === "avatar" || file.fieldname === "profileImage") {
    // User profile pictures
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed for profile pictures"), false);
    }
  }
  
  else if (file.fieldname === "coverImage" || file.fieldname === "coverPhoto") {
    // User cover photos
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed for cover photos"), false);
    }
  }
  
  else if (file.fieldname === "verificationDocument" || file.fieldname === "idProof") {
    // Identity verification documents
    const allowedTypes = [
      'application/pdf',
      'image/jpeg', 
      'image/png',
      'image/jpg'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, JPEG, or PNG files are allowed for verification documents"), false);
    }
  }

  else if (file.fieldname === "attachment" || file.fieldname === "attachments") {
    // Generic attachment field (used in various places - we'll allow common document and image types)
    const allowedTypes = [
      'application/pdf',
      'image/jpeg', 
      'image/png',
      'image/webp',
      'image/jpg',
      'application/msword',
      'text/plain',
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, JPEG, or PNG files are allowed for generic attachments"), false);
    }
  }
  
  else if (file.fieldname === "portfolioImage") {
    // Portfolio items (can be images or PDFs)
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf',
      'application/zip', 'application/x-zip-compressed',
      'application/x-rar-compressed'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid portfolio file type"), false);
    }
  }
  
  // ============= SERVICE/ GIG FIELDS =============
  else if (file.fieldname === "serviceThumbnail" || file.fieldname === "gigThumbnail") {
    // Main service image
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only images are allowed for service thumbnails"), false);
    }
  }
  
  else if (file.fieldname === "serviceGallery" || file.fieldname === "gallery" || file.fieldname === "gigImages") {
    // Multiple service images
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only images are allowed in service gallery"), false);
    }
  }
  
  else if (file.fieldname === "serviceVideo" || file.fieldname === "gigVideo") {
    // Service introduction video
    const allowedTypes = [
      'video/mp4', 'video/mpeg', 'video/quicktime', 'video/webm'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only video files (MP4, MOV, WEBM) are allowed"), false);
    }
  }
  
  else if (file.fieldname === "serviceDocument" || file.fieldname === "serviceAttachment") {
    // Additional service documents (price lists, terms, etc.)
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/jpg',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only documents and image (PDF, DOC, XLS, TXT, PNG, WEBP, JPEG, JPG, GIFs) are allowed"), false);
    }
  }
  
  // ============= PROJECT/DELIVERABLE FIELDS =============
  else if (file.fieldname === "projectAttachments" || file.fieldname === "brief") {
    // Project brief/requirements
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/jpg',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only documents and image (PDF, DOC, XLS, TXT, PNG, WEBP, JPEG, JPG, GIFs) are allowed"), false);
    }
  }
  
  else if (file.fieldname === "deliverable" || file.fieldname === "milestoneDeliverable") {
    // Project deliverables (can be any file type except executables)
    const forbiddenTypes = [
      'application/x-msdownload', 'application/x-ms-installer',
      'application/x-sh', 'application/x-bat', 'application/x-csh',
      'application/x-apple-diskimage', 'application/x-ms-application'
    ];
    const forbiddenExtensions = ['.exe', '.msi', '.bat', '.cmd', '.sh', '.dmg', '.app', '.jar'];
    
    const fileExtension = file.originalname.toLowerCase().slice(file.originalname.lastIndexOf("."));
    
    if (forbiddenTypes.includes(file.mimetype) || forbiddenExtensions.includes(fileExtension)) {
      cb(new Error("Executable files are not allowed for security reasons"), false);
    } else {
      cb(null, true);
    }
  }
  
  else if (file.fieldname === "deliverablePreview") {
    // Preview images for deliverables
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only images are allowed for previews"), false);
    }
  }
  
  else if (file.fieldname === "sourceCode") {
    // Source code files
    const allowedTypes = [
      'application/zip', 'application/x-zip-compressed',
      'application/x-gzip', 'application/x-tar',
      'application/x-rar-compressed'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Please upload source code as ZIP, RAR, or TAR file"), false);
    }
  }
  
  // ============= INVOICE/PAYMENT FIELDS =============
  else if (file.fieldname === "invoice" || file.fieldname === "receipt") {
    // Invoices and receipts
    const allowedTypes = [
      'application/pdf',
      'image/jpeg', 'image/png',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, images, or Excel files are allowed for invoices"), false);
    }
  }
  
  // ============= MESSAGING/COMMUNICATION FIELDS =============
  else if (file.fieldname === "messageAttachment") {
    // Attachments in messages
    const forbiddenTypes = [
      'application/x-msdownload', 'application/x-ms-installer'
    ];
    if (forbiddenTypes.includes(file.mimetype)) {
      cb(new Error("Executable files cannot be sent in messages"), false);
    } else if (file.size > 10 * 1024 * 1024) { // 10MB limit for messages
      cb(new Error("Message attachments cannot exceed 10MB"), false);
    } else {
      cb(null, true);
    }
  }
  
  // ============= DISPUTE/SUPPORT FIELDS =============
  else if (file.fieldname === "disputeEvidence" || file.fieldname === "supportAttachment") {
    // Evidence for disputes or support tickets
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif',
      'application/pdf',
      'application/zip', 'application/x-zip-compressed',
      'video/mp4'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid evidence file type"), false);
    }
  }
  
  // ============= ADMIN/PLATFORM FIELDS =============
  else if (file.fieldname === "platformLogo" || file.fieldname === "favicon") {
    // Platform branding
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only images are allowed for logos"), false);
    }
  }
  
  else if (file.fieldname === "categoryIcon" || file.fieldname === "categoryImage") {
    // Category icons and images
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only images are allowed for category icons"), false);
    }
  }
  
  else {
    // Unknown field
    cb(new Error(`Unexpected field: ${file.fieldname}`), false);
  }
};

// Configure multer with limits
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 200 * 1024 * 1024, // 50MB max file size
    files: 50, // Max 20 files per request
    fields: 50 // Max 50 non-file fields
  }
});

export default upload;