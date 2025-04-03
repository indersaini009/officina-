import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertPaintRequestSchema, insertNotificationSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // prefix all routes with /api
  const apiRouter = express.Router();

  // Paint request routes
  apiRouter.get("/requests", async (req: Request, res: Response) => {
    try {
      const userId = req.query.userId ? Number(req.query.userId) : undefined;
      const status = req.query.status ? String(req.query.status) : undefined;
      
      const requests = await storage.listPaintRequests(userId, status);
      return res.json(requests);
    } catch (error) {
      console.error("Error getting requests:", error);
      return res.status(500).json({ message: "Error retrieving requests" });
    }
  });

  apiRouter.get("/requests/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const request = await storage.getPaintRequest(id);
      
      if (!request) {
        return res.status(404).json({ message: "Request not found" });
      }
      
      return res.json(request);
    } catch (error) {
      console.error("Error getting request:", error);
      return res.status(500).json({ message: "Error retrieving request" });
    }
  });

  apiRouter.post("/requests", async (req: Request, res: Response) => {
    try {
      const validationResult = insertPaintRequestSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid request data", errors: validationResult.error.format() });
      }
      
      const request = await storage.createPaintRequest(validationResult.data);
      return res.status(201).json(request);
    } catch (error) {
      console.error("Error creating request:", error);
      return res.status(500).json({ message: "Error creating request" });
    }
  });

  apiRouter.patch("/requests/:id/status", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const statusSchema = z.object({
        status: z.enum(["pending", "processing", "completed", "rejected", "waiting"]),
        rejectionReason: z.string().optional(),
      });
      
      const validationResult = statusSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid status data", errors: validationResult.error.format() });
      }
      
      const { status, rejectionReason } = validationResult.data;
      const request = await storage.updatePaintRequestStatus(id, status, { rejectionReason });
      
      if (!request) {
        return res.status(404).json({ message: "Request not found" });
      }
      
      return res.json(request);
    } catch (error) {
      console.error("Error updating request status:", error);
      return res.status(500).json({ message: "Error updating request status" });
    }
  });

  // Notification routes
  apiRouter.get("/notifications", async (req: Request, res: Response) => {
    try {
      // In a real app, this would come from the authenticated user
      const userId = req.query.userId ? Number(req.query.userId) : 1;
      
      const notifications = await storage.getNotifications(userId);
      return res.json(notifications);
    } catch (error) {
      console.error("Error getting notifications:", error);
      return res.status(500).json({ message: "Error retrieving notifications" });
    }
  });

  apiRouter.post("/notifications/read/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const success = await storage.markNotificationAsRead(id);
      
      if (!success) {
        return res.status(404).json({ message: "Notification not found" });
      }
      
      return res.json({ success: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      return res.status(500).json({ message: "Error marking notification as read" });
    }
  });

  apiRouter.post("/notifications/read-all", async (req: Request, res: Response) => {
    try {
      // In a real app, this would come from the authenticated user
      const userId = req.body.userId ? Number(req.body.userId) : 1;
      
      const success = await storage.markAllNotificationsAsRead(userId);
      return res.json({ success });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      return res.status(500).json({ message: "Error marking all notifications as read" });
    }
  });

  // User routes
  apiRouter.get("/user", async (req: Request, res: Response) => {
    try {
      // In a real app, this would come from the authenticated user
      const user = await storage.getUser(1);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't send password in response
      const { password, ...userWithoutPassword } = user;
      return res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error getting user:", error);
      return res.status(500).json({ message: "Error retrieving user" });
    }
  });

  // Mount the API router
  app.use("/api", apiRouter);

  const httpServer = createServer(app);
  return httpServer;
}

import express from "express";
