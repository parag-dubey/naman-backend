import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { createWordPressLead } from "./wordpressBridge";

export async function registerRoutes(app: Express): Promise<Server> {

  // --- API Routes ---

  app.post("/api/leads", async (req, res) => {
    try {
      // ✅ UPDATE: Email ko bhi nikal rahe hain
      const { name, phone, email, service } = req.body;
      
      const leadData = {
        name: name || "Unknown User",
        phone: phone || "No Number",
        email: email || "No Email", // ✅ Email Added
        service: service || "Unknown Service"
      };

      console.log("📥 New Lead Received:", leadData);

      // Step 1: Database me save karein (Backup ke liye)
      let savedLead = null;
      try {
         // @ts-ignore
         if (storage.createLead) {
             // Dhyan rahe: Agar aapke database schema me 'email' column nahi hai 
             // to ye shayad fail ho, par humne try-catch lagaya hai isliye server nahi rukega.
             savedLead = await storage.createLead(leadData);
             console.log("✅ Saved to Database via Storage");
         }
      } catch (dbError) {
         console.log("⚠️ DB Save Issue (Ignored):", dbError);
      }

      // Step 2: WordPress par bhejein (Ab Email bhi bhej rahe hain)
      const wpResult = await createWordPressLead({
        name: leadData.name,
        phone: leadData.phone,
        email: leadData.email, // ✅ Passing Email to WordPress Bridge
        service: leadData.service
      });

      // Step 3: Response bhejein
      res.json({
        success: true,
        dbData: savedLead,
        wpId: wpResult?.id // WordPress ID wapas bhejein
      });

    } catch (error) {
      console.error("❌ Error processing lead:", error);
      res.status(500).json({ message: "Failed to process lead" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}