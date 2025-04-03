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
    // Generiamo un codice di richiesta basato sull'anno corrente con numero progressivo
    const now = new Date();
    const workstation = insertRequest.workstation?.slice(0,3).toUpperCase() || 'EUR';
    
    // Otteniamo l'anno corrente
    const currentYear = now.getFullYear().toString();
    
    // Otteniamo tutte le richieste
    const allRequests = await db.select().from(paintRequests);
    
    // Filtriamo le richieste di quest'anno
    const yearRequests = allRequests.filter(req => 
      req.requestCode.startsWith(`${currentYear}-`)
    );
    
    // Determiniamo il prossimo numero sequenziale per l'anno corrente
    let nextSequence = 1; // Iniziamo da 1 se non ci sono richieste quest'anno
    if (yearRequests.length > 0) {
      // Estraiamo i numeri di sequenza dalle richieste esistenti
      const sequences = yearRequests.map(req => {
        const parts = req.requestCode.split('-');
        const seqPart = parts[parts.length - 1];
        return parseInt(seqPart, 10);
      });
      
      // Troviamo il numero più alto e aggiungiamo 1
      nextSequence = Math.max(...sequences) + 1;
    }
    
    // Formattiamo il numero sequenziale con zeri iniziali (001, 002, ecc.)
    const sequenceFormatted = nextSequence.toString().padStart(3, '0');
    
    // Formato: 2025-001 (Anno e sequenza progressiva)
    const requestCode = `${currentYear}-${sequenceFormatted}`;
    
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
    
    try {
      // Create a notification for the new request
      await this.createNotification({
        userId: 1, // Notify default user (admin)
        requestId: request.id,
        message: `Nuova richiesta ${requestCode} dal reparto ${request.workstation}`,
        isRead: false,
        type: "info",
      });
    } catch (error) {
      console.error("Errore nella creazione della notifica:", error);
      // Continuiamo comunque, la richiesta è stata creata
    }
    
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
