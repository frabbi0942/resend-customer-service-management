import { prisma } from "./prisma";

export type AssignmentStrategy = "round_robin" | "least_loaded";

async function getAssignmentStrategy(): Promise<AssignmentStrategy> {
  const setting = await prisma.setting.findUnique({
    where: { key: "assignment_strategy" },
  });
  return (setting?.value as AssignmentStrategy) || "least_loaded";
}

async function getActiveTeamMembers(): Promise<string[]> {
  const members = await prisma.teamMember.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "asc" },
  });
  return members.map((m) => m.clerkUserId);
}

async function assignRoundRobin(activeMembers: string[]): Promise<string> {
  const lastAssigned = await prisma.setting.findUnique({
    where: { key: "last_assigned_user_id" },
  });

  let nextIndex = 0;
  if (lastAssigned) {
    const lastIndex = activeMembers.indexOf(lastAssigned.value);
    nextIndex = (lastIndex + 1) % activeMembers.length;
  }

  const assignedTo = activeMembers[nextIndex];

  await prisma.setting.upsert({
    where: { key: "last_assigned_user_id" },
    update: { value: assignedTo },
    create: { key: "last_assigned_user_id", value: assignedTo },
  });

  return assignedTo;
}

async function assignLeastLoaded(activeMembers: string[]): Promise<string> {
  const ticketCounts = await prisma.ticket.groupBy({
    by: ["assignedToId"],
    where: {
      assignedToId: { in: activeMembers },
      status: { in: ["open", "in_progress"] },
    },
    _count: { id: true },
  });

  const countMap = new Map(
    ticketCounts.map((tc) => [tc.assignedToId, tc._count.id])
  );

  let leastLoaded = activeMembers[0];
  let minCount = countMap.get(activeMembers[0]) ?? 0;

  for (const memberId of activeMembers) {
    const count = countMap.get(memberId) ?? 0;
    if (count < minCount) {
      minCount = count;
      leastLoaded = memberId;
    }
  }

  return leastLoaded;
}

export async function autoAssignTicket(): Promise<string | null> {
  const activeMembers = await getActiveTeamMembers();
  if (activeMembers.length === 0) return null;

  const strategy = await getAssignmentStrategy();

  if (strategy === "round_robin") {
    return assignRoundRobin(activeMembers);
  }

  return assignLeastLoaded(activeMembers);
}
