const express = require("express");
const router = express.Router();
const { addExpense } = require("../controllers/toolsController");

router.post("/expense", addExpense);

module.exports = router;
