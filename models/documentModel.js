import mongoose from "mongoose";

const DocumentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    doc: {
      key: String,
      url: String,
    },
    folder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Folder",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Documents", DocumentSchema);
