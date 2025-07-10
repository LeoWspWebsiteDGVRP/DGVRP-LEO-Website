import { users, citations, type User, type InsertUser, type Citation, type InsertCitation } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getCitation(id: number): Promise<Citation | undefined>;
  createCitation(citation: InsertCitation): Promise<Citation>;
  getAllCitations(): Promise<Citation[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private citations: Map<number, Citation>;
  private currentUserId: number;
  private currentCitationId: number;

  constructor() {
    this.users = new Map();
    this.citations = new Map();
    this.currentUserId = 1;
    this.currentCitationId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getCitation(id: number): Promise<Citation | undefined> {
    return this.citations.get(id);
  }

  async createCitation(insertCitation: InsertCitation): Promise<Citation> {
    const id = this.currentCitationId++;
    const citation: Citation = {
      ...insertCitation,
      additionalNotes: insertCitation.additionalNotes || null,
      id,
      createdAt: new Date(),
    };
    this.citations.set(id, citation);
    return citation;
  }

  async getAllCitations(): Promise<Citation[]> {
    return Array.from(this.citations.values());
  }
}

export const storage = new MemStorage();
