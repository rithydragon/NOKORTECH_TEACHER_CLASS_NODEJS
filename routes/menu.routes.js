import express from 'express';
const router = express.Router();
import authenticateJWT, { authenticate } from '../middlewares/auth.middlewares.js';
import db from '../config/db.js';
import path from 'path';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';

// Get current directory path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to load menu JSON
const loadMenuData = async () => {
  try {
    const data = await fs.readFile(
      path.join(__dirname, '../assets/json/menu_data.json'),
      'utf8'
    );
    return JSON.parse(data);
  } catch (err) {
    console.error('Error loading menu data:', err);
    throw new Error('Failed to load menu data');
  }
};

router.post('/api/menu_data', authenticateJWT,authenticate, async (req, res) => {
  try {
    // First get all role IDs for this user
    const [userRoles] = await db.query(`
      SELECT ROLE_ID 
      FROM USERROLES 
      WHERE USER_ID = ?
    `, [req.user.UserId]);

    if (userRoles.length === 0) {
      return res.status(403).json({ 
        success: false,
        message: 'User has no assigned roles' 
      });
    }

    const roleIds = userRoles.map(role => role.ROLE_ID);

    // Get all permissions for these roles
    const [permissions] = await db.query(`
      SELECT p.PERMISSION_NAME as code
      FROM PERMISSIONS p
      JOIN ROLEPERMISSIONS rp ON p.ID = rp.PERMISSION_ID
      WHERE rp.ROLE_ID IN (?)
    `, [roleIds]);

    const userPermissions = permissions.map(p => p.code);
    console.log('User Permissions:', userPermissions);
    
    // Load and filter menu data
    const menuData = await loadMenuData();
    
    const filteredMenu = menuData.menu.filter(item => {
      // Check if item should be shown globally or user has permission
      const hasAccess = item.showGlobal || 
                       (item.permission && userPermissions.includes(item.permission));
      
      // Filter children if they exist
      if (item.children) {
        item.children = item.children.filter(child => 
          child.showGlobal || 
          (child.permission && userPermissions.includes(child.permission))
        );
        return hasAccess && item.children.length > 0;
      }
      
      return hasAccess;
    });
    
    res.json({ 
      success: true,
      title: menuData.title,
      icon: menuData.icon,
      menu: filteredMenu 
    });
  } catch (err) {
    console.error('Error in menu API:', err);
    res.status(500).json({ 
      success: false,
      message: err.message || 'Server error' 
    });
  }
});

export default router;