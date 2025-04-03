import { 
  users, type User, type InsertUser,
  paintRequests, type PaintRequest, type InsertPaintRequest,
  notifications, type Notification, type InsertNotification
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Paint Request methods
  getPaintRequest(id: number): Promise<PaintRequest | undefined>;
  getPaintRequestByCode(requestCode: string): Promise<PaintRequest | undefined>;
  listPaintRequests(userId?: number, status?: string): Promise<PaintRequest[]>;
  createPaintRequest(request: InsertPaintRequest): Promise<PaintRequest>;
  updatePaintRequestStatus(id: number, status: string, details?: { rejectionReason?: string }): Promise<PaintRequest | undefined>;
  
  // Notification methods
  getNotifications(userId: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<boolean>;
  markAllNotificationsAsRead(userId: number): Promise<boolean>;
}

import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Paint Request methods
  async getPaintRequest(id: number): Promise<PaintRequest | undefined> {
    const [request] = await db.select().from(paintRequests).where(eq(paintRequests.id, id));
    return request || undefined;
  }

  async getPaintRequestByCode(requestCode: string): Promise<PaintRequest | undefined> {
    const [request] = await db.select().from(paintRequests).where(eq(paintRequests.requestCode, requestCode));
    return request || undefined;
  }

  async listPaintRequests(userId?: number, status?: string): Promise<PaintRequest[]> {
    let query = db.select().from(paintRequests);
    
    // Add filters if provided
    if (userId !== undefined && status !== undefined) {
      query = query.where(and(eq(paintRequests.userId, userId), eq(paintRequests.status, status)));
    } else if (userId !== undefined) {
      query = query.where(eq(paintRequests.userId, userId));
    } else if (status !== undefined) {
      query = query.where(eq(paintRequests.status, status));
    }
    
    // Order by createdAt descending
    query = query.orderBy(desc(paintRequests.createdAt));
    
    return await query;
  }

  async createPaintRequest(insertRequest: InsertPaintRequest): Promise<PaintRequest> {
    // Get the next ID to create the request code
    const [maxIdResult] = await db
      .select({ maxId: db.fn.max(paintRequests.id).as("maxId") })
      .from(paintRequests);
    
    const nextId = (maxIdResult?.maxId || 0) + 1;
    const now = new Date();
    const requestCode = `REQ-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${nextId.toString().padStart(4, '0')}`;
    
    // Insert the request
    const [request] = await db
      .insert(paintRequests)
      .values({
        ...insertRequest,
        requestCode,
        status: "pending",
        createdAt: now,
        updatedAt: now
      })
      .returning();
    
    // Create a notification for the new request
    await this.createNotification({
      userId: 1, // Notify default user (admin)
      requestId: request.id,
      message: `Nuova richiesta ${requestCode} dalla postazione ${request.workstation}`,
      isRead: false,
      type: "info",
    });
    
    return request;
  }

  async updatePaintRequestStatus(id: number, status: string, details?: { rejectionReason?: string }): Promise<PaintRequest | undefined> {
    // Get the current request
    const [existingRequest] = await db
      .select()
      .from(paintRequests)
      .where(eq(paintRequests.id, id));
    
    if (!existingRequest) {
      return undefined;
    }
    
    const now = new Date();
    const updateData: any = {
      status,
      updatedAt: now
    };
    
    if (status === "completed") {
      updateData.completedAt = now;
    }
    
    if (status === "rejected" && details?.rejectionReason) {
      updateData.rejectionReason = details.rejectionReason;
    }
    
    // Update the request
    const [updatedRequest] = await db
      .update(paintRequests)
      .set(updateData)
      .where(eq(paintRequests.id, id))
      .returning();
    
    // Create a notification for the status change
    let notificationType: string;
    let notificationMessage: string;
    
    switch (status) {
      case "processing":
        notificationType = "info";
        notificationMessage = `Richiesta ${updatedRequest.requestCode} è ora in lavorazione`;
        break;
      case "completed":
        notificationType = "success";
        notificationMessage = `Richiesta ${updatedRequest.requestCode} è stata completata`;
        break;
      case "rejected":
        notificationType = "error";
        notificationMessage = `Richiesta ${updatedRequest.requestCode} è stata rifiutata: ${details?.rejectionReason || 'Nessun motivo specificato'}`;
        break;
      case "waiting":
        notificationType = "warning";
        notificationMessage = `Richiesta ${updatedRequest.requestCode} è in attesa`;
        break;
      default:
        notificationType = "info";
        notificationMessage = `Richiesta ${updatedRequest.requestCode} è stata aggiornata`;
    }
    
    await this.createNotification({
      userId: updatedRequest.userId,
      requestId: id,
      message: notificationMessage,
      isRead: false,
      type: notificationType,
    });
    
    return updatedRequest;
  }

  // Notification methods
  async getNotifications(userId: number): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const [notification] = await db
      .insert(notifications)
      .values({
        ...insertNotification,
        createdAt: new Date()
      })
      .returning();
    
    return notification;
  }

  async markNotificationAsRead(id: number): Promise<boolean> {
    const result = await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id));
    
    return true; // In PostgreSQL we don't get a count easily, so assume success
  }

  async markAllNotificationsAsRead(userId: number): Promise<boolean> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
    
    return true; // In PostgreSQL we don't get a count easily, so assume success
  }
}

export const storage = new DatabaseStorage();
