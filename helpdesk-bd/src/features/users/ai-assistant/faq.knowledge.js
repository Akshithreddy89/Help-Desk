/**
 * In-memory verified Helpdesk knowledge base for FAQ topic matches.
 */
const FAQ_TOPICS = [
  {
    id: "wifi_issues",
    title: "Wi-Fi & Connectivity",
    keywords: ["wifi", "wi-fi", "internet", "signal", "connect", "network", "offline", "disconnect"],
    solution: `**Wi-Fi Troubleshooting Steps:**\n1. **Forget & Reconnect**: Open Network Settings, select your office/home Wi-Fi, click "Forget", and reconnect with your credentials.\n2. **Restart Network Adapter**: Turn Wi-Fi OFF for 10 seconds, then turn it back ON.\n3. **Flush DNS (Windows)**: Open Command Prompt and type \`ipconfig /flushdns\` then press Enter.\n4. **Check VPN**: If your VPN is stuck in a reconnect loop, disconnect and reconnect to the nearest gateway.`
  },
  {
    id: "login_issues",
    title: "Login & Password",
    keywords: ["login", "password", "sign in", "signin", "locked", "credentials", "auth", "token", "2fa"],
    solution: `**Login & Password Assistance:**\n1. **Forgot Password**: Use the "Forgot Password" link on the login page to receive a secure reset link via email.\n2. **Check Spam/Junk**: Password reset emails are sent from \`HelpDesk Support\`—please check your spam folder.\n3. **Clear Browser Cache**: Clear stored cookies and cache for the helpdesk domain and refresh.\n4. **Account Inactive**: If you recently registered, verify your email or check if an administrator has approved your account.`
  },
  {
    id: "appointment_booking",
    title: "Appointments & Meetings",
    keywords: ["appointment", "meeting", "agent", "schedule", "slot", "calendar", "call"],
    solution: `**Scheduling Support Appointments:**\n1. **Booking Link**: Dedicated support agents have public booking links to schedule one-on-one video assistance.\n2. **Available Slots**: Navigate to the agent's scheduling page, select a date, and choose an available 30-minute time slot.\n3. **Confirmation**: You will receive an email confirmation with the meeting link once booked.`
  },
  {
    id: "billing_inquiries",
    title: "Billing & Invoices",
    keywords: ["bill", "billing", "invoice", "payment", "receipt", "charge", "refund", "subscription"],
    solution: `**Billing & Invoice Help:**\n1. **View Invoices**: Access your Profile > Billing section to download PDF copies of your monthly invoices.\n2. **Payment Methods**: We support credit cards and corporate invoices. Updates can be made under Account Settings.\n3. **Disputes/Refunds**: For incorrect charges or line items, please raise a ticket under the "Billing" category.`
  },
  {
    id: "ticket_lifecycle",
    title: "Ticket Statuses & SLA",
    keywords: ["status", "sla", "priority", "hours", "response", "time", "resolved", "closed"],
    solution: `**Ticket Status Guide:**\n- **Open**: Ticket received and queued for review.\n- **In Progress**: An agent has been assigned and is actively investigating your issue.\n- **Resolved**: A solution or fix has been provided. You can reply with a comment if you need further help.\n- **Closed**: The ticket is finalized and archived.`
  }
];

function findFaqMatch(query) {
  if (typeof query !== "string" || !query.trim()) return null;
  const normalizedQuery = query.toLowerCase();
  return FAQ_TOPICS.find((topic) =>
    topic.keywords.some((keyword) => normalizedQuery.includes(keyword))
  ) || null;
}

module.exports = {
  FAQ_TOPICS,
  findFaqMatch,
};
