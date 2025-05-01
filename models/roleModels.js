export default (sequelize, DataTypes) => {
    const Role = sequelize.define("Role", {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING, unique: true, allowNull: false },
    });
    return Role;
  };
  