import { DataTypes } from "sequelize";
import sequelize from "../connection/dbConnection.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const Table = "User";
const User = sequelize.define(
  Table,
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      required: true,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: { isEmail: true },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    monthly_budget: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  { timestamps: true }
);

User.associate = (models) => {
  User.hasMany(models.Expense, {
    foreignKey: "userId",
    as: "expenses",
  });
};

User.prototype.isPasswordMatched = async function (password) {
  return await bcrypt.compare(password, this.password);
};

User.prototype.generateToken = function () {
  return jwt.sign(
    {
      id: this.id,
      username: this.username,
      email: this.email,
    },
    process.env.JWT_TOKEN_SECRET, // Chuỗi bí mật
    {
      expiresIn: process.env.JWT_TOKEN_EXPIRY, // Thời gian hết hạn
    }
  );
};

export default User;
/*
Nếu bạn không chỉ định freezeTableName: true trong model, Sequelize sẽ 
tự động đặt tên bảng ở dạng số nhiều (plural) ->  Tên bảng sẽ là Users
*/
