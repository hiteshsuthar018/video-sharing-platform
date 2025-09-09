// require('dotenv').config({path: './env'})
import dotenv from "dotenv"
import connect_DB from "./db/index.js";
import { app } from "./app.js";


dotenv.config({ path: "./.env" })

connect_DB().then(() => {
  app.on("error", (error) => {
    console.log("Error :", error)
  })
  app.listen( process.env.PORT || 8000, () => {
    console.log(`Server is running at port : ${process.env.PORT}`)
  })
})
  .catch((err) => {
    console.log("MONGODB connection Failed!!!", err);
  })



