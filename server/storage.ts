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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private paintRequests: Map<number, PaintRequest>;
  private notifications: Map<number, Notification>;
  private userIdCounter: number;
  private requestIdCounter: number;
  private notificationIdCounter: number;

  constructor() {
    this.users = new Map();
    this.paintRequests = new Map();
    this.notifications = new Map();
    this.userIdCounter = 1;
    this.requestIdCounter = 1;
    this.notificationIdCounter = 1;
    
    // Create a default user
    this.createUser({
      username: "mario.rossi",
      password: "password123", // In a real app, this would be hashed
      fullName: "Mario Rossi",
      email: "mario.rossi@azienda.it",
      department: "engineering"
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Paint Request methods
  async getPaintRequest(id: number): Promise<PaintRequest | undefined> {
    return this.paintRequests.get(id);
  }

  async getPaintRequestByCode(requestCode: string): Promise<PaintRequest | undefined> {
    return Array.from(this.paintRequests.values()).find(
      (request) => request.requestCode === requestCode,
    );
  }

  async listPaintRequests(userId?: number, status?: string): Promise<PaintRequest[]> {
    const requests = Array.from(this.paintRequests.values());
    
    return requests.filter(request => {
      if (userId !== undefined && request.userId !== userId) {
        return false;
      }
      if (status !== undefined && request.status !== status) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      // Sort by creation date (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  async createPaintRequest(insertRequest: InsertPaintRequest): Promise<PaintRequest> {
    const id = this.requestIdCounter++;
    const now = new Date();
    const requestCode = `REQ-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${id.toString().padStart(4, '0')}`;
    
    const request: PaintRequest = {
      ...insertRequest,
      id,
      requestCode,
      status: "pending",
      createdAt: now,
      updatedAt: now,
      completedAt: null,
      rejectionReason: null,
    };
    
    this.paintRequests.set(id, request);
    
    // Create a notification for the new request
    await this.createNotification({
      userId: request.userId,
      requestId: id,
      message: `Richiesta ${requestCode} creata con successo`,
      isRead: false,
      type: "info",
    });
    
    return request;
  }

  async updatePaintRequestStatus(id: number, status: string, details?: { rejectionReason?: string }): Promise<PaintRequest | undefined> {
    const request = this.paintRequests.get(id);
    if (!request) {
      return undefined;
    }

    const updatedRequest: PaintRequest = {
      ...request,
      status,
      updatedAt: new Date(),
    };

    if (status === "completed") {
      updatedRequest.completedAt = new Date();
    }

    if (status === "rejected" && details?.rejectionReason) {
      updatedRequest.rejectionReason = details.rejectionReason;
    }

    this.paintRequests.set(id, updatedRequest);

    // Create a notification for the status change
    let notificationType: string;
    let notificationMessage: string;
    
    switch (status) {
      case "processing":
        notificationType = "info";
        notificationMessage = `Richiesta ${request.requestCode} è ora in lavorazione`;
        break;
      case "completed":
        notificationType = "success";
        notificationMessage = `Richiesta ${request.requestCode} è stata completata`;
        break;
      case "rejected":
        notificationType = "error";
        notificationMessage = `Richiesta ${request.requestCode} è stata rifiutata: ${details?.rejectionReason || 'Nessun motivo specificato'}`;
        break;
      case "waiting":
        notificationType = "warning";
        notificationMessage = `Richiesta ${request.requestCode} è in attesa`;
        break;
      default:
        notificationType = "info";
        notificationMessage = `Richiesta ${request.requestCode} è stata aggiornata`;
    }

    await this.createNotification({
      userId: request.userId,
      requestId: id,
      message: notificationMessage,
      isRead: false,
      type: notificationType,
    });

    return updatedRequest;
  }

  // Notification methods
  async getNotifications(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const id = this.notificationIdCounter++;
    const notification: Notification = {
      ...insertNotification,
      id,
      createdAt: new Date(),
    };
    
    this.notifications.set(id, notification);
    return notification;
  }

  async markNotificationAsRead(id: number): Promise<boolean> {
    const notification = this.notifications.get(id);
    if (!notification) {
      return false;
    }

    notification.isRead = true;
    this.notifications.set(id, notification);
    return true;
  }

  async markAllNotificationsAsRead(userId: number): Promise<boolean> {
    const userNotifications = Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId);
    
    for (const notification of userNotifications) {
      notification.isRead = true;
      this.notifications.set(notification.id, notification);
    }
    
    return true;
  }
}

export const storage = new MemStorage();
