import folderModel from "../models/folderModel.js";

export const createFolder = async (req, res) => {
  try {
    const name = req.body.name;
    const folderId = req.body.folderId;
    if (!name) {
      return res.status(404).json({ message: "Provide Name" });
    }
    const newFolder = await folderModel.create({
      name: name,
      parent: folderId ?? null,
    });

    await newFolder.save();
    res.status(200).json({ newFolder, message: "New Folder Created" });
  } catch (error) {
    console.error("Folder create error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const renameFolder = async (req, res) => {
  try {
    const { name, folderId } = req.body;

    if (!name || !folderId) {
      return res.status(400).json({ message: "Name or folderId is missing" });
    }

    const updatedFolder = await folderModel.findByIdAndUpdate(
      folderId,
      { name },
      { new: true }
    );

    if (!updatedFolder) {
      return res.status(404).json({ message: "Folder not found" });
    }

    res.status(200).json({ updatedFolder, message: "Folder renamed successfully" });

  } catch (error) {
    console.error("Rename folder error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


export const fetchAllFolders = async (req, res) => {
  try {
    const folders = await folderModel.find({ parent: null });
    res.status(200).json(folders);
  } catch (error) {
    console.error("Fetch folders error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const fetchChildFolders = async (req, res) => {
  try {
    const { folderId } = req.params;
    const folders = await folderModel.find({ parent: folderId });
    res.status(200).json(folders);
  } catch (error) {
    console.error("Fetch folders error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
