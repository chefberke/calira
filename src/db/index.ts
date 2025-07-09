import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { config } from "dotenv";

// Import all schemas
import * as users from "./schema/users";
import * as teams from "./schema/teams";
import * as teamMembers from "./schema/team-members";
import * as tasks from "./schema/tasks";

config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create schema object for drizzle
export const schema = {
  ...users,
  ...teams,
  ...teamMembers,
  ...tasks,
};

export const db = drizzle(pool, { schema });

export default db;

// Export all schemas for easy access
export { users, teams, teamMembers, tasks };

// Export individual auth tables for next-auth
export {
  users as usersTable,
  accounts as accountsTable,
  sessions as sessionsTable,
  verificationTokens as verificationTokensTable,
} from "./schema/users";
