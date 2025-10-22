const express = require("express");
const router = express.Router();
const { addExpenseController, businessIdeaController, symptomController } = require("../controllers/tools.controller");

router.post("/expense", addExpenseController);
router.post("/idea", businessIdeaController);
router.post("/symptom", symptomController);

module.exports = router;
