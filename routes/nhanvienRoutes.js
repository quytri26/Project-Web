
const express = require("express");
const router = express.Router();
const nvCtrl = require("../controllers/nhanvienController");

router.get("/search", nvCtrl.searchNhanVien);
router.get("/", nvCtrl.getAllNhanVien);
router.get("/:id", nvCtrl.getNhanVienById);
router.post("/", nvCtrl.addNhanVien);
router.put("/:id", nvCtrl.updateNhanVien);
router.delete("/:id", nvCtrl.deleteNhanVien);

module.exports = router;
