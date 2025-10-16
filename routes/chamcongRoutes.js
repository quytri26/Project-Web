const express = require("express");
const router = express.Router();
const ccCtrl = require("../controllers/chamcongController");

router.get("/nhanvien/all", ccCtrl.getAllNhanVien);
router.get("/filter", ccCtrl.filterChamCong);
router.get("/", ccCtrl.getAllChamCong);
router.get("/:id", ccCtrl.getChamCongById);
router.post("/", ccCtrl.addChamCong);
router.put("/:id", ccCtrl.updateChamCong);
router.delete("/:id", ccCtrl.deleteChamCong);

module.exports = router;
