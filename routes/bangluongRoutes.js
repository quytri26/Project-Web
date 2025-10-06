const express = require("express");
const router = express.Router();
const blCtrl = require("../controllers/bangluongController");

router.get("/", blCtrl.getAllBangLuong);
router.get("/:id", blCtrl.getBangLuongById);
router.post("/", blCtrl.addBangLuong);
router.put("/:id", blCtrl.updateBangLuong);
router.delete("/:id", blCtrl.deleteBangLuong);

module.exports = router;
