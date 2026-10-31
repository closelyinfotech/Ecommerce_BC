const express = require("express");
const router = express.Router();
const {
  GetByCategoryController,
  GetAllConstantsController,
  GetConstantByIdController,
  InsertConstantController,
  UpdateConstantController,
  DeleteConstantController,
} = require("../controller/ConstantController");

// Query by Category_Name (WHERE Category_Name = :categoryName)
router.get("/category/:categoryName", GetByCategoryController);
router.get("/category", GetByCategoryController);

// Standard CRUD endpoints
router.get("/list", GetAllConstantsController);
router.get("/", GetAllConstantsController);
router.get("/:id", GetConstantByIdController);

router.post("/insert", InsertConstantController);
router.post("/", InsertConstantController);

router.put("/update/:id", UpdateConstantController);
router.put("/:id", UpdateConstantController);

router.delete("/delete/:id", DeleteConstantController);
router.delete("/:id", DeleteConstantController);

module.exports = router;
