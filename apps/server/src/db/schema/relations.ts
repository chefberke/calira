import { relations } from "drizzle-orm";
import { user, account, session } from "./auth";
import { teams } from "./teams";
import { teamMembers } from "./team-members";
import { tasks } from "./tasks";

export const teamsRelations = relations(teams, ({ one, many }) => ({
  owner: one(user, { fields: [teams.ownerId], references: [user.id] }),
  members: many(teamMembers),
  tasks: many(tasks),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  team: one(teams, { fields: [teamMembers.teamId], references: [teams.id] }),
  user: one(user, { fields: [teamMembers.userId], references: [user.id] }),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  team: one(teams, { fields: [tasks.teamId], references: [teams.id] }),
  createdBy: one(user, { fields: [tasks.createdById], references: [user.id] }),
  assignedTo: one(user, { fields: [tasks.assignedToId], references: [user.id] }),
}));

export const userRelations = relations(user, ({ many }) => ({
  accounts: many(account),
  sessions: many(session),
  ownedTeams: many(teams),
  teamMemberships: many(teamMembers),
  createdTasks: many(tasks, { relationName: "createdTasks" }),
  assignedTasks: many(tasks, { relationName: "assignedTasks" }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, { fields: [account.userId], references: [user.id] }),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, { fields: [session.userId], references: [user.id] }),
}));