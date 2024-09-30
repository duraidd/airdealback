import mongoose from "mongoose";


// Schema
let schema = mongoose.Schema({
    Name: { type: String },
    JobTitle: { type: String },
    CompanyName: { type: String },
    Email_Address: { type: String },
    PhoneNumber: { type: String },
    image_path: { type: String },
    Address: { type: String }
}, { timestamps: true });


let modal = mongoose.model("Visit_card_details", schema, "Visit_card_details");


export default modal;