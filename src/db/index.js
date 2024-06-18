import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connect_DB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        //connection instance padhna hai
        console.log(`\n MongoDB connected !! DBHOST: ${connectionInstance.connection.host}`)
    } catch (error) {
        console.error("MONGODB connection FAILED:", error);
        //process exit padhna hai
        process.exit(1);
    }
}

export default connect_DB;