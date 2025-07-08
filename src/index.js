// require('dotenv').config({path: './env'})

// import mongoose from "mongoose";
// import {DB_NAME} from "./constants"

import dotenv from "dotenv"
import connectDB from "./db/index.js";


dotenv.config({
    path: './env'                                 //this is another way used now a day for better consistancy
})

connectDB()
.then( () => {
    app.listen(process.env.PORT || 8000, () =>{
        console.log(`server is running at port : ${process.env.PORT}`);
        
    })
})
.catch((err) =>{
    console.log("MONGO db connection failed !!!", err);
    
})

/*
import express from "express"
const app = express()

( async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}`)
        app.on("errror", (error) => {
            console.log("ERRR: ", error);
            throw error
        })

        app.listen(process.env.PORT, ()=>{
            console.log(`APP is listening on port ${process.env.PORT}`);
            
        })
    } catch (error) {
        console.error("ERROR: ", error)
        throw err
    }
})()
    */