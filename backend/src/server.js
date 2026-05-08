import express from "express";
import "dotenv/config";
import dbConnect from "./db/index.js";
import cors from "cors";
import compression from "compression";
import { configureCloudinary } from "./utils/cloudinary.js";
import userRouter from "./routes/user.route.js";
import errorHandler from "./middlewares/error.middleware.js";
import portfolioRouter from "./routes/portfolio.route.js";
import paymentRouter from "./routes/paymentDetail.route.js";
import adminRouter from "./routes/admin.route.js";
import skillRouter from "./routes/skill.route.js";
import serviceRouter from "./routes/service.route.js";
import categoryRouter from "./routes/category.route.js";
import projectRouter from "./routes/project.route.js";
//chat system imports
import { Server } from "socket.io";
import http from "http";
import { initializeSocket } from "./sockets/socket.js";
import chatRouter from "./routes/chat.route.js";
import dashboardRouter from "./routes/dashboard.route.js";
import orderRouter from "./routes/order.route.js";
import customOfferRouter from "./routes/customOffer.route.js";
import reviewRouter from "./routes/review.route.js";

const app = express();
const PORT = process.env.PORT || 3000;

// 1. FIRST connect to database
await dbConnect();
configureCloudinary();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = initializeSocket(server);

app.use(compression());
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ limit: '16kb' }));

app.use(cors({
    origin: ['https://www.partcer.com', 'https://partcer.com', 'https://partcer-frontend.onrender.com', 'https://partcer-backend.onrender.com', 'http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
}));

// Health check
app.get('/api/v1/health', (req, res) => {
    res.status(200).json({ 
        status: 'ok', 
        // agenda: agendaStarted ? 'running' : 'failed'
    });
});

// Your API routes
app.use('/api/v1/users', userRouter);
app.use("/api/v1/portfolio", portfolioRouter);
app.use("/api/v1/payment-details", paymentRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/services", serviceRouter);
app.use("/api/v1/admin/categories", categoryRouter);
app.use("/api/v1/categories", categoryRouter);
app.use('/api/v1/admin/skills', skillRouter);
app.use('/api/v1/skills', skillRouter);
app.use('/api/v1/projects', projectRouter);
app.use("/api/v1/dashboard", dashboardRouter);
app.use('/api/v1/chat', chatRouter);
app.use("/api/v1/orders", orderRouter);
app.use("/api/v1/custom-offers", customOfferRouter);
app.use("/api/v1/reviews", reviewRouter);

// 404 handler - SIMPLIFIED VERSION
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.originalUrl} not found`
    });
});

// For error handling
app.use(errorHandler);

server.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});