import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Connect to DB
mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/todo-app");

// MODEL
const todoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const Todo = mongoose.model("Todo", todoSchema);

// FRONTEND
app.use(express.static(path.join(__dirname, "../public")));

// API ROUTES

// GET TODOS
app.get("/api/todos", async (_req, res) => {
  const todos = await Todo.find().sort({ createdAt: -1 });

  res.json(todos);
});

// CREATE TODO
app.post("/api/todos", async (req, res) => {
  const { title } = req.body;

  if (!title) {
    return res.status(400).json({
      message: "Title required",
    });
  }

  const todo = await Todo.create({
    title,
  });

  res.status(201).json(todo);
});

// TOGGLE TODO
app.patch("/api/todos/:id", async (req, res) => {
  const todo = await Todo.findById(req.params.id);

  if (!todo) {
    return res.status(404).json({
      message: "Todo not found",
    });
  }

  todo.completed = !todo.completed;

  await todo.save();

  res.json(todo);
});

// DELETE TODO
app.delete("/api/todos/:id", async (req, res) => {
  await Todo.findByIdAndDelete(req.params.id);

  res.json({
    message: "Deleted",
  });
});

// START SERVER
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
