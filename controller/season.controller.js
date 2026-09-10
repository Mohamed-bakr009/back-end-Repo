const Season = require("../models/season.model");

const createSeason = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || !description)
      return res
        .status(400)
        .json({ message: "Name and description are required" });
    const season = await Season.create({ name, description });
    res.status(201).json({ message: "Season created successfully", season });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to create season", error: error.message });
  }
};
const getSeasons = async (req, res) => {
  try {
    const seasons = await Season.find(
      req.query.includeDeleted === "true" ? {} : { isDeleted: false },
    ).sort({ createdAt: -1 });
    res.json({ seasons });
  } catch (error) {
    res.status(500).json({ message: "Failed to get seasons", error: error.message });
  }
};
const getSeason = async (req, res) => {
  try {
    const season = await Season.findById(req.params.id);
    if (!season) return res.status(404).json({ message: "Season not found" });
    res.json({ season });
  } catch (error) {
    res.status(500).json({ message: "Failed to get season", error: error.message });
  }
};
const updateSeason = async (req, res) => {
  try {
    const season = await Season.findById(req.params.id);
    if (!season || season.isDeleted)
      return res.status(404).json({ message: "Season not found" });
    const { name, description } = req.body;
    if (name !== undefined){
       season.name = name;
    }
    if (description !== undefined) {
      season.description = description;
    }
    await season.save();
    res.json({ message: "Season updated successfully", season });
  } catch (error) {
    res.status(500).json({ message: "Failed to update season", error: error.message });
  }
};
const deleteSeason = async (req, res) => {
  try {
    const season = await Season.findById(req.params.id);
    if (!season || season.isDeleted)
      return res.status(404).json({ message: "Season not found" });
    season.isDeleted = true;
    season.isActive = false;
    season.deletedAt = new Date();
    await season.save();
    res.json({ message: "Season deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete season", error: error.message });
  }
};
const restoreSeason = async (req, res) => {
  try {
    const season = await Season.findById(req.params.id);
    if (!season) return res.status(404).json({ message: "Season not found" });
    season.isDeleted = false;
    season.isActive = true;
    season.deletedAt = null;
    await season.save();
    res.json({ message: "Season restored successfully", season });
  } catch (error) {
    res.status(500).json({ message: "Failed to restore season", error: error.message });  
}
};
const toggleSeasonStatus = async (req, res) => {
  try {
    const season = await Season.findById(req.params.id);
    if (!season || season.isDeleted)
      return res.status(404).json({ message: "Season not found" });
    season.isActive = !season.isActive;
    await season.save();
    res.json({ message: "Season status updated successfully", season });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update season status",
      error: error.message,
    });
  }
};
module.exports = {
  createSeason,
  getSeasons,
  getSeason,
  updateSeason,
  deleteSeason,
  restoreSeason,
  toggleSeasonStatus,
};
