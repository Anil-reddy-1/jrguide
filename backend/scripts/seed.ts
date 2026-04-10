/**
 * seed.ts — Seeds Firestore with realistic onboarding data.
 *
 * Usage: npx tsx scripts/seed.ts
 */
import { config } from "dotenv";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

config();
config({ path: "src/.env", override: false });

const firebaseApp =
  getApps()[0] ??
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
      privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
    }),
    projectId: process.env.FIREBASE_PROJECT_ID!,
  });

const db = getFirestore(firebaseApp);

/* ─── Demo Users ────────────────────────────────────────────────── */
const USERS = [
  { id: "demo-employee-001", email: "sarah.mitchell@company.com", displayName: "Sarah Mitchell", role: "employee", team: "Engineering", joinDate: "2026-04-07", status: "in_progress" },
  { id: "demo-employee-002", email: "alex.johnson@company.com", displayName: "Alex Johnson", role: "employee", team: "Design", joinDate: "2026-03-20", status: "in_progress" },
  { id: "demo-employee-003", email: "emily.park@company.com", displayName: "Emily Park", role: "employee", team: "Marketing", joinDate: "2026-03-10", status: "overdue" },
  { id: "demo-employee-004", email: "raj.patel@company.com", displayName: "Raj Patel", role: "employee", team: "Engineering", joinDate: "2026-04-01", status: "pending" },
  { id: "demo-employee-005", email: "maria.garcia@company.com", displayName: "Maria Garcia", role: "employee", team: "Analytics", joinDate: "2026-02-15", status: "in_progress" },
  { id: "demo-employee-006", email: "tom.wilson@company.com", displayName: "Tom Wilson", role: "employee", team: "Sales", joinDate: "2026-01-10", status: "completed" },
  { id: "demo-employee-007", email: "lisa.chen@company.com", displayName: "Lisa Chen", role: "employee", team: "Engineering", joinDate: "2026-04-05", status: "in_progress" },
  { id: "demo-employee-008", email: "david.brown@company.com", displayName: "David Brown", role: "employee", team: "Product", joinDate: "2026-03-15", status: "in_progress" },
  { id: "demo-hr-001", email: "james.robertson@company.com", displayName: "James Robertson", role: "hr", team: "Human Resources", joinDate: "2024-01-15", status: "completed" },
];

const ONBOARDING_TEMPLATES = [
  {
    id: "tpl-general",
    name: "General Onboarding",
    description: "Standard onboarding template for all departments",
    active: true,
    tasks: [
      { title: "Complete your profile", description: "Fill in personal details and emergency contacts in the HRMS portal.", category: "Setup", dayOffset: 0, priority: "high" },
      { title: "Read company handbook", description: "Review company policies, values, and code of conduct.", category: "Orientation", dayOffset: 1, priority: "medium" },
      { title: "Set up payroll details", description: "Enter bank account information and submit tax declaration.", category: "Finance", dayOffset: 2, priority: "high" },
      { title: "Complete IT security training", description: "Mandatory cybersecurity awareness training module.", category: "Training", dayOffset: 2, priority: "high" },
      { title: "Schedule 1-on-1 with manager", description: "Book a 30-minute introductory meeting with your reporting manager.", category: "Team", dayOffset: 4, priority: "medium" },
      { title: "Submit all required documents", description: "Upload government ID, address proof, tax forms, and certificates.", category: "Documents", dayOffset: 6, priority: "high" },
    ],
  },
  {
    id: "tpl-engineering",
    name: "Engineering Onboarding",
    description: "Technical onboarding for software engineers",
    active: true,
    tasks: [
      { title: "Set up VPN and development tools", description: "Install VPN client, IDE, and project-specific development tools.", category: "IT Setup", dayOffset: 0, priority: "high" },
      { title: "Clone repositories and build", description: "Checkout core repositories and ensure the local build is passing.", category: "Dev", dayOffset: 1, priority: "high" },
      { title: "Review system architecture", description: "Go through the documentation for microservices and cloud infrastructure.", category: "Knowledge", dayOffset: 3, priority: "medium" },
      { title: "Submit your first pull request", description: "Pick a 'good first issue' from Jira and submit a bug fix or minor improvement.", category: "Dev", dayOffset: 5, priority: "medium" },
      { title: "Attend technical architecture review", description: "Participate in the weekly sync with the system architects.", category: "Team", dayOffset: 10, priority: "low" },
    ],
  },
  {
    id: "tpl-sales",
    name: "Sales Onboarding",
    description: "Onboarding for account managers and sales reps",
    active: true,
    tasks: [
      { title: "Product demo walkthrough", description: "Shadow a senior sales rep during a live product demonstration.", category: "Product", dayOffset: 2, priority: "high" },
      { title: "CRM training", description: "Learn how to manage leads and deals in Salesforce.", category: "Tools", dayOffset: 3, priority: "high" },
      { title: "Review sales playbook", description: "Study our target personas, value propositions, and objection handling.", category: "Strategy", dayOffset: 5, priority: "medium" },
      { title: "Make your first outreach", description: "Draft and send 5 personalized outreach emails under supervisor guidance.", category: "Execution", dayOffset: 7, priority: "medium" },
    ],
  },
];

const addDays = (baseDate: Date, days: number) => {
  const result = new Date(baseDate);
  result.setDate(result.getDate() + days);
  return result;
};

const buildTasksFromTemplate = (employeeId: string, joinDate: string, template: (typeof ONBOARDING_TEMPLATES)[number]) => {
  const baseDate = new Date(joinDate);

  return template.tasks.map((task) => ({
    employeeId,
    title: task.title,
    description: task.description,
    category: task.category,
    dueDate: addDays(baseDate, task.dayOffset),
    status: "pending",
    dayLabel: task.dayOffset === 0 ? "Day 1" : `Day ${task.dayOffset + 1}`,
    priority: task.priority,
    templateId: template.id,
    completedAt: null,
  }));
};

/* ─── Required Documents ────────────────────────────────────────── */
function buildDocuments(userId: string) {
  return [
    { employeeId: userId, type: "Government ID", required: true, fileName: null, status: "required", uploadedAt: null },
    { employeeId: userId, type: "Address Proof", required: true, fileName: null, status: "required", uploadedAt: null },
    { employeeId: userId, type: "Tax Form (W-4)", required: true, fileName: null, status: "required", uploadedAt: null },
    { employeeId: userId, type: "Educational Certificates", required: true, fileName: null, status: "required", uploadedAt: null },
    { employeeId: userId, type: "Previous Employment Letter", required: false, fileName: null, status: "required", uploadedAt: null },
    { employeeId: userId, type: "Medical Fitness Certificate", required: false, fileName: null, status: "required", uploadedAt: null },
  ];
}

/* ─── FAQs ──────────────────────────────────────────────────────── */
const FAQS = [
  { question: "How do I apply for leave?", answer: "Navigate to the HRMS portal → Leave Management. Select the leave type, enter dates, add a reason, and submit. Your manager will be notified for approval.", category: "Leave Policy", active: true },
  { question: "When is payroll processed?", answer: "Payroll closes on the 25th of each month. Salary is credited to your bank account by the last working day of the month.", category: "Payroll", active: true },
  { question: "How do I request equipment?", answer: "Submit an IT equipment request through the Service Desk portal at https://it-portal.company.com/request. Requests are fulfilled within 3-5 business days.", category: "IT Setup", active: true },
  { question: "What is the probation policy?", answer: "The standard probation period is 6 months with monthly check-ins, a mid-probation review at 3 months, and final review at 6 months.", category: "Leave Policy", active: true },
  { question: "What are the working hours?", answer: "Standard hours are 9 AM to 6 PM with a flex window of 10 AM to 4 PM (core hours).", category: "Working Hours", active: true },
  { question: "How do I set up VPN?", answer: "Download the VPN client from https://it-portal.company.com/vpn, install it, log in with your corporate credentials, and select the nearest server.", category: "IT Setup", active: true },
  { question: "What documents do I need to submit?", answer: "You need to submit: Government ID, Address Proof, Tax Form (W-4), Educational Certificates, Previous Employment Letter (if applicable), and Medical Fitness Certificate.", category: "Documents", active: true },
  { question: "How do I contact IT support?", answer: "Email it-support@company.com, call extension 1234, or message in the #it-helpdesk Slack channel.", category: "IT Setup", active: true },
  { question: "What is the remote work policy?", answer: "Employees may work remotely up to 3 days per week with manager approval. Remote work days must be scheduled in advance. Core hours are 10 AM to 4 PM.", category: "Working Hours", active: true },
  { question: "How do I access my payslip?", answer: "Log in to the HRMS portal → Payroll → My Payslips. Payslips are available by the 1st of each month.", category: "Payroll", active: true },
];

/* ─── Contacts ──────────────────────────────────────────────────── */
const CONTACTS = [
  { name: "James Robertson", role: "HR Manager", email: "james.robertson@company.com", phone: "+1-555-0101", department: "Human Resources", availability: "Mon-Fri 9AM-6PM" },
  { name: "Priya Sharma", role: "IT Support Lead", email: "priya.sharma@company.com", phone: "+1-555-0102", department: "Information Technology", availability: "Mon-Fri 8AM-8PM" },
  { name: "Michael Torres", role: "Payroll Specialist", email: "payroll@company.com", phone: "+1-555-0103", department: "Finance", availability: "Mon-Fri 9AM-5PM" },
  { name: "Amanda Lee", role: "Facilities Manager", email: "facilities@company.com", phone: "+1-555-0104", department: "Operations", availability: "Mon-Fri 8AM-6PM" },
  { name: "Dr. Sarah Kim", role: "Company Physician", email: "health@company.com", phone: "+1-555-0105", department: "Health & Wellness", availability: "Mon-Wed-Fri 10AM-4PM" },
];

/* ─── Notifications ─────────────────────────────────────────────── */
function buildNotifications(userId: string) {
  const now = new Date();
  return [
    { userId, type: "info", title: "Welcome to JrGuide!", message: "Your onboarding journey has started. Complete your tasks to finish onboarding.", read: false, createdAt: new Date(now.getTime() - 1 * 60 * 60 * 1000) },
    { userId, type: "task", title: "New task assigned", message: "You have been assigned 'Complete your profile'. Due: Today.", read: false, createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000) },
    { userId, type: "document", title: "Document required", message: "Please upload your Government ID as soon as possible.", read: false, createdAt: new Date(now.getTime() - 5 * 60 * 60 * 1000) },
    { userId, type: "reminder", title: "Task reminder", message: "Your IT security training is due within 3 days.", read: true, createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
    { userId, type: "info", title: "Team meeting scheduled", message: "Your first team standup is scheduled for tomorrow at 10 AM.", read: true, createdAt: new Date(now.getTime() - 48 * 60 * 60 * 1000) },
  ];
}

/* ─── Seeder ────────────────────────────────────────────────────── */
async function clearCollection(name: string) {
  const snapshot = await db.collection(name).get();
  if (snapshot.empty) return 0;
  const batch = db.batch();
  snapshot.docs.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();
  return snapshot.size;
}

async function main() {
  console.log("🌱 Seeding Firestore...\n");

  // Clear existing data
  for (const col of ["users", "onboardingTemplates", "templateAssignments", "employeeTasks", "documents", "faqs", "contacts", "notifications"]) {
    const cleared = await clearCollection(col);
    if (cleared > 0) console.log(`   🗑️  Cleared ${cleared} docs from ${col}`);
  }

  // Users
  for (const user of USERS) {
    await db.collection("users").doc(user.id).set({
      ...user,
      createdAt: FieldValue.serverTimestamp(),
    });
  }
  console.log(`✅ Users: ${USERS.length} seeded`);

  // Templates
  for (const template of ONBOARDING_TEMPLATES) {
    await db.collection("onboardingTemplates").doc(template.id).set({
      ...template,
      createdBy: "demo-hr-001",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  }
  console.log(`✅ Templates: ${ONBOARDING_TEMPLATES.length} seeded`);

  // Assign templates and generate tasks for all employee users
  const defaultTemplate = ONBOARDING_TEMPLATES[0];
  const employees = USERS.filter((u) => u.role === "employee");
  let seededTaskCount = 0;

  for (const employee of employees) {
    const tasks = buildTasksFromTemplate(employee.id, employee.joinDate, defaultTemplate);
    const generatedTaskIds: string[] = [];

    for (const task of tasks) {
      const taskRef = db.collection("employeeTasks").doc();
      generatedTaskIds.push(taskRef.id);
      await taskRef.set({
        ...task,
        templateAssignmentId: `${employee.id}_${defaultTemplate.id}`,
        generatedAt: FieldValue.serverTimestamp(),
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      seededTaskCount += 1;
    }

    await db.collection("templateAssignments").doc(`${employee.id}_${defaultTemplate.id}`).set({
      employeeId: employee.id,
      templateId: defaultTemplate.id,
      templateName: defaultTemplate.name,
      assignedBy: "demo-hr-001",
      assignedAt: FieldValue.serverTimestamp(),
      status: "generated",
      generatedTaskIds,
      generatedCount: generatedTaskIds.length,
      startDate: employee.joinDate,
    });
  }
  console.log(`✅ Tasks: ${seededTaskCount} generated from templates for ${employees.length} employees`);

  // Documents (for first employee)
  const demoEmployee = USERS[0];
  const docs = buildDocuments(demoEmployee.id);
  for (const doc of docs) {
    await db.collection("documents").add({
      ...doc,
      createdAt: FieldValue.serverTimestamp(),
    });
  }
  console.log(`✅ Documents: ${docs.length} seeded`);

  // FAQs
  for (const faq of FAQS) {
    await db.collection("faqs").add({
      ...faq,
      createdAt: FieldValue.serverTimestamp(),
    });
  }
  console.log(`✅ FAQs: ${FAQS.length} seeded`);

  // Contacts
  for (const contact of CONTACTS) {
    await db.collection("contacts").add({
      ...contact,
      createdAt: FieldValue.serverTimestamp(),
    });
  }
  console.log(`✅ Contacts: ${CONTACTS.length} seeded`);

  // Notifications
  const notifs = buildNotifications(demoEmployee.id);
  for (const notif of notifs) {
    await db.collection("notifications").add(notif);
  }
  console.log(`✅ Notifications: ${notifs.length} seeded`);

  console.log("\n🎉 Seeding complete!");
}

main().catch((err) => {
  console.error("❌ Fatal error:", err);
  process.exit(1);
});
