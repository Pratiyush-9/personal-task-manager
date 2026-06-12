import { useEffect, useState } from "react";
import {
  getTasks,
  createTask,
  updateTask,
  toggleTask,
  deleteTask,
} from "./api/taskApi";
import "./App.css";

function App() {
  const [tasks, setTasks] = useState([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    const data = await getTasks();
    setTasks(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("Title is required");
      return;
    }

    if (editingId) {
      await updateTask(editingId, {
        title,
        description,
        dueDate,
      });

      setEditingId(null);
    } else {
      await createTask({
        title,
        description,
        dueDate,
      });
    }

    setTitle("");
    setDescription("");
    setDueDate("");

    loadTasks();
  };

  const handleToggle = async (id) => {
    await toggleTask(id);
    loadTasks();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this task?")) return;

    await deleteTask(id);
    loadTasks();
  };

  const handleEdit = (task) => {
    setEditingId(task.id);
    setTitle(task.title);
    setDescription(task.description);
    setDueDate(task.dueDate);
  };

  const filteredTasks = tasks
    .filter((task) =>
      task.title.toLowerCase().includes(search.toLowerCase())
    )
    .filter((task) => {
      if (filter === "active") return !task.completed;
      if (filter === "completed") return task.completed;
      return true;
    });

  return (
    <div className="container">
      <h1>Personal Task Manager</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Task Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          placeholder="Task Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />

        <button type="submit">
          {editingId ? "Update Task" : "Add Task"}
        </button>
      </form>

      <div className="stats">
        <div className="stat-card">
          <h3>{tasks.length}</h3>
          <p>Total Tasks</p>
        </div>

        <div className="stat-card">
          <h3>
            {tasks.filter((task) => !task.completed).length}
          </h3>
          <p>Active Tasks</p>
        </div>

        <div className="stat-card">
          <h3>
            {tasks.filter((task) => task.completed).length}
          </h3>
          <p>Completed Tasks</p>
        </div>
      </div>

      <div className="search-filter">
        <input
          type="text"
          placeholder="Search tasks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="filters">
          <button
            type="button"
            onClick={() => setFilter("all")}
          >
            All
          </button>

          <button
            type="button"
            onClick={() => setFilter("active")}
          >
            Active
          </button>

          <button
            type="button"
            onClick={() => setFilter("completed")}
          >
            Completed
          </button>
        </div>
      </div>

      <h2>Tasks</h2>

      {filteredTasks.length === 0 ? (
        <p>No tasks found</p>
      ) : (
        filteredTasks.map((task) => (
          <div className="task-card" key={task.id}>
            <h3>{task.title}</h3>

            <p>{task.description}</p>

            <p>
              <strong>Due:</strong> {task.dueDate}
            </p>

            <span
              className={
                task.completed
                  ? "status completed"
                  : "status active"
              }
            >
              {task.completed
                ? "Completed"
                : "Active"}
            </span>

            <div className="task-actions">
              <button
                className="complete-btn"
                onClick={() =>
                  handleToggle(task.id)
                }
              >
                {task.completed
                  ? "Mark Active"
                  : "Mark Complete"}
              </button>

              <button
                type="button"
                onClick={() =>
                  handleEdit(task)
                }
              >
                Edit
              </button>

              <button
                className="delete-btn"
                onClick={() =>
                  handleDelete(task.id)
                }
              >
                Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default App;