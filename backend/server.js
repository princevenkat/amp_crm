import express from "express";
import cors from "cors";
import "dotenv/config";

// Import the database initializer and routes
import { initializeDatabase } from "./db.js";
import authRoutes from "./routes/auth.js";
import clientRoutes from "./routes/clients.js";
import taskRoutes from "./routes/tasks.js";
import appointmentRoutes from "./routes/appointments.js";
import contactRoutes from "./routes/contacts.js";
import teamRoutes from "./routes/team.js";
import passwordRoutes from "./routes/passwords.js";
import proposalRoutes from "./routes/proposals.js";
import emailTemplateRoutes from "./routes/emailTemplates.js";
import ledgerRoutes from "./routes/ledger.js";
import path from "path";

const startServer = async () => {
  try {
    // Initialize the database and wait for it to be ready
    await initializeDatabase();
    console.log("Database initialized successfully.");

    const app = express();
    const PORT = process.env.PORT || 3001;

    // Middleware
    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // A simple middleware to log requests
    app.use((req, res, next) => {
      console.log(`${req.method} ${req.originalUrl}`);
      next();
    });

    // API Routes
    app.use("/api/auth", authRoutes);
    app.use("/api/clients", clientRoutes);

    // Serve uploaded files
    //app.use('/uploads', express.static(path.join(path.resolve(), 'backend/uploads')));
    app.use(
      "/uploads",
      express.static(path.join(process.cwd(), "backend/uploads")),
    );

    app.use("/api/tasks", taskRoutes);
    app.use("/api/appointments", appointmentRoutes);
    app.use("/api/contacts", contactRoutes);
    app.use("/api/team", teamRoutes);
    app.use("/api/passwords", passwordRoutes);
    app.use("/api/proposals", proposalRoutes);
    app.use("/api/email_templates", emailTemplateRoutes);
    app.use("/api/ledger", ledgerRoutes);

    // Welcome route
    app.get("/", (req, res) => {
      res.send("CRM Backend is running!");
    });

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

startServer();
