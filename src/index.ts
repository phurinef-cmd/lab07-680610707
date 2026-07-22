import express, { type Request, type Response } from 'express';

// import middleware
import morgan from "morgan";

// import database
import { students } from '@db/db.js';
import { type Student, type Course } from "@libs/types.js";
import {
  zStudentDeleteBody,
  zStudentPostBody,
  zStudentPutBody,
} from "@libs/studentValidator.js";

const app = express();
const port = process.env.PORT || 3000;

// use middleware
app.use(morgan("dev", { immediate: false }));
app.use(express.json());    // parses request's payload into 'req.body'

// Endpoints
app.get("/", (req: Request, res: Response) => {
  res.send("API services for Student Data");
});

// GET /students
// get students (by program)
app.get("/api/students", (req: Request, res: Response) => {
  try {
    const { studentId, program } = req.query;
    let result = students;
    if (studentId) {
      result = result.filter(
        (student) => student.studentId === studentId
      );
    }
    if (program) {
      result = result.filter(
        (student) => student.program === program
      );
    }
    return res.json({
      success: true,
      count: result.length,
      data: result,
    });
  } catch (err) {
    return res.json({
      success: false,
      message: "Something is wrong",
    });
  }
});

// POST /students, body = {new student data}
// add a new student
app.post("/api/students", (req: Request, res: Response) => {
  try {
    const body = req.body as Student;

    // validate req.body with predefined validator
    const result = zStudentPostBody.safeParse(body); // check zod
    if (!result.success) {
      return res.json({
        message: "Validation failed",
        errors: result.error.issues[0]?.message,
      });
    }

    //check duplicate studentId
    const found = students.find(
      (student) => student.studentId === body.studentId
    );
    if (found) {
      return res.json({
        success: false,
        message: "Student is already exists",
      });
    }

    // add new student
    const new_student = body;
    students.push(new_student);

    // add response header 'Link'
    res.set("Link", `/students/${new_student.studentId}`);

    return res.json({
      success: true,
      data: new_student,
    });
    // return res.json({ ok: true, message: "successfully" });
  } catch (err) {
    return res.json({
      success: false,
      message: "Somthing is wrong, please try again",
      error: err,
    });
  }
});

// PUT /students, body = {studentId}
// Update specified student
app.put("/api/students", (req: Request, res: Response) => {
  try {
    const body = req.body as Student;

    // validate req.body with predefined validator
    const result = zStudentPutBody.safeParse(body); // check zod
    if (!result.success) {
      return res.json({
        message: "Validation failed",
        errors: result.error.issues[0]?.message,
      });
    }

    //check duplicate studentId
    const foundIndex = students.findIndex(
      (student) => student.studentId === body.studentId
    );

    if (foundIndex === -1) {
      return res.json({
        success: false,
        message: "Student does not exists",
      });
    }

    // update student data
    students[foundIndex] = { ...students[foundIndex], ...body };

    // add response header 'Link'
    res.set("Link", `/students/${body.studentId}`);

    return res.json({
      success: true,
      message: `Student ${body.studentId} has been updated successfully`,
      data: students[foundIndex],
    });
  } catch (err) {
    return res.json({
      success: false,
      message: "Somthing is wrong, please try again",
      error: err,
    });
  }
});

// DELETE /students, body = {studentId}
app.delete("/api/students", (req: Request, res: Response) => {
  const body = req.body;
  const result = zStudentDeleteBody.safeParse(body);
  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: result.error.issues[0].message,
    });
  }
  const index = students.findIndex(
    (student) => student.studentId === body.studentId
  );
  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: "Student not found",
    });
  }
  students.splice(index, 1);
  return res.json({
    success: true,
    message: "Student deleted successfully",
  });
});

// GET /api/me
app.get("/api/me", (req: Request, res: Response) => {
  res.json({
    studentId: "680610707",
    firstName: "Phurin",
    lastName: "Bansupa",
  });
});

app.listen(port, async () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});

export default app;