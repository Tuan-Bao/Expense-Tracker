import Sequelize from "sequelize";
import dotenv from "dotenv";
dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    logging: false,
  }
);

// const testConnection = async () => {
//   try {
//     await sequelize.authenticate();
//     console.log("Database connection established successfully.");
//   } catch (error) {
//     console.log(error);
//   }
// };

// testConnection();

export default sequelize;
