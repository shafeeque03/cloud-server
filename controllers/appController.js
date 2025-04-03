import folderModel from "../models/folderModel.js";

export const createFolder = async(req,res)=>{
    try {
        const name = req.body.name;
        if(!name){
            return res.status(404).json({message:"Provide Name"})
        }
        const newFolder = await folderModel.create({
            name:name,
        });
        await newFolder.save();
        res.status(200).json({newFolder, message:"New Folder Created"})
    } catch (error) {
        console.error('Folder create error:', error);
        return res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }
    };

export const fetchAllFolders = async(req,res)=>{
    try {
        const folders = await folderModel.find({parent:null});
        res.status(200).json(folders)
    } catch (error) {
        console.error('Fetch folders error:', error);
        return res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }
    };