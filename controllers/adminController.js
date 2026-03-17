const pool = require("../config/db");
const bcrypt = require("bcrypt");

const getUsers = async (req, res) => {
  try {
    const users = await pool.query("SELECT * FROM users ORDER BY id");

    if (!users.rows.length) {
      return res.status(200).json({
        success: false,
        message: "No users yet!",
      });
    }

    return res.status(200).json({
      success: true,
      message: "All users:",
      data: users.rows,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error!",
    });
  }
};

const createUser = async (req, res) => {
  try {
    const { email, password, department, roles, empId } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required!",
      });
    }

    const userExists = await pool.query(
      "SELECT email FROM users WHERE email = $1",
      [email],
    );

    if (userExists.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exixts!",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const fields = {
      email,
      password: hashedPassword,
      department,
      roles,
      empId,
    };

    const fieldsSent = Object.entries(fields).filter(
      ([key, value]) => value !== undefined,
    );

    const insertClause = fieldsSent.map(([key]) => key).join(", ");

    const valuesClause = fieldsSent
      .map((value, index) => `$${index + 1}`)
      .join(", ");

    const values = fieldsSent.map(([key, value]) => value);
    console.log("Values sent:", values);

    const newUser = await pool.query(
      `INSERT INTO users(${insertClause}) VALUES(${valuesClause})`,
      values,
    );

    return res.status(201).json({
      success: true,
      message: "User successfully created!",
      data: newUser.rows[0],
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error!",
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id: userId } = req.params;
    const { email, full_name, department, emp_id, roles } = req.body;
    const fields = { email, full_name, department, emp_id, roles };

    const updatedFields = Object.entries(fields).filter(
      ([key, value]) => value !== undefined,
    );

    if (!updatedFields.length) {
      return res.status(400).json({
        success: false,
        message: "No fields to update!",
      });
    }

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Provide user ID!",
      });
    }

    const user = await pool.query("SELECT FROM users WHERE id = $1", [userId]);

    if (!user.rows.length) {
      return res.status(404).json({
        success: false,
        message: "No user with this ID!",
      });
    }

    const setClause = updatedFields
      .map(([key], index) => `${key} = $${index + 1}`)
      .join(", ");

    const values = updatedFields.map(([key, value]) => value);
    values.push(userId);

    const updatedUser = await pool.query(
      `UPDATE users SET ${setClause} WHERE id = $${values.length} RETURNING *`,
      values,
    );

    return res.status(200).json({
      success: true,
      message: "User updated successfully!",
      data: updatedUser.rows[0],
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error!",
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id: userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Provide user ID!",
      });
    }

    const user = await pool.query("SELECT FROM users WHERE id = $1", [userId]);

    if (!user.rows.length) {
      return res.status(404).json({
        success: false,
        message: "No user with this ID!",
      });
    }

    await pool.query("DELETE FROM users WHERE id = $1", [userId]);

    return res.status(200).json({
      success: true,
      message: "User successfully deleted!",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error!",
    });
  }
};

const extendDueDate = async (req, res) => {
  try {
    const { id: taskId } = req.params;
    const { dueDate } = req.body;

    if (!dueDate) {
      return res.status(400).json({
        success: false,
        message: "No detail to update!",
      });
    }

    if (!taskId) {
      return res.status(400).json({
        success: false,
        message: "Enter task ID!",
      });
    }

    const task = await pool.query(
      "SELECT id, due_date FROM tasks WHERE id = $1",
      [taskId],
    );

    if (!task.rows.length) {
      return res.status(404).json({
        success: false,
        message: "No task with this ID!",
      });
    }

    const updatedTask = await pool.query(
      "UPDATE tasks SET due_date = $1 WHERE id = $2 RETURNING *",
      [dueDate, taskId],
    );

    return res.status(400).json({
      success: true,
      message: "Due date extended!",
      data: updatedTask.rows[0],
    });
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: "Internal server error!"
    });
  }
};

module.exports = {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  extendDueDate,
};
