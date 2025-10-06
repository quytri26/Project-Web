const express = require("express");
const router = express.Router();
const ccCtrl = require("../controllers/chamcongController");

router.get("/", ccCtrl.getAllChamCong);
router.get("/:id", ccCtrl.getChamCongById);
router.post("/", ccCtrl.addChamCong);
router.put("/:id", ccCtrl.updateChamCong);
router.delete("/:id", ccCtrl.deleteChamCong);
router.get("/nhanvien/all", ccCtrl.getAllNhanVien);

module.exports = router;
