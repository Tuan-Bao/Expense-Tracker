/*
Không dùng {}: Khi import từ Default Export
Dùng {}: Khi import từ Named Export. Một module có thể có nhiều named exports.
*/

import jwt from "jsonwebtoken";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import User from "../models/User.js";

const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.Token || req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      throw new ApiError(401, "Unauthorized");
    }
    const decodedToken = jwt.verify(token, process.env.JWT_TOKEN_SECRET);
    const user = await User.findByPk(decodedToken.id, {
      attributes: { exclude: ["password"] }, // Chỉ trả về các trường khác ngoài mật khẩu để tăng bảo mật
    });
    if (!user) {
      throw new ApiError(401, "Invalid Token Access");
    }
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error.message || "Invalid Token");
  }
});

export default verifyJWT;
