import ScoreRecord from "../models/scoreRecord.models.js";

export const getAllScores = async (req, res) => {
  try {
    const scores = await ScoreRecord.getAll();
    res.json(scores);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getScoreById = async (req, res) => {
  try {
    const score = await ScoreRecord.getById(req.params.id);
    if (!score) return res.status(404).json({ message: "Score not found" });
    res.json(score);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createScore = async (req, res) => {
  try {
    const scoreId = await ScoreRecord.create(req.body);
    res.status(201).json({ message: "Score record created", id: scoreId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateScore = async (req, res) => {
  try {
    await ScoreRecord.update(req.params.id, req.body);
    res.json({ message: "Score record updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteScore = async (req, res) => {
  try {
    await ScoreRecord.delete(req.params.id);
    res.json({ message: "Score record deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
