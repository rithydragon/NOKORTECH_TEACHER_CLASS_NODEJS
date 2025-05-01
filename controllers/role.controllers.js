import db from "../config/db.js";

// 🎯 CREATE ROLE
export const createRole = (req, res) => {
    const { role_name } = req.body;
    db.query("INSERT INTO ROLES (ROLE_NAME) VALUES (?)", [role_name], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: "Role created successfully" });
    });
};

// 🎯 GET ALL ROLES
export const getAllRoles = (req, res) => {
    db.query("SELECT * FROM ROLES", (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

// 🎯 UPDATE ROLE
export const updateRole = (req, res) => {
    const { role_name } = req.body;
    const { id } = req.params;
    db.query("UPDATE ROLES SET ROLE_NAME = ? WHERE ID = ?", [role_name, id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Role updated successfully" });
    });
};

// 🎯 DELETE ROLE
export const deleteRole = (req, res) => {
    const { id } = req.params;
    db.query("DELETE FROM ROLES WHERE ID = ?", [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Role deleted successfully" });
    });
};
