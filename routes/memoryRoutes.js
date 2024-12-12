const express = require("express");
const router = express.Router();
const {
  getMemories,
  getMemory,
  createMemory,
  updateMemory,
  deleteMemory,
} = require("../controllers/memoryController");

router.route("/").get(getMemories).post(createMemory);

router.route("/:id").get(getMemory).put(updateMemory).delete(deleteMemory);

module.exports = router;
