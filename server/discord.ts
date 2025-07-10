import { Client, GatewayIntentBits, TextChannel, EmbedBuilder } from 'discord.js';

export interface DiscordBotService {
  sendCitationReport: (data: any) => Promise<void>;
  sendArrestReport: (data: any) => Promise<void>;
  initialize: () => Promise<void>;
}

class DiscordBotServiceImpl implements DiscordBotService {
  private client: Client;
  private channelId: string;
  private isReady: boolean = false;

  constructor(token: string, channelId: string) {
    this.client = new Client({
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
    });
    this.channelId = channelId;

    this.client.once('ready', () => {
      console.log(`Discord bot logged in as ${this.client.user?.tag}`);
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

  async sendCitationReport(data: any): Promise<void> {
    if (!this.isReady) {
      await this.initialize();
    }

    const channel = await this.client.channels.fetch(this.channelId) as TextChannel;
    if (!channel) {
      throw new Error('Discord channel not found');
    }

    console.log("📝 Formatting citation data:", data);

    // Format multiple officers - handle both array and single values
    let officerInfo = "";
    if (Array.isArray(data.officerBadges)) {
      officerInfo = data.officerBadges.map((badge: string, index: number) => {
        const rankText = data.officerRanks[index] || data.officerRanks[0] || "";
        const username = data.officerUsernames[index] || data.officerUsernames[0] || "";
        const userId = data.officerUserIds ? (data.officerUserIds[index] || data.officerUserIds[0] || "") : "";
        return `${rankText} @${username} (Badge #${badge})`;
      }).filter(info => info.trim() !== " @ (Badge #)").join('\n');
    } else {
      // Handle single officer case
      officerInfo = `${data.officerRanks || ""} @${data.officerUsernames || ""} (Badge #${data.officerBadges || ""})`;
    }

    // Format penal codes - just the codes without amounts
    let penalCodes = "";
    if (Array.isArray(data.penalCodes)) {
      penalCodes = data.penalCodes.map((code: string) => `**${code}**`).join(', ');
    } else {
      penalCodes = `**${data.penalCodes}**`;
    }

    // Format officer info without badge numbers for rank and signature - show full rank text with Discord mention
    let rankSignature = "";
    if (Array.isArray(data.officerRanks)) {
      rankSignature = data.officerRanks.map((rank: string, index: number) => {
        const userId = data.officerUserIds ? (data.officerUserIds[index] || "") : "";
        const cleanRank = rank.replace(/\s+\d+$/, '').trim();
        return userId ? `${cleanRank} <@${userId}>` : cleanRank;
      }).filter(rank => rank.trim() !== "").join('\n');
    } else {
      // Handle single officer case
      let cleanRank = data.officerRanks || "";
      const userId = data.officerUserIds ? (Array.isArray(data.officerUserIds) ? data.officerUserIds[0] : data.officerUserIds) : "";
      cleanRank = cleanRank.replace(/\s+\d+$/, '').trim();
      rankSignature = userId ? `${cleanRank} <@${userId}>` : cleanRank;
    }

    // Get the description for the first penal code to use as ticket type
    const penalCodeDescriptions = {
      "(2)08": "Petty Theft",
      "(2)15": "Loitering",
      "(4)11": "Misuse of Government Hotline",
      "(4)12": "Tampering with Evidence",
      "(5)01": "Disturbing the Peace",
      "(8)01": "Invalid / No Vehicle Registration / Insurance",
      "(8)02": "Driving Without a License",
      "(8)04": "Accident Reporting Requirements - Property Damage",
      "(8)06": "Failure to Obey Traffic Signal",
      "(8)07": "Driving Opposite Direction",
      "(8)08": "Failure to Maintain Lane",
      "(8)09": "Unsafe Following Distance",
      "(8)10": "Failure to Yield to Civilian",
      "(8)11": "Failure to Yield to Emergency Vehicles",
      "(8)12": "Unsafe Turn",
      "(8)13": "Unsafe Lane Change",
      "(8)14": "Illegal U-Turn",
      "(8)15": "Speeding (6-15 MPH Over)",
      "(8)16": "Speeding (16-25 MPH Over)",
      "(8)17": "Speeding (26+ MPH Over)",
      "(8)19": "Unreasonably Slow / Stopped",
      "(8)20": "Failure to Obey Stop Sign / RED LIGHT",
      "(8)21": "Illegally Parked",
      "(8)24": "Throwing Objects",
      "(8)31": "Littering",
      "(8)32": "Unsafe Speed for Conditions",
      "(8)33": "Hogging Passing Lane",
      "(8)34": "Impeding Traffic",
      "(8)35": "Jaywalking",
      "(8)36": "Unnecessary Use of Horn",
      "(8)37": "Excessive Music / Engine Sounds",
      "(8)39": "Failure to Yield to Pedestrian",
      "(8)40": "Distracted Driving",
      "(8)41": "Driving on Shoulder / Emergency Lane",
      "(8)42": "Move Over Law",
      "(8)43": "Driving Without Headlights",
      "(8)44": "Hit and Run",
      "(8)50": "Unroadworthy Vehicle",
      "(8)51": "Drifting on a Public Road",
      "(8)52": "Failure to Control Vehicle",
      "(8)53": "Unsafe Parking (Parking Ticket)",
      "(8)54": "Failure to Use Turn Signal",
      "(8)55": "Failure to Display License Plate (W/ only)"
    };

    // Get all penal codes to determine ticket type(s)
    let ticketType = "";
    if (Array.isArray(data.penalCodes)) {
      const ticketTypes = data.penalCodes.map((code: string) => 
        penalCodeDescriptions[code] || data.violationType || 'Citation'
      ).filter((type, index, arr) => arr.indexOf(type) === index); // Remove duplicates
      ticketType = ticketTypes.join(', ');
    } else {
      ticketType = penalCodeDescriptions[data.penalCodes] || data.violationType || 'Citation';
    }

    const formattedTotalAmount = parseFloat(data.totalAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const citationMessage = `Ping User Receiving Ticket: <@${data.violatorUsername}>
Type of Ticket: **${ticketType}**
Penal Code: ${penalCodes}
Total Amount Due: **$${formattedTotalAmount}**
Additional Notes: **${data.additionalNotes || 'N/A'}**

Rank and Signature: **${rankSignature}**
Law Enforcement Name(s): **${Array.isArray(data.officerUsernames) ? data.officerUsernames.join(', ') : data.officerUsernames}**
Badge Number: **${Array.isArray(data.officerBadges) ? data.officerBadges.join(', ') : data.officerBadges}**

By signing this citation, you acknowledge that this is NOT an admission of guilt, it is to simply ensure the citation is taken care of. Your court date is shown below, and failure to show will result in a warrant for your arrest. If you have any questions, please contact a Supervisor.

You must pay the citation to <@1392657393724424313>

Sign at the X: <@${data.violatorSignature}>

4000 Capitol Drive, Greenville, Wisconsin 54942

Court date: XX/XX/XX
Please call (262) 785-4700 ext. 7 for further inquiry.`;

    console.log("📨 Sending citation message:", citationMessage);
    await channel.send(citationMessage);
  }

  async sendArrestReport(data: any): Promise<void> {
    if (!this.isReady) {
      await this.initialize();
    }

    const channel = await this.client.channels.fetch(this.channelId) as TextChannel;
    if (!channel) {
      throw new Error('Discord channel not found');
    }

    // Format officer usernames with Discord pings
    const officerUsernames = data.officerUsernames.map((username: string, index: number) => {
      const userId = data.officerUserIds ? data.officerUserIds[index] : '';
      return userId ? `<@${userId}>` : `**${username}**`;
    }).join(', ');
    
    // Format ranks with bold formatting
    const officerRanks = data.officerRanks.map((rank: string) => `**${rank}**`).join(', ');
    
    // Format badge numbers with bold formatting
    const badgeNumbers = data.officerBadges.map((badge: string) => `**${badge}**`).join(', ');

    // Format penal codes with bold formatting
    const penalCodes = data.penalCodes.map((code: string, index: number) => {
      const jailTime = data.jailTimes[index];
      const amount = data.amountsDue[index];
      let line = `**${code}**`;
      if (jailTime && jailTime !== 'None') line += ` - **${jailTime}**`;
      if (amount && amount !== '0.00') {
        const formattedAmount = parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        line += ` - **$${formattedAmount}**`;
      }
      return line;
    }).join('\n');

    const formattedTotalAmount = parseFloat(data.totalAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    
    // Format officer signature as Discord ping if it's a valid user ID
    const officerSignature = data.officerSignature && data.officerSignature.match(/^\d+$/) 
      ? `<@${data.officerSignature}>` 
      : `**${data.officerSignature}**`;
    
    // Format suspect signature as Discord ping if it's a valid user ID
    const suspectSignature = data.suspectSignature && data.suspectSignature.match(/^\d+$/) 
      ? `<@${data.suspectSignature}>` 
      : `**${data.suspectSignature}**`;
    
    // Format multiple officer signatures based on number of officers
    const officerSignatures = data.officerUserIds.map((userId: string, index: number) => {
      const username = data.officerUsernames[index];
      const signature = userId && userId.match(/^\d+$/) ? `<@${userId}>` : `**${username}**`;
      return `Arresting officer signature X: ${signature}`;
    }).join('\n');
    
    // Calculate warrant information
    const remainingSeconds = !data.timeServed 
      ? parseInt((data.totalJailTime || "0 Seconds").replace(" Seconds", "")) || 0
      : 0;
    const warrantNeeded = remainingSeconds > 0 ? "**Yes**" : "**No**";
    const timeNeededForWarrant = remainingSeconds > 0 ? `**${remainingSeconds} Seconds**` : "**0 Seconds**";

    const arrestMessage = `**Arrest Report**

Officer's Username: ${officerUsernames}
Law Enforcement username(s): ${data.officerUsernames.map((username: string) => `**${username}**`).join(', ')}
Ranks: ${officerRanks}
Badge Number: ${badgeNumbers}

Description/Mugshot
**${data.description || 'No description provided'}**

—
Offense: 
${penalCodes}

Total: **$${formattedTotalAmount}** + **${data.totalJailTime}** ${data.timeServed ? '**(TIME SERVED)**' : ''}

**Warrant Information:**
Warrant Needed: ${warrantNeeded}
Time Needed for Warrant: ${timeNeededForWarrant}

Sign at the X:
${suspectSignature}

${officerSignatures}

${data.courtLocation}

Court date: **${data.courtDate}**
Please call **${data.courtPhone}** for further inquiry.`;

    console.log("📨 Sending arrest message:", arrestMessage);
    await channel.send(arrestMessage);
  }

}

export function createDiscordBotService(token: string, channelId: string): DiscordBotService {
  return new DiscordBotServiceImpl(token, channelId);
}