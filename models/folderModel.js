import mongoose from "mongoose";

const FolderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true, // Removes extra spaces
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Folder",
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Folder", FolderSchema);
