// configs/uploadthing.js
import { createUploadthing } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  audioUploader: f({ 
    audio: { 
      maxFileSize: "32MB",
      maxFileCount: 1 
    } 
  })
    .onUploadComplete(async ({ file }) => {
      console.log("✅ Audio uploaded successfully:", file.url);
      return { url: file.url };
    }),
    
  videoUploader: f({ 
    video: { 
      maxFileSize: "64MB",
      maxFileCount: 1 
    } 
  })
    .onUploadComplete(async ({ file }) => {
      console.log("✅ Video uploaded successfully:", file.url);
      return { url: file.url };
    }),
};