import { Schema } from "mongoose";
import mongoose from "mongoose";

const subscriptionSchema = new Schema({
    subsciber : {
        type: Schema.Types.ObjectId,   // one who is subscribing
        ref: "User"
    },
    channel : {
        type: Schema.Types.ObjectId,   // one to who 'subscriber' is subscribing
        ref: "User"
    }
}, { timestamps : true}
)

export const Subscription = mongoose.model("Subscription", subscriptionSchema)