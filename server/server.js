const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const tasksFile = path.join(__dirname, "data", "tasks.json");

// Read tasks
const getTasks = () => {
  const data = fs.readFileSync(tasksFile, "utf8");
  return JSON.parse(data);
};

// Save tasks
const saveTasks = (tasks) => {
  fs.writeFileSync(tasksFile, JSON.stringify(tasks, null, 2));
};

// Home route
app.get("/", (req, res) => {
  res.send("Task Manager API Running");
});

// Get all tasks
app.get("/tasks", (req, res) => {
  const tasks = getTasks();
  res.json(tasks);
});

// Create task
app.post("/tasks", (req, res) => {
  const tasks = getTasks();

  const newTask = {
    id: Date.now().toString(),
    title: req.body.title,
    description: req.body.description || "",
    dueDate: req.body.dueDate || "",
    completed: false,
important: req.body.important || false,
createdAt: new Date().toISOString(),
  };

  tasks.unshift(newTask);

  saveTasks(tasks);

  res.status(201).json(newTask);
});

// Update task
app.put("/tasks/:id", (req, res) => {
  const tasks = getTasks();

  const index = tasks.findIndex(
    (task) => task.id === req.params.id
  );

  if (index === -1) {
    return res.status(404).json({
      message: "Task not found",
    });
  }

  tasks[index] = {
    ...tasks[index],
    title: req.body.title,
    description: req.body.description,
    dueDate: req.body.dueDate,
  };

  saveTasks(tasks);

  res.json(tasks[index]);
});

// Toggle task completion
app.patch("/tasks/:id/toggle", (req, res) => {
  const tasks = getTasks();

  const task = tasks.find(
    (t) => t.id === req.params.id
  );

  if (!task) {
    return res.status(404).json({
      message: "Task not found",
    });
  }

  task.completed = !task.completed;

  saveTasks(tasks);

  res.json(task);
});

// Toggle important
app.patch("/tasks/:id/important", (req, res) => {
  const tasks = getTasks();

  const task = tasks.find(
    (t) => t.id === req.params.id
  );

  if (!task) {
    return res.status(404).json({
      message: "Task not found",
    });
  }

  task.important = !task.important;

  saveTasks(tasks);

  res.json(task);
}); 

// Delete task
app.delete("/tasks/:id", (req, res) => {
  const tasks = getTasks();

  const filteredTasks = tasks.filter(
    (task) => task.id !== req.params.id
  );

  saveTasks(filteredTasks);

  res.json({
    message: "Task deleted successfully",
  });
});

app.patch("/tasks/reorder", (req, res) => {
  const reorderedTasks = req.body;

  saveTasks(reorderedTasks);

  res.json({
    message: "Tasks reordered successfully",
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});