const fs = require("fs");
const path = require("path");

const EMAILS_FILE = path.join(__dirname, "../data/emails.json");

// Helper: read emails
const readEmails = () => {
  if (!fs.existsSync(EMAILS_FILE)) {
    fs.writeFileSync(EMAILS_FILE, JSON.stringify([]));
  }
  const data = fs.readFileSync(EMAILS_FILE, "utf-8");
  return JSON.parse(data);
};

// Helper: write emails
const writeEmails = (emails) => {
  fs.writeFileSync(EMAILS_FILE, JSON.stringify(emails, null, 2));
};

// Helper: validate email
const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// Controller: subscribe
exports.subscribe = (req, res) => {
  try {
    const email = req.body.EMAIL?.trim().toLowerCase();

    // 1. Check empty
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // 2. Validate format
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // 3. Read existing emails
    const emails = readEmails();

    // 4. Duplicate check
    if (emails.includes(email)) {
      return res.status(409).json({ message: "Email already subscribed" });
    }

    // 5. Save email
    emails.push(email);
    writeEmails(emails);

    return res.status(201).json({ message: "Successfully subscribed" });
  } catch (error) {
    console.error("Newsletter error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
