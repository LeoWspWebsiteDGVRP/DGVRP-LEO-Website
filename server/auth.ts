
import { Request, Response, NextFunction } from 'express';
import { Client, GatewayIntentBits } from 'discord.js';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
    roles: string[];
  };
}

class DiscordAuthService {
  private client: Client;
  private guildId: string;
  private requiredRoles: string[];
  private isReady: boolean = false;

  constructor(token: string, guildId: string, requiredRoles: string[] = []) {
    this.client = new Client({
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
    });
    this.guildId = guildId;
    this.requiredRoles = requiredRoles;

    this.client.once('ready', () => {
      console.log(`Discord auth client logged in as ${this.client.user?.tag}`);
      this.isReady = true;
    });

    this.client.login(token);
  }

  async initialize(): Promise<void> {
    return new Promise((resolve) => {
      if (this.isReady) {
        resolve();
        return;
      }

      this.client.once('ready', () => {
        resolve();
      });
    });
  }

  async checkUserRoles(userId: string): Promise<{ hasAccess: boolean; userRoles: string[] }> {
    try {
      if (!this.isReady) {
        await this.initialize();
      }

      const guild = await this.client.guilds.fetch(this.guildId);
      const member = await guild.members.fetch(userId);
      
      const userRoles = member.roles.cache.map(role => role.name);
      
      // If no required roles are set, allow access
      if (this.requiredRoles.length === 0) {
        return { hasAccess: true, userRoles };
      }

      // Check if user has any of the required roles
      const hasRequiredRole = this.requiredRoles.some(role => userRoles.includes(role));
      
      return { hasAccess: hasRequiredRole, userRoles };
    } catch (error) {
      console.error('Error checking user roles:', error);
      return { hasAccess: false, userRoles: [] };
    }
  }
}

let authService: DiscordAuthService | null = null;

export function initializeDiscordAuth(token: string, guildId: string, requiredRoles: string[] = []) {
  authService = new DiscordAuthService(token, guildId, requiredRoles);
  return authService;
}

export function requireDiscordRole() {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      // Get user ID from Replit headers
      const userId = req.headers['x-replit-user-id'] as string;
      const username = req.headers['x-replit-user-name'] as string;
      const userRoles = (req.headers['x-replit-user-roles'] as string)?.split(',') || [];

      if (!userId) {
        return res.status(401).json({ 
          error: 'Authentication required',
          message: 'Please log in with your Replit account to access this application.'
        });
      }

      if (!authService) {
        console.warn('Discord auth service not initialized, allowing access');
        req.user = { id: userId, username: username || 'Unknown', roles: userRoles };
        return next();
      }

      // Check Discord roles
      const { hasAccess, userRoles: discordRoles } = await authService.checkUserRoles(userId);

      if (!hasAccess) {
        return res.status(403).json({
          error: 'Insufficient permissions',
          message: 'You do not have the required Discord server roles to access this application.',
          userRoles: discordRoles
        });
      }

      // Add user info to request
      req.user = { 
        id: userId, 
        username: username || 'Unknown', 
        roles: discordRoles 
      };

      next();
    } catch (error) {
      console.error('Authentication error:', error);
      res.status(500).json({ 
        error: 'Authentication error',
        message: 'An error occurred while checking your permissions.'
      });
    }
  };
}

export { AuthenticatedRequest };
