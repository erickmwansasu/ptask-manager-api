const pool = require("../config/db");

const getTasks = async (req, res) => {
  try {
    const { id: userId, roles, department } = req.user;

    const allowedRoles = [5005, 5050];
    const isAuthorized = roles.some((role) => allowedRoles.includes(role));

    if (!isAuthorized) {
      return res.status(401).json({
        success: false,
        message: "Not authorized!",
      });
    }

    const user = await pool.query(
      "SELECT id, email, department FROM users WHERE id = $1",
      [userId],
    );

    if (!user.rows.length) {
      return res.status(404).json({
        success: false,
        message: "No user found",
      });
    }

    const tasks = await pool.query(
      `SELECT tasks.*, users.full_name, users.department 
      FROM tasks
      JOIN users ON tasks.user_id = users.id
      WHERE tasks.user_id = $1`,
      [userId],
    );

    if (!tasks.rows.length) {
      return res.status().json({
        success: true,
        message: "No tasks yet. Create first!",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Tasks found:",
      data: tasks.rows,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error!",
    });
  }
};

const createTask = async (req, res) => {
  try {
    const { id: userId, roles } = req.user;
    const allowedRoles = [5005, 5050];

    const isAuthorized = roles.some((role) => allowedRoles.includes(role));

    if (!isAuthorized) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to create task!",
      });
    }

    const { task_name, description, due_date, priority, status, completed } =
      req.body;

    if (!task_name || !description || !due_date) {
      return res.status(400).json({
        success: false,
        message: "Fill all task details!",
      });
    }

    const taskExists = await pool.query(
      "SELECT task_name FROM tasks WHERE task_name = $1",
      [task_name],
    );

    if (taskExists.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Task already exists!",
      });
    }

    const newTask = await pool.query(
      "INSERT INTO tasks(task_name, description, due_date, user_id, priority, status, completed) VALUES($1, $2, $3, $4, $5, $6, $7)",
      [task_name, description, due_date, userId, priority, status, completed],
    );

    return res.status(201).json({
      success: true,
      message: "Task created successfully!",
      data: newTask.rows[0],
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error!",
    });
  }
};

const updateTask = async (req, res) => {
  try {
    const { task_name, description, due_date } = req.body;

    const { roles } = req.user;
    const taskId = req.params.id;
    const allowedRoles = [5005, 5050];

    const isAuthorized = roles.some((role) => allowedRoles.includes(role));

    if (!isAuthorized) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to delete task!",
      });
    }

    const taskExists = await pool.query("SELECT id FROM tasks WHERE id = $1", [
      taskId,
    ]);

    if (!taskExists.rows.length) {
      return res.status(404).json({
        suceess: false,
        message: "Task not found!",
      });
    }

    const fields = { task_name, description, due_date };

    const updateFields = Object.entries(fields).filter(
      ([key, value]) => value !== undefined,
    );

    if (!updateFields.length) {
      return res.status(400).json({
        success: false,
        message: "No fields to to upddate",
      });
    }

    const setClause = updateFields
      .map(([key], index) => `${key} = $${index + 1}`)
      .join(", ");

    const values = updateFields.map(([key, value]) => value);

    values.push(taskId);

    const updatedTask = await pool.query(
      `UPDATE tasks SET ${setClause} WHERE id = $${values.length} RETURNING *`,
      values,
    );

    return res.status(200).json({
      success: true,
      message: "Task updated successfully",
      task: updatedTask.rows[0], //RETURNING * gives back the updated row
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error!",
    });
  }
};

const deleteTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const { id: userId, roles } = req.user;
    const allowedRoles = [5005, 5050];

    const isAuthorized = roles.some((role) => allowedRoles.includes(role));

    if (!isAuthorized) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to delete task!",
      });
    }

    const task = await pool.query(
      "SELECT id, user_id FROM tasks WHERE id = $1",
      [taskId],
    );

    if (!task.rows.length) {
      return res.status(404).json({
        success: false,
        message: "No task found!",
      });
    }

    if (task.rows[0].user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: "Forbidden. Not your department",
      });
    }

    await pool.query("DELETE FROM tasks WHERE id = $1", [taskId]);

    return res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error!",
    });
  }
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
};
