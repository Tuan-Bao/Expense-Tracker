const asyncHandler = (fn) => async (req, res, next) => {
  return Promise.resolve(fn(req, res, next)).catch((error) => next(error));
};

export default asyncHandler;
/*
Khi sử dụng các hàm bất đồng bộ (async/await) trong Express, nếu xảy ra lỗi, bạn phải bắt lỗi bằng try-catch.
Nếu không bắt lỗi, ứng dụng có thể treo hoặc ngắt kết nối mà không có thông báo lỗi rõ ràng.

asyncHandler tự động bắt và chuyển lỗi đến middleware xử lý lỗi mặc định của Express, giúp bạn không cần phải 
lặp đi lặp lại các khối try-catch.
*/
