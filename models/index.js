import sequelize from "../connection/dbConnection.js";
import User from "../models/User.js";
import Expense from "../models/Expense.js";

const db = {};

// Thêm các mô hình vào đối tượng `db`
db.User = User;
db.Expense = Expense;

// Khởi tạo liên kết giữa các mô hình (nếu có)
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Kiểm tra kết nối cơ sở dữ liệu
sequelize
  .authenticate()
  .then(() => {
    console.log("Connected to database successfully");
  })
  .catch((err) => {
    console.log("Unable to connect to database", err);
  });

// Đồng bộ cơ sở dữ liệu
sequelize
  .sync({ force: false }) // Đổi thành `alter: true` nếu cần cập nhật cấu trúc bảng
  .then(() => {
    console.log("Database is synced successfully");
  })
  .catch((err) => {
    console.log("Unable to sync database", err);
  });

db.sequelize = sequelize;

export default db;

/*
sequelize.sync({ force: false })

sequelize.sync():
Đây là một phương thức trong Sequelize dùng để đồng bộ hóa tất cả các mô 
hình (models) với cơ sở dữ liệu.
Nó sẽ tự động tạo các bảng trong cơ sở dữ liệu nếu bảng đó chưa tồn tại.

Tùy chọn { force: false }:
force: false: Không xóa bảng nếu bảng đó đã tồn tại. Nếu bảng đã có, 
nó sẽ giữ nguyên dữ liệu hiện có.
force: true: Xóa toàn bộ bảng trong cơ sở dữ liệu và tạo lại chúng từ đầu. 
Lưu ý: Tùy chọn này sẽ xóa hết dữ liệu trong bảng (không nên dùng trong 
môi trường sản xuất).

Tùy chọn thay thế:
Bạn có thể sử dụng alter: true thay vì force. Tùy chọn này cho phép cập 
nhật cấu trúc bảng (thêm hoặc sửa cột) mà không làm mất dữ liệu.
*/
