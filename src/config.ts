import "dotenv/config";

export const isProduction = () => process.env.NODE_ENV === "production";
export const applicationId = process.env.APPLICATION_ID || "";
export const clientId = process.env.CLIENT_ID || "";
export const guildId = process.env.GUILD_ID || "";
export const token = process.env.TOKEN || "";
