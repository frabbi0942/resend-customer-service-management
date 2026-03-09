import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create default labels
  const labels = [
    { name: "Bug", color: "#EF4444" },
    { name: "Feature Request", color: "#8B5CF6" },
    { name: "Question", color: "#3B82F6" },
    { name: "Billing", color: "#F59E0B" },
    { name: "Urgent", color: "#DC2626" },
  ];

  for (const label of labels) {
    await prisma.label.upsert({
      where: { name: label.name },
      update: {},
      create: label,
    });
  }

  // Create default settings
  const settings = [
    { key: "assignment_strategy", value: "least_loaded" },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }

  // Create default canned responses
  const cannedResponses = [
    {
      title: "Greeting",
      body: "Hi there! Thank you for reaching out to us. I'd be happy to help you with this.",
    },
    {
      title: "Need More Info",
      body: "Thank you for contacting us. Could you please provide more details about the issue you're experiencing? This will help us assist you more effectively.",
    },
    {
      title: "Issue Resolved",
      body: "I'm glad we were able to resolve this for you! If you have any other questions, please don't hesitate to reach out. Have a great day!",
    },
    {
      title: "Escalation",
      body: "I understand this is an important issue. I'm escalating this to our senior team for further review. You should hear back from us within 24 hours.",
    },
  ];

  for (const response of cannedResponses) {
    const existing = await prisma.cannedResponse.findFirst({
      where: { title: response.title },
    });
    if (!existing) {
      await prisma.cannedResponse.create({ data: response });
    }
  }

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
