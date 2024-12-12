const Memory = require("../models/memory");

// Get all memories
const getMemories = async (req, res) => {
  try {
    const { search, tag } = req.query;
    let query = {};

    if (search) {
      query = {
        $or: [
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ],
      };
    }

    if (tag) {
      query.tags = tag;
    }

    const memories = await Memory.find(query).sort({ date: -1 });
    res.json(memories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single memory
const getMemory = async (req, res) => {
  try {
    const memory = await Memory.findById(req.params.id);
    if (!memory) {
      return res.status(404).json({ message: "Memory not found" });
    }
    res.json(memory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create memory
const createMemory = async (req, res) => {
  try {
    const memory = new Memory(req.body);
    const savedMemory = await memory.save();
    res.status(201).json(savedMemory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update memory
const updateMemory = async (req, res) => {
  try {
    const memory = await Memory.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!memory) {
      return res.status(404).json({ message: "Memory not found" });
    }
    res.json(memory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete memory
const deleteMemory = async (req, res) => {
  try {
    const memory = await Memory.findByIdAndDelete(req.params.id);
    if (!memory) {
      return res.status(404).json({ message: "Memory not found" });
    }
    res.json({ message: "Memory deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMemories,
  getMemory,
  createMemory,
  updateMemory,
  deleteMemory,
};
