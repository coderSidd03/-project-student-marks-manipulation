//===================== Importing module and packages =====================//
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");
const { uploadFile } = require("../AWS/aws");
const { checkEmptyBody, isValid, isValidEmail, isValidPhone, isValidObjectId, isValidName, isValidPassword, isValidImageLink } = require("../validation/validation");        // validations   


// >>>>>>>>>>  function to encrypt a password ============================//
const encryptPassword = async (pass) => {
    const salt = await bcrypt.genSalt(10);                          // generating salt
    const encryptedPassword = await bcrypt.hash(pass, salt);        // hashing given password to generate encrypted password 
    return encryptedPassword;
}

//---------------------------------------->   - User API -    <----------------------------------------------//

//=================================== Register User ===================================<<< /register >>> //
const registerUser = async (req, res) => {
    try {
        let requestBody = req.body;                                     // taking data from body
        let files = req.files;

        let { fname, lname, email, phone, password } = requestBody;     // destructuring

        // checking if request body is empty
        if (!checkEmptyBody(requestBody)) return res.status(400).send({ status: false, message: "please provide data in request body" });

        // checking all the required fields .. if correct then assigning it 
        if (!isValid(fname)) return res.status(400).send({ status: false, message: "fname is required" });
        if (!isValid(lname)) return res.status(400).send({ status: false, message: "lname is required" });
        if (!isValid(email)) return res.status(400).send({ status: false, message: "email is required" });
        if (!isValid(phone)) return res.status(400).send({ status: false, message: "phone is required" });
        if (!isValid(password)) return res.status(400).send({ status: false, message: "password is required" });

        // validating all the required fields 
        if (!isValidName(fname)) return res.status(400).send({ status: false, message: `fname: ${fname} is invalid` });
        if (!isValidName(lname)) return res.status(400).send({ status: false, message: `lname: ${lname} is invalid` });
        if (!isValidEmail(email)) return res.status(400).send({ status: false, message: `email: ${email} is invalid` });
        if (!isValidPhone(phone)) return res.status(400).send({ status: false, message: `phone: ${phone} is invalid` });
        if (!isValidPassword(password)) return res.status(400).send({ status: false, message: `provided password: (${password}). is not valid (required at least: 8-15 characters with at least one capital letter, one special character & one number)` });


        // checking that email and password must be unique
        let isPresentEmail = await userModel.findOne({ email: email });
        if (isPresentEmail) return res.status(409).send({ status: false, message: `Email: ${email} is already present. please try again with different email..` });

        let isPresentPhone = await userModel.findOne({ phone: phone });
        if (isPresentPhone) return res.status(409).send({ status: false, message: `phone: ${phone} is already present in DB. please try again with different phone..` });

        // checking that profile image is present and validating.. then assigning to body
        if (!files || files.length == 0) return res.status(400).send({ status: false, message: "please provide image for profileImage" });

        const image = await uploadFile(files[0]);

        if (!isValidImageLink(image)) return res.status(400).send({ status: false, msg: "profileImage is in incorrect format required format must be between: .jpg / .jpeg / .png / .bmp / .gif " });
        requestBody.profileImage = image;

        //assigning encrypted password
        requestBody.password = await encryptPassword(password);         // assigning encrypted password to body

        // creating new user
        const createdUser = await userModel.create(requestBody);
        return res.status(201).send({ status: true, message: "User created successfully", data: createdUser });
    } catch (error) {
        res.status(500).send({ status: false, error: error.message });
    }
}

//==================================== User Login =========================================<<< /login >>>//
const loginUser = async (req, res) => {
    try {
        const credentials = req.body;               // taking body data

        // checking if user does not enters any data
        if (!checkEmptyBody(credentials)) return res.status(400).send({ status: false, message: "please provide email & password" });

        // destructuring required fields
        let { email, password } = credentials;

        if (!isValid(email)) return res.status(400).send({ status: false, message: "please enter email" });
        if (!isValid(password)) return res.status(400).send({ status: false, message: "please enter password" });

        if (!isValidEmail(email)) return res.status(400).send({ status: false, message: "please enter valid email address" });
        if (!isValidPassword(password)) return res.status(400).send({ status: false, message: 'please enter valid password << at least 8-15 characters with at least one capital letter, one special character & one number >>' });

        // searching in DB
        let findUserData = await userModel.findOne({ email: email });
        if (!findUserData) return res.status(404).send({ status: false, message: `user not found, with email: ${email}. please check the email and try again !!` });

        // checking password with bcrypt's compare
        let ValidPassword = await bcrypt.compare(password, findUserData.password);
        if (!ValidPassword) return res.status(404).send({ status: false, message: `incorrect password given for the account name : ${findUserData.fname} ${findUserData.lname}. please check the password and try again !! ` });

        // creating payload separately
        let payLoad = {
            userId: findUserData._id.toString(),
            userName: `${findUserData.fname} ${findUserData.lname}`,
            userEmail: findUserData['email']
        }

        // creating token & adding expiry time
        let token = jwt.sign(payLoad, "~ functionUp--assignment-- _student-Marks_ -- by Soumyadeep Chakraborty ~", { expiresIn: '2h' });

        // setting token in response header
        res.header('Authorization', token);

        return res.status(201).send({
            status: true,
            message: 'User login successful',
            data: { userId: `${findUserData._id}`, token: token }
        });
    }
    catch (error) {
        res.status(500).send({ status: false, error: error.message });
    }
}


//===================== Exporting functions to use globally =====================//
module.exports = { registerUser, loginUser };