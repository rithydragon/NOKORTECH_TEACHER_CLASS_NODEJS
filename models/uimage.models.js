import db from '../config/db.js'; // Import your database connection

class UImage {
    // Fetch image data by USER_ID
    static async getImageByUserId(userId) {
        const query = `SELECT * FROM UIMAGE WHERE USER_ID = ?`;

        try {
            const [rows] = await db.execute(query, [userId]); // Pass userId as a parameter
            if (rows.length === 0) {
                return null; // Return null if no image is found
            }
            return rows[0]; // Return the first row (single image)
        } catch (error) {
            console.error("Error fetching image by USER_ID:", error);
            throw new Error("Failed to fetch image by USER_ID.");
        }
    }
    // Fetch a single image by USER_ID
    static async findOne({ where, attributes }) {
        const userId  = where; // Extract USER_ID from the where clause
        console.log("---------------",userId)
        const columns = attributes.join(', '); // Convert attributes array to a string

        const query = `SELECT ${columns} FROM UIMAGE WHERE USER_ID = ?`;

        try {
            const [rows] = await db.execute(query, [userId]); // Pass USER_ID as a parameter
            if (rows.length === 0) {
                return null; // Return null if no image is found
            }
            return rows[0]; // Return the first row (single image)
        } catch (error) {
            console.error("Error fetching image by USER_ID:", error);
            throw new Error("Failed to fetch image by USER_ID.");
        }
    }


    // Add a new image for a user
    static async addImage(userId, imagePath, fileType, createdBy) {
        console.log("Adding image with userId:", userId, "imagePath:", imagePath, "fileType:", fileType, "createdBy:", createdBy);
        const query = `INSERT INTO UIMAGE (USER_ID, IMAGEPATH, FILE_TYPE, CREATED_BY) VALUES (?, ?, ?, ?)`;

        try {
            const [result] = await db.execute(query, [userId, imagePath, fileType, createdBy]); // Pass parameters
            return result.insertId; // Return the ID of the newly inserted image
        } catch (error) {
            console.error("Error adding image:", error);
            throw new Error("Failed to add image.");
        }
    }

    // Update an existing image for a user
    static async updateImage(userId, imagePath, fileType) {
        const query = `UPDATE UIMAGE SET IMAGEPATH = ?, FILE_TYPE = ? WHERE USER_ID = ?`;

        try {
            const [result] = await db.execute(query, [imagePath, fileType, userId]); // Pass parameters
            if (result.affectedRows === 0) {
                throw new Error("Image not found for the given USER_ID.");
            }
            return true; // Return true if the update was successful
        } catch (error) {
            console.error("Error updating image:", error);
            throw new Error("Failed to update image.");
        }
    }

    // Delete an image by USER_ID
    static async deleteImage(userId) {
        const query = `DELETE FROM UIMAGE WHERE USER_ID = ?`;

        try {
            const [result] = await db.execute(query, [userId]); // Pass userId as a parameter
            if (result.affectedRows === 0) {
                throw new Error("Image not found for the given USER_ID.");
            }
            return true; // Return true if the deletion was successful
        } catch (error) {
            console.error("Error deleting image:", error);
            throw new Error("Failed to delete image.");
        }
    }
    static async findById(image_id) {
        const [rows] = await db.query(
          `SELECT * FROM UIMAGE WHERE IMAGE_ID = ?`,
          [image_id]
        );
        return rows[0];
      }
    
      static async findByUserId(user_id) {
        const [rows] = await db.query(
          `SELECT * FROM UIMAGE WHERE USER_ID = ?`,
          [user_id]
        );
        return rows;
      }

      
  static async update(image_id, { imagepath, file_type, updated_by }) {
    const [result] = await db.query(
      `UPDATE UIMAGE SET 
       IMAGEPATH = ?, FILE_TYPE = ?, UPDATED_BY = ?, UPDATED_DATE = CURRENT_TIMESTAMP
       WHERE IMAGE_ID = ?`,
      [imagepath, file_type, updated_by, image_id]
    );
    return result.affectedRows;
  }

}

export default UImage;