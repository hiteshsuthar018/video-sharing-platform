// require('dotenv').config({path: './env'})
import dotenv from "dotenv"
import connect_DB from "./db/index.js";
import { app } from "./app.js";


dotenv.config({ path: "./.env" })

connect_DB().then(() => {
  app.on("error", (error) => {
    console.log("Error :", error)
  })
  // process.env.PORT ||
  app.listen( process.env.PORT || 8000, () => {
    console.log(`Server is running at port : ${process.env.PORT}`)
  })
})
  .catch((err) => {
    console.log("MONGODB connection Failed!!!", err);
  })




/*
import express from "express";
const app = express();

(async ()=>{
    try {
      await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
      //agar express ki app koi dikkat kar rahi ho to hum on listner ka use krte hai
      app.on("error",(error)=>{
         console.log("ERROR:",error)
         throw error
      })
      app.listen(process.env.PORT ,()=>{
        console.log(`App is listening on port ${process.env.PORT} `)
      })
    } catch (error) {
        console.error("ERROR: ",error);
        throw error
    }
})()

*/