import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath, file_Type = "auto") => {
    try {
        if (!localFilePath) return null
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: file_Type
        })

        //file has been uploaded successfully
        console.log("file is uploaded on cloudinary", response.url)
        fs.unlinkSync(localFilePath);
        return response
    } catch (error) {
        fs.unlinkSync(localFilePath) //removed the locally saved temporary file as the upload operation got failed
        return null
    }
}

const deleteFromCloudinary = async (cloudinary_path, resource_type="auto") => {
    try {
        if(!cloudinary_path){
            return null
        }
        const publicId = cloudinary_path.split('/').pop().split('.')[0]; // Extract public ID
        await cloudinary.uploader.destroy(publicId,{resource_type:resource_type}); // Delete video thumbnail
        console.log("delete from cloudinary with ",publicId);
    } catch (error) {
        return null
    }
}

export { uploadOnCloudinary,deleteFromCloudinary }