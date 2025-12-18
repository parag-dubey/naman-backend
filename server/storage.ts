// 1. Lead aur InsertLead types ko import karein
import { type User, type InsertUser, type Lead, type InsertLead } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // 2. Naya function declare kiya
  createLead(lead: InsertLead): Promise<Lead>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private leads: Map<string, Lead>; // 3. Leads store karne ke liye jagah banayi

  constructor() {
    this.users = new Map();
    this.leads = new Map(); // 4. Initialize kiya
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // 5. Naya function implement kiya: Lead save karne ke liye
  async createLead(insertLead: InsertLead): Promise<Lead> {
    const id = randomUUID();
    // Lead object banaya
    // Note: Hum 'as Lead' use kar rahe hain taaki type error na aaye
    const lead: Lead = { ...insertLead, id } as any; 
    
    this.leads.set(id, lead);
    return lead;
  }
}

export const storage = new MemStorage();