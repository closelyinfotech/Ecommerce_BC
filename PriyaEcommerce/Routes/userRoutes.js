const express = require("express");
const router = express.Router();
const {
  GetAllUsersController,
  GetUserByIdController,
  SearchUserController,
  InsertUserController,
  UpdateUserController,
  DeleteUserController,
  GetProfileController,
} = require("../controller/UserController");

// Protected CRUD routes (mounted under /api/priya/ecommerce/users)
router.get("/profile", GetProfileController);
router.get("/search", SearchUserController);
router.get("/list", GetAllUsersController);
router.get("/", GetAllUsersController);
router.get("/:id", GetUserByIdController);

router.post("/insert", InsertUserController);
router.post("/create", InsertUserController);

router.put("/update/:id", UpdateUserController);
router.put("/:id", UpdateUserController);

router.delete("/delete/:id", DeleteUserController);
router.delete("/:id", DeleteUserController);

module.exports = router;
