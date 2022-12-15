//=====================Importing mongoose package=====================//
const mongoose = require("mongoose");


//*=================================    >>>>>>>>    Some globally used function        <<<<<<<<     ===============================//


const checkEmptyBody = (object) => { return Object.keys(object).length > 0 };                                  // >>>> to check that object has keys or not 

const isValidObjectId = (objectId) => { return mongoose.Types.ObjectId.isValid(objectId); };                  // to validate an ObjectId

const isValid = (value) => {
    if (typeof value === "undefined" || value === null) return false;
    if (typeof value === "string" && value.trim().length === 0) return false;
    return true;
};                                                                                    // Validating that the Input must be a non-empty String


//* USER DETAILS VALIDATIONS *//
const isValidName = (name) => { return ((/^[a-zA-Z ]+$/).test(name)); };                                            // Name Validation
const isValidPhone = (phone) => { return ((/^((\+91)?|91)?[6789][0-9]{9}$/g).test(phone)); };                       // Validation for Phone No. (indian only)
const isValidEmail = (email) => { return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email); };            // Validation for Email 
const isValidPassword = (password) => { return (/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,15}$/).test(password); };    // validation for password

//* AWS link VALIDATIONS *//
const isValidImageLink = (imageUrlLink) => {
    const urlRegex = /(http[s]:\/\/)([a-z\-0-9\/.]+)\.([a-z.]{2,3})\/([a-z0-9\-\/._~:?#\[\]@!$&'()+,;=%]*)([a-z0-9]+\.)(jpg|jpeg|png|bmp|gif)/i;
    return urlRegex.test(imageUrlLink);
};



module.exports = {
    checkEmptyBody,
    isValid,
    isValidEmail,
    isValidPhone,
    isValidObjectId,
    isValidName,
    isValidPassword,
    isValidImageLink
};