import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  name: { type: String, required: [true, "Student name is required"], trim: true, minlength: 2, maxlength: 80 },
  rollNumber: { type: String, required: [true, "Roll number is required"], trim: true, uppercase: true, maxlength: 20, unique: true },
  email: { type: String, required: [true, "Email is required"], trim: true, lowercase: true, maxlength: 120, unique: true },
  department: { type: String, required: [true, "Department is required"], enum: ["Information Technology", "Computer Science", "Commerce", "Arts", "Science"] },
  semester: { type: Number, required: [true, "Semester is required"], min: 1, max: 6, validate: Number.isInteger },
  phone: { type: String, trim: true, default: "", maxlength: 15 }
}, { timestamps: true });

export default mongoose.model("Student", studentSchema);