var express = require("express");
var router = express.Router();
const ObjectId = require("mongodb").ObjectId;

/* GET home page. */
router.get("/", async function (req, res, next) {
  try {
    const db = req.app.locals.db;
    const memories = await db
      .collection("memories")
      .find()
      .sort({ date: -1 })
      .toArray();
    res.render("index", {
      title: "My Personal Diary",
      memories: memories,
    });
  } catch (error) {
    next(error);
  }
});

// Add new memory
router.post("/memories", async function (req, res, next) {
  try {
    const db = req.app.locals.db;
    const memory = {
      title: req.body.title,
      date: req.body.date,
      description: req.body.description,
      mood: req.body.mood,
      createdAt: new Date(),
    };

    const result = await db.collection("memories").insertOne(memory);
    if (result.acknowledged) {
      res.json({ success: true, memory: result });
    } else {
      throw new Error("Failed to insert memory");
    }
  } catch (error) {
    next(error);
  }
});

// Update memory
router.put("/memories/:id", async function (req, res, next) {
  try {
    const db = req.app.locals.db;
    const result = await db
      .collection("memories")
      .updateOne({ _id: new ObjectId(req.params.id) }, { $set: req.body });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Delete memory
router.delete("/memories/:id", async function (req, res, next) {
  try {
    const db = req.app.locals.db;
    const result = await db
      .collection("memories")
      .deleteOne({ _id: new ObjectId(req.params.id) });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
