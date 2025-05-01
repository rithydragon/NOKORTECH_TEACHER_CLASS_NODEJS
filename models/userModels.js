// export default (sequelize, DataTypes) => {
//     const User = sequelize.define("User", {
//       id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
//       name: { type: DataTypes.STRING, allowNull: false },
//       email: { type: DataTypes.STRING, unique: true, allowNull: false },
//       password: { type: DataTypes.STRING, allowNull: false },
//       role_id: { type: DataTypes.INTEGER, allowNull: false },
//     });
//     return User;
//   };
  
import { DataTypes } from "sequelize";
import db from "../config/db.js"

export default (sequelize, DataTypes) => {
    const User = sequelize.define("User",
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        userCode: {
          type: DataTypes.STRING(15),
          allowNull: false,
          unique: true,
        },
        name: {
          type: DataTypes.STRING(100),
          allowNull: false,
        },
        username: {
          type: DataTypes.STRING(40),
          allowNull: false,
          unique: true,
        },
        email: {
          type: DataTypes.STRING(150),
          allowNull: false,
          unique: true,
        },
        password: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        gender: {
          type: DataTypes.ENUM("FEMALE", "MALE", "CUSTOM"),
          allowNull: false,
        },
        userType: {
          type: DataTypes.ENUM("STUDENT", "GENERAL", "SYSTEM"),
        },
        roleId: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        dob: {
          type: DataTypes.DATE,
        },
        pob: {
          type: DataTypes.TEXT,
        },
        address: {
          type: DataTypes.TEXT,
        },
        phoneNumber: {
          type: DataTypes.STRING(15),
          unique: true,
        },
        logonStatus: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
        },
        isActive: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
        },
        lastLogin: {
          type: DataTypes.DATE,
        },
        createdBy: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        updatedBy: {
          type: DataTypes.INTEGER,
        },
      },
      {
        timestamps: true, // Enables `createdAt` and `updatedAt` fields automatically
        updatedAt: "updated_at", // Ensures updated_at field updates automatically
      });
    return User;
  };
