import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCitationSchema } from "@shared/schema";
import { createDiscordBotService } from "./discord";
import { initializeDiscordAuth, requireDiscordRole, AuthenticatedRequest } from "./auth";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize Discord bot service
  const discordBotToken = process.env.DISCORD_BOT_TOKEN;
  const discordChannelId = process.env.DISCORD_CHANNEL_ID;
  const discordService = (discordBotToken && discordChannelId) ? createDiscordBotService(discordBotToken, discordChannelId) : null;
  
  // Initialize Discord auth service
  const discordGuildId = process.env.DISCORD_GUILD_ID;
  const requiredRoles = process.env.REQUIRED_DISCORD_ROLES?.split(',') || ['Law Enforcement', 'Officer', 'Admin']; // Default roles
  
  if (discordBotToken && discordGuildId) {
    try {
      initializeDiscordAuth(discordBotToken, discordGuildId, requiredRoles);
      console.log('Discord auth service initialized with required roles:', requiredRoles);
    } catch (error) {
      console.error('Failed to initialize Discord auth service:', error);
    }
  } else {
    console.warn('Discord auth not configured - missing DISCORD_GUILD_ID or DISCORD_BOT_TOKEN');
  }
  
  // Initialize Discord bot if configured
  if (discordService) {
    try {
      await discordService.initialize();
      console.log('Discord bot initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Discord bot:', error);
    }
  }

  // Create citation
  app.post("/api/citations", requireDiscordRole(), async (req: AuthenticatedRequest, res) => {
    try {
      console.log("=== CITATION SUBMISSION START ===");
      console.log("Request method:", req.method);
      console.log("Request URL:", req.url);
      console.log("Content-Type:", req.headers['content-type']);
      console.log("Request body type:", typeof req.body);
      console.log("Request body:", JSON.stringify(req.body, null, 2));
      
      // Validate the incoming data
      const validatedData = insertCitationSchema.parse(req.body);
      console.log("✅ Schema validation successful");
      console.log("✅ Validated data:", JSON.stringify(validatedData, null, 2));
      
      // Create citation in storage
      const citation = await storage.createCitation(validatedData);
      console.log("✅ Citation created successfully with ID:", citation.id);
      
      // Send to Discord if service is configured
      if (discordService) {
        try {
          console.log("📨 Attempting to send citation to Discord...");
          console.log("📊 Data being sent to Discord service:", JSON.stringify(validatedData, null, 2));
          
          await discordService.sendCitationReport(validatedData);
          console.log("✅ Citation sent to Discord successfully");
        } catch (discordError) {
          console.error('❌ Failed to send citation to Discord:', discordError);
          console.error('Discord error stack:', discordError instanceof Error ? discordError.stack : 'No stack trace');
          // Don't fail the request if Discord fails
        }
      } else {
        console.log("⚠️ Discord service not configured, skipping Discord notification");
      }
      
      console.log("=== CITATION SUBMISSION COMPLETE ===");
      
      // Send success response
      const responseData = { 
        success: true,
        citation,
        message: "Citation submitted successfully" 
      };
      
      console.log("📤 Sending response:", responseData);
      res.status(200).json(responseData);
      
    } catch (error) {
      console.error("❌ Citation submission error:", error);
      console.error("❌ Error stack:", error instanceof Error ? error.stack : 'No stack trace');
      
      if (error instanceof z.ZodError) {
        console.log("❌ Validation errors:", error.errors);
        const errorResponse = { 
          success: false,
          message: "Validation failed", 
          errors: error.errors 
        };
        console.log("📤 Sending validation error response:", errorResponse);
        res.status(400).json(errorResponse);
      } else {
        console.error("❌ Unexpected error:", error);
        const errorResponse = { 
          success: false,
          message: "Internal server error",
          error: error instanceof Error ? error.message : "Unknown error"
        };
        console.log("📤 Sending server error response:", errorResponse);
        res.status(500).json(errorResponse);
      }
    }
  });

  // Get all citations
  app.get("/api/citations", async (req, res) => {
    try {
      const citations = await storage.getAllCitations();
      res.json(citations);
    } catch (error) {
      res.status(500).json({ 
        message: "Internal server error" 
      });
    }
  });

  // Get citation by ID
  app.get("/api/citations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid citation ID" });
      }
      
      const citation = await storage.getCitation(id);
      if (!citation) {
        return res.status(404).json({ message: "Citation not found" });
      }
      
      res.json(citation);
    } catch (error) {
      res.status(500).json({ 
        message: "Internal server error" 
      });
    }
  });

  // Create arrest report
  app.post("/api/arrests", requireDiscordRole(), async (req: AuthenticatedRequest, res) => {
    try {
      const arrestData = req.body;
      console.log("Arrest report received:", arrestData);
      
      // Send to Discord if webhook is configured
      if (discordService) {
        try {
          await discordService.sendArrestReport(arrestData);
        } catch (discordError) {
          console.error('Failed to send arrest report to Discord:', discordError);
          // Don't fail the request if Discord fails
        }
      }
      
      res.json({ 
        message: "Arrest report submitted successfully",
        id: Date.now() // temporary ID
      });
    } catch (error) {
      res.status(500).json({ 
        message: "Internal server error" 
      });
    }
  });

  // Get all arrest reports
  app.get("/api/arrests", async (req, res) => {
    try {
      // Placeholder - you can implement storage later
      res.json([]);
    } catch (error) {
      res.status(500).json({ 
        message: "Internal server error" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
