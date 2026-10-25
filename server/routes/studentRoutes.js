import { Router } from "express";
import mongoose from "mongoose";
import Student from "../models/Student.js";

const router = Router();
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateStudent(body) {
  const errors = [];
  const name = String(body.name ?? "").trim();
  const rollNumber = String(body.rollNumber ?? "").trim();
  const email = String(body.email ?? "").trim();
  const department = String(body.department ?? "");
  const semester = Number(body.semester);
  if (name.length < 2 || name.length > 80) errors.push("Name must be between 2 and 80 characters.");
  if (!/^[a-zA-Z\s.'-]+$/.test(name)) errors.push("Name can contain letters, spaces, apostrophes, dots, and hyphens only.");
  if (!/^[a-zA-Z0-9/-]{1,20}$/.test(rollNumber)) errors.push("Roll number must be 1–20 letters, numbers, / or -.");
  if (!emailPattern.test(email) || email.length > 120) errors.push("Enter a valid email address.");
  if (!["Information Technology", "Computer Science", "Commerce", "Arts", "Science"].includes(department)) errors.push("Choose a valid department.");
  if (!Number.isInteger(semester) || semester < 1 || semester > 6) errors.push("Semester must be a whole number from 1 to 6.");
  const phone = String(body.phone ?? "").trim();
  if (phone && !/^[+0-9()\s-]{7,15}$/.test(phone)) errors.push("Enter a valid phone number (7–15 characters).");
  return errors;
}

function sendError(res, error) {
  if (error?.code === 11000) {
    const field = Object.keys(error.keyPattern || {})[0];
    return res.status(409).json({ message: `${field === "rollNumber" ? "Roll number" : "Email"} already exists.` });
  }
  if (error instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({ message: Object.values(error.errors).map(e => e.message).join(" ") });
  }
  return res.status(500).json({ message: "Server error while processing the student record." });
}

// GET /api/students?search=term
router.get("/", async (req, res) => {
  try {
    const search = String(req.query.search ?? "").trim();
    const filter = search ? { $or: [
      { name: { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } },
      { rollNumber: { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } },
      { email: { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } }
    ] } : {};
    const students = await Student.find(filter).sort({ createdAt: -1 });
    res.json(students);
  } catch (error) { sendError(res, error); }
});

router.get("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid student ID." });
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found." });
    res.json(student);
  } catch (error) { sendError(res, error); }
});

router.post("/", async (req, res) => {
  const errors = validateStudent(req.body);
  if (errors.length) return res.status(400).json({ message: errors.join(" ") });
  try {
    const student = await Student.create({
      name: req.body.name.trim(),
      rollNumber: req.body.rollNumber.trim().toUpperCase(),
      email: req.body.email.trim().toLowerCase(),
      department: req.body.department,
      semester: Number(req.body.semester),
      phone: String(req.body.phone ?? "").trim()
    });
    res.status(201).json({ message: "Student added successfully.", student });
  } catch (error) { sendError(res, error); }
});

router.put("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid student ID." });
  const errors = validateStudent(req.body);
  if (errors.length) return res.status(400).json({ message: errors.join(" ") });
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, {
      name: req.body.name.trim(),
      rollNumber: req.body.rollNumber.trim().toUpperCase(),
      email: req.body.email.trim().toLowerCase(),
      department: req.body.department,
      semester: Number(req.body.semester),
      phone: String(req.body.phone ?? "").trim()
    }, { new: true, runValidators: true });
    if (!student) return res.status(404).json({ message: "Student not found." });
    res.json({ message: "Student updated successfully.", student });
  } catch (error) { sendError(res, error); }
});

router.delete("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid student ID." });
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found." });
    res.json({ message: "Student deleted successfully." });
  } catch (error) { sendError(res, error); }
});

export default router;