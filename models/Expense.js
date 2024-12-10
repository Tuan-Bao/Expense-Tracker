import { DataTypes, Model } from "sequelize";
import sequelize from "../connection/dbConnection.js";

const Table = "Expense";
const Expense = sequelize.define(Table, {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  category: {
    type: DataTypes.ENUM(
      "Food",
      "Travel",
      "Utilities",
      "Entertainment",
      "Other"
    ),
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  amount: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    references: {
      model: "Users", // Tham chiếu đến tên bảng trong cơ sở dữ liệu. Trong references để định nghĩa khóa ngoại.
      key: "id",
    },
    allowNull: false,
  },
  createdAt: {
    type: DataTypes.DATEONLY,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATEONLY,
    defaultValue: DataTypes.NOW,
  },
});

Expense.associate = (models) => {
  Expense.belongsTo(models.User, {
    // Tham chiếu đến đối tượng Sequelize model. Trong các mối quan hệ giữa các models.
    foreignKey: "userId",
    as: "user",
  });
};

export default Expense;
/*
Hàm associate định nghĩa quan hệ giữa model Expense và User:
- Xác định rằng mỗi chi tiêu (Expense) thuộc về một người dùng (User).
- Khóa ngoại liên kết bảng Expense và Users qua cột userId.
- Alias (bí danh) cho quan hệ, cho phép truy cập thông qua thuộc tính user.
*/
