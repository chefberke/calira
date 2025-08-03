import { relations } from "drizzle-orm";
import { users } from "./auth";
import { teams } from "./teams";
import { teamMembers } from "./team-members";
import { tasks } from "./tasks";

export const teamsRelations = relations(teams, ({ one, many }) => ({
  owner: one(users, { fields: [teams.ownerId], references: [users.id] }),
  members: many(teamMembers),
  tasks: many(tasks),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  team: one(teams, { fields: [teamMembers.teamId], references: [teams.id] }),
  user: one(users, { fields: [teamMembers.userId], references: [users.id] }),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  team: one(teams, { fields: [tasks.teamId], references: [teams.id] }),
  createdBy: one(users, { fields: [tasks.createdById], references: [users.id] }),
  assignedTo: one(users, { fields: [tasks.assignedToId], references: [users.id] }),
}));

export const usersTeamsRelations = relations(users, ({ many }) => ({
  ownedTeams: many(teams),
  teamMemberships: many(teamMembers),
  createdTasks: many(tasks, { relationName: "createdTasks" }),
  assignedTasks: many(tasks, { relationName: "assignedTasks" }),
}));