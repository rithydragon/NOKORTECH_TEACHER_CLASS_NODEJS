import db from "../config/db.js";

// 🎯 CREATE PERMISSION
export const createPermission = (req, res) => {
    const { permission_name } = req.body;
    db.query("INSERT INTO PERMISSIONS (PERMISSION_NAME) VALUES (?)", [permission_name], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: "Permission created successfully" });
    });
};

// 🎯 GET ALL PERMISSIONS
export const getAllPermissions = (req, res) => {
    db.query("SELECT * FROM PERMISSIONS", (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

// 🎯 UPDATE PERMISSION
export const updatePermission = (req, res) => {
    const { permission_name } = req.body;
    const { id } = req.params;
    db.query("UPDATE PERMISSIONS SET PERMISSION_NAME = ? WHERE ID = ?", [permission_name, id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Permission updated successfully" });
    });
};

// 🎯 DELETE PERMISSION
export const deletePermission = (req, res) => {
    const { id } = req.params;
    db.query("DELETE FROM PERMISSIONS WHERE ID = ?", [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Permission deleted successfully" });
    });
};
