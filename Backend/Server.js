import express from "express";
import mysql from "mysql2/promise";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config(); // ✅ Load .env variables

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Use values from .env
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// ✅ Use secret from .env
const SECRET = process.env.JWT_SECRET || "supersecretkey";

// ------------------ AUTH MIDDLEWARE ------------------
function authMiddleware(req, res, next) {
  const header = req.headers["authorization"];
  if (!header) return res.status(401).json({ message: "No token provided" });

  const token = header.split(" ")[1];
  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = decoded;
    next();
  });
}

// ✅ Test Route
app.get("/", (req, res) => {
  res.send("✅ Backend server is running!");
});

// ✅ Get all users
app.get("/api/users", authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, name, email, role, faculty, created_at FROM users"
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Error fetching users" });
  }
});

// ✅ REGISTER
app.post("/auth/register", async (req, res) => {
  try {
    const { name, email, password, role, faculty } = req.body;
    console.log("Registration request:", req.body);

    const [existing] = await db.query(
      "SELECT * FROM users WHERE email=?",
      [email]
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashed = await bcrypt.hash(password, 10);
    await db.query(
      "INSERT INTO users (name, email, password, role, faculty) VALUES (?, ?, ?, ?, ?)",
      [name, email, hashed, role, faculty]
    );

    console.log("✅ User inserted successfully");
    res.json({ message: "Registration successful" });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Registration failed" });
  }
});

// ✅ LOGIN
app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const [rows] = await db.query("SELECT * FROM users WHERE email=?", [email]);

    if (rows.length === 0)
      return res.status(401).json({ message: "Invalid credentials" });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        faculty: user.faculty,
      },
      SECRET,
      { expiresIn: "12h" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        faculty: user.faculty,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Login failed" });
  }
});

// ✅ COURSES
app.post("/api/courses", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "pl") return res.status(403).json({ message: "Only Program Leaders can add courses" });

    const { name, code, faculty } = req.body;
    if (!name || !code || !faculty) return res.status(400).json({ message: "All fields are required" });

    await db.query("INSERT INTO courses (name, code, faculty) VALUES (?, ?, ?)", [name, code, faculty]);
    res.json({ message: "Course added successfully" });
  } catch (err) {
    console.error("Add course error:", err);
    res.status(500).json({ message: "Error adding course" });
  }
});

// Get courses
app.get("/api/courses", authMiddleware, async (req, res) => {
  try {
    let query = "SELECT * FROM courses";
    let params = [];

    if (req.user.role === "pl" || req.user.role === "prl") {
      query += " WHERE faculty=?";
      params = [req.user.faculty];
    } else if (req.user.role === "lecturer") {
      query += " WHERE faculty=?"; // Only lecturer's faculty courses
      params = [req.user.faculty];
    }

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error("Fetch courses error:", err);
    res.status(500).json({ message: "Error fetching courses" });
  }
});
// CLASSES 
// Add a class (PL only)
app.post("/api/classes", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "pl") {
      return res.status(403).json({ message: "Only program leaders can add classes" });
    }

    const { course_id, name, scheduled_time, venue, total_registered, lecturer_id } = req.body;

    if (!course_id || !name || !lecturer_id) {
      return res.status(400).json({ message: "course_id, name, and lecturer_id are required" });
    }

    // Insert the class
    const [result] = await db.query(
      `INSERT INTO classes
        (course_id, name, scheduled_time, venue, total_registered, assigned_lecturer_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [course_id, name, scheduled_time || null, venue || null, total_registered || 0, lecturer_id]
    );

    // Fetch the newly created class with lecturer info
    const [[newClass]] = await db.query(
      `SELECT cl.id, cl.name, cl.scheduled_time, cl.venue, cl.total_registered,
              cr.name AS course_name, cr.code AS course_code,
              u.id AS lecturer_id, u.name AS lecturer_name
       FROM classes cl
       JOIN courses cr ON cl.course_id = cr.id
       LEFT JOIN users u ON cl.assigned_lecturer_id = u.id
       WHERE cl.id = ?`,
      [result.insertId]
    );

    // Return the new class immediately
    res.json({ message: "Class created successfully", class: newClass });
  } catch (err) {
    console.error("Error creating class:", err);
    res.status(500).json({ message: "Error creating class" });
  }
});

// GET classes assigned to the logged-in lecturer
app.get("/api/my-classes", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "lecturer") {
      return res.status(403).json({ message: "Only lecturers can access their classes" });
    }

    const [rows] = await db.query(
      `SELECT cl.id, cl.name, cl.scheduled_time, cl.venue, cl.total_registered,
              c.name AS course_name, c.code AS course_code
       FROM classes cl
       JOIN courses c ON cl.course_id = c.id
       WHERE cl.assigned_lecturer_id = ?`,
      [req.user.id]
    );

    res.json(rows);
  } catch (err) {
    console.error("Fetch my-classes error:", err);
    res.status(500).json({ message: "Error fetching your classes" });
  }
});


// ✅ REPORTS

// POST: Create a report (lecturer submits)
app.post("/api/reports", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "lecturer") {
      return res.status(403).json({ message: "Only lecturers can submit reports" });
    }

    const { class_name, topic_taught, actual_students_present } = req.body;
    if (!class_name || !topic_taught) {
      return res.status(400).json({ message: "class_name and topic_taught are required" });
    }

    await db.query(
      `INSERT INTO reports (lecturer_id, class_name, topic_taught, actual_students_present, status)
       VALUES (?, ?, ?, ?, 'pending')`,
      [req.user.id, class_name, topic_taught, actual_students_present || 0]
    );

    res.json({ message: "Report submitted successfully" });
  } catch (err) {
    console.error("Error submitting report:", err);
    res.status(500).json({ message: "Error submitting report" });
  }
});

// GET: Fetch reports (everyone sees different data)
app.get("/api/reports", authMiddleware, async (req, res) => {
  try {
    let query = `
    SELECT r.id, r.class_name, r.topic_taught, r.actual_students_present,
       r.status, r.prl_feedback,
       u.name AS lecturer_name
FROM reports r
JOIN users u ON r.lecturer_id = u.id
WHERE r.lecturer_id = ?


    `;

    let params = [];

    if (req.user.role === "lecturer") {
      query += " WHERE r.lecturer_id = ?";
      params.push(req.user.id);
    } else if (req.user.role === "prl") {
      query += " WHERE u.faculty = ?";
      params.push(req.user.faculty);
    }

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching reports:", err);
    res.status(500).json({ message: "Error fetching reports" });
  }
});
app.post("/api/reports/:id/feedback", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "prl") {
      return res.status(403).json({ message: "Only PRLs can give feedback" });
    }

    const { feedback, status } = req.body;
    const reportId = req.params.id;

    await db.query(
      `UPDATE reports
       SET prl_feedback = ?, status = ?
       WHERE id = ?`,
      [feedback || "", status || "reviewed", reportId]
    );

    res.json({ message: "Feedback submitted" });
  } catch (err) {
    console.error("Error submitting feedback:", err);
    res.status(500).json({ message: "Error submitting feedback" });
  }
});




// ✅ FACULTY OVERVIEW
app.get("/api/faculty/:facultyName", authMiddleware, async (req, res) => {
  const { facultyName } = req.params;
  try {
    const [[courses]] = await db.query(
      "SELECT COUNT(*) as count FROM courses WHERE faculty=?",
      [facultyName]
    );
    const [[classes]] = await db.query(
      `
      SELECT COUNT(*) as count
      FROM classes cl
      JOIN courses c ON cl.course_id=c.id
      WHERE c.faculty=?
    `,
      [facultyName]
    );
    const [[reports]] = await db.query(
      `
      SELECT COUNT(*) as count
      FROM reports r
      JOIN classes cl ON r.class_id=cl.id
      JOIN courses c ON cl.course_id=c.id
      WHERE c.faculty=?
    `,
      [facultyName]
    );

    res.json({
      coursesCount: courses.count,
      classesCount: classes.count,
      reportsCount: reports.count,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching faculty data" });
  }
});

// ✅ START SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
