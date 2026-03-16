const pool = require("../config/db");

const updateProfile = async (req, res) => {
  try {
    const { id: userId } = req.user

    if (!userId) {
        return res.status(400).json({
            success: false,
            message: 'No user ID!'
        })
    }

    const { fullName, phone, empId, department } = req.body;

    if (!fullName || !department || !empId || !phone) {
        return res.status(400).json({
            success: false,
            message: 'Fill all details!'
        })
    }

    const empIdExist = await pool.query(
        'SELECT emp_id FROM users WHERE emp_id = $1',
        [empId]
    )

    if (empIdExist.rows.length > 0 && empIdExist.rows[0].emp_id !== empId) {
        return res.status(409).json({
            success: false,
            message: 'ID taken, choose another one!'
        })
    }

    const user = await pool.query(
        'SELECT id FROM users WHERE id = $1',
        [userId]
    );

    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'No user with this ID!'
        })
    }

    if (userId !== user.rows[0].id) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized to perform this action!'
        })
    }

    await pool.query(
        'UPDATE users SET full_name = $1, phone = $2, emp_id = $3, department = $4 WHERE id = $5',
        [fullName, phone, empId, department, userId]
    )

    return res.status(200).json({
        success: true,
        message: 'Profile updated'
    })
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
    updateProfile
}