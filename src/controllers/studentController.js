//===================== Importing module and packages =====================//
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const studentModel = require("../models/studentModel");
const userModel = require("../models/userModel");
const { checkEmptyBody, isValid, isValidObjectId, isValidName } = require("../validation/validation");        // validations   


const addStudent = async (req, res) => {
    try {
        let userIdFromToken = req.userId                                // collecting userId from request by token
        let requestBody = req.body;                                     // taking data from body


        let { studentName, subject, marks, userId } = requestBody;      // destructuring

        // checking if request body is empty
        if (!checkEmptyBody(requestBody)) return res.status(400).send({ status: false, message: "please provide data in request body" });

        // checking all the required fields .. if correct then assigning it 
        if (!isValid(studentName)) return res.status(400).send({ status: false, message: "student name is required" });
        if (!isValid(subject)) return res.status(400).send({ status: false, message: "subject is required" });
        if (!marks) return res.status(400).send({ status: false, message: "marks is required" });
        if (!isValid(userId)) return res.status(400).send({ status: false, message: "userId is required" });


        // validating all the required fields 
        if (!isValidName(studentName)) return res.status(400).send({ status: false, message: `studentName: ${studentName} is invalid` });
        if (!isValidName(subject)) return res.status(400).send({ status: false, message: `subject: ${subject} is invalid` });
        if (!isValidObjectId(userId)) return res.status(400).send({ status: false, message: `userId: ${userId} is invalid` });

        if (userIdFromToken != userId) return res.status(403).send({ status: false, message: `unauthorized access userId mismatch with token` });

        // checking that email and password must be unique
        // let isPresentStudent = await userModel.findOne({ userId: userId, studentName: studentName, subject: subject }).lean();
        let updateStudentMarks = await studentModel.findOneAndUpdate(
            { usrId: userId, studentName: studentName, subject: subject },
            { $inc: { marks: marks } },
            { new: true }
        );
        if (!updateStudentMarks) {
            // creating new user
            const createdStudent = await studentModel.create(requestBody);
            return res.status(201).send({ status: true, message: "User created successfully", data: createdStudent });
        }
        return res.status(200).send({ status: true, message: "Student marks updated successfully", data: updateStudentMarks });
    } catch (error) {
        res.status(500).send({ status: false, error: error.message });
    }
}

// const updateStudent = async (req, res) => {
//     try {

//         const userIdFromParam = req.params.userId;          // accessing userId fro url(path param)
//         const data = req.body;                              // accessing data from body
//         const files = req.files;                            // accessing image from request

//         // validating userId got from path params
//         if (!isValidObjectId(userIdFromParam)) return res.status(400).send({ status: false, message: `userId: ${userIdFromParam} is invalid, Please Provide Valid userId.` });

//         // checking that request body is empty or not
//         if (!checkEmptyBody(data)) return res.status(400).send({ status: false, message: "please provide Some field to update." });

//         // authorizing user with token's userId
//         if (userIdFromParam !== req.userId) return res.status(403).send({ status: false, message: "Unauthorized user access." });

//         // finding user in DB
//         let findUserData = await userModel.findById(userIdFromParam)
//         if (!findUserData) return res.status(400).send({ status: false, message: `User with userId: ${userIdFromParam} is not exist in database.` });



//         //------------------------------------------update address---------------------------------------------------------

//         // destructuring fields to update
//         let { fname, lname, email, phone, password, address, profileImage } = data;

//         if (fname) {
//             fname = fname.trim();

//             if (!isValidName(fname)) return res.status(400).send({ status: false, message: `fname: ${fname}, is Not valid` });

//             findUserData.fname = fname;
//         }

//         if (lname) {
//             lname = lname.trim();

//             if (!isValidName(lname)) return res.status(400).send({ status: false, message: `lname: ${lname}, is Not valid` });

//             findUserData.lname = lname;
//         }

//         if (email) {
//             email = email.trim();

//             if (!isValidEmail(email)) return res.status(400).send({ status: false, message: `email: ${email}, is not valid` });

//             const existEmail = await userModel.findOne({ email: email });
//             if (existEmail) return res.status(409).send({ status: false, message: `email: ${email} is already stored in Database , please provide unique email id.` });

//             findUserData.email = email;
//         }

//         if (phone) {
//             phone = phone.trim();

//             if (!isValidPhone(phone)) return res.status(400).send({ status: false, message: `phone: ${phone}, is not valid.` });

//             let existPhone = await userModel.findOne({ phone: phone });
//             if (existPhone) return res.status(409).send({ status: false, message: `phone: ${phone} is already stored in Database, please provide unique phone no.` });

//             findUserData.phone = phone;
//         }

//         if (password) {

//             if (!isValidPassword(password)) return res.status(400).send({ status: false, message: `Password: ${password}, is not valid. (required at least: 8-15 characters with at least one capital letter, one special character & one number) ` });

//             const encryptedPass = await encryptPassword(password);

//             findUserData.password = encryptedPass;
//         }

//         if (address) {

//             try {
//                 address = JSON.parse(address);
//             }
//             catch (err) {
//                 console.log(err)
//                 return res.status(400).send({ status: false, message: "please enter address in object format, check if its values are in valid format !!" });
//             }

//             if (typeof (address) !== "object") return res.status(400).send({ status: false, message: "please enter address in Object format to update." });

//             if (!checkEmptyBody(address)) return res.status(400).send({ status: false, message: "please enter shipping and billing address !!" });


//             let { shipping, billing } = address;

//             if (shipping) {

//                 if (typeof (shipping) != "object") return res.status(400).send({ status: false, message: "please enter shipping address in object format to update" });

//                 if (!checkEmptyBody(shipping)) return res.status(400).send({ status: false, message: "enter street, city, pincode for shipping address." });

//                 let { street, city, pincode } = shipping;

//                 if (isValid(street)) {
//                     street = street.trim();
//                     if ((typeof (street) !== 'string') || (!streetValidation(street))) return res.status(400).send({ status: false, message: "enter valid Shipping Street name." });
//                     findUserData.address.shipping.street = street;
//                 }

//                 if (isValid(city)) {
//                     city = city.trim();
//                     if ((typeof (city) !== 'string') || (!cityValidation(city))) return res.status(400).send({ status: false, message: "enter valid Shipping city name." });
//                     findUserData.address.shipping.city = city;
//                 }

//                 if (isValid(pincode)) {
//                     pincode = pincode.trim();
//                     if ((typeof (pincode) !== 'string') || (!pinCodeValidation(pincode))) return res.status(400).send({ status: false, message: "enter valid Shipping address pincode." });
//                     findUserData.address.shipping.pincode = pincode;
//                 }
//             }


//             if (billing) {

//                 if (typeof (billing) != "object") return res.status(400).send({ status: false, message: "please enter billing address in object format to update" });

//                 if (!checkEmptyBody(billing)) return res.status(400).send({ status: false, message: "enter street, city, pincode for billing address." });

//                 let { street, city, pincode } = billing;

//                 if (isValid(street)) {
//                     street = street.trim();
//                     if ((typeof (street) !== 'string') || (!streetValidation(street))) return res.status(400).send({ status: false, message: "enter valid Billing street name." });
//                     findUserData.address.billing.street = street;
//                 }

//                 if (isValid(city)) {
//                     city = city.trim();
//                     if ((typeof (city) !== 'string') || (!cityValidation(city))) return res.status(400).send({ status: false, message: "enter valid Billing city name." });
//                     findUserData.address.billing.city = city;
//                 }

//                 if (isValid(pincode)) {
//                     pincode = pincode.trim();
//                     if ((typeof (pincode) !== 'string') || (!pinCodeValidation(pincode))) return res.status(400).send({ status: false, message: "enter valid billing address pincode." });
//                     findUserData.address.billing.pincode = pincode;
//                 }
//             }
//         }

//         // checking profileImage
//         if (profileImage) return res.status(400).send({ status: false, message: "ProfileImage format invalid !!" });

//         if (files && files.length > 0) {
//             const image = await uploadFile(files[0]);
//             if (!isValidImageLink(image)) return res.status(400).send({ status: false, msg: "profileImage is in incorrect format required format must be between: .jpg / .jpeg / .png / .bmp / .gif " });
//             findUserData.profileImage = image;
//         }


//         //updating user document
//         findUserData.save();

//         return res.status(200).send({ status: true, message: "User profile updated", data: findUserData });
//     }
//     catch (error) {
//         res.status(500).send({ status: false, error: error.message })
//     }

// }

const getStudentById = async (req, res) => {
    try {
        let userIdFromToken = req.userId;                                   // collecting userId from request by token

        let userId = req.params.userId;                                     // taking userId, studentId from path params
        let studentId = req.params.studentId;

        userId = userId.trim();
        studentId = studentId.trim();

        // validating user & studentId
        if (!isValidObjectId(userId)) return res.status(400).send({ status: false, message: `userId: ${userId} is invalid.` });
        if (!isValidObjectId(studentId)) return res.status(400).send({ status: false, message: `studentId: ${studentId} is invalid.` });

        if (userIdFromToken != userId) return res.status(403).send({ status: false, message: `unauthorized access userId mismatch with token` });

        // fetching data from DB
        let getStudent = await studentModel.findOne({ userId: userId, studentId: studentId });
        if (!getStudent) return res.status(404).send({ status: false, message: `no Student found with the studentId: ${studentId}, or the requested student data has already been deleted.` });

        // sending response
        return res.status(200).send({ status: true, message: 'Success', data: getStudent });
    }
    catch (error) {
        res.status(500).send({ status: false, error: error.message });
    }
}

const deleteStudent = async (req, res) => {
    try {
        let userIdFromToken = req.userId;                                   // collecting userId from request by token

        let userId = req.params.userId;                                     // taking userId, studentId from path params
        let studentId = req.params.studentId;

        userId = userId.trim();
        studentId = studentId.trim();

        // validating user & studentId
        if (!isValidObjectId(userId)) return res.status(400).send({ status: false, message: `userId: ${userId} is invalid.` });
        if (!isValidObjectId(studentId)) return res.status(400).send({ status: false, message: `studentId: ${studentId} is invalid.` });

        if (userIdFromToken !== userId) return res.status(403).send({ status: false, message: `unauthorized access userId mismatch with token` });

        // fetching data from DB
        let studentData = await studentModel.findByOne({ userId: userId, studentId: studentId });
        if (!studentData) return res.status(404).send({ status: false, message: `No student details found with the studentId: ${studentId}.` });

        if (studentData.isDeleted === true) return res.status(404).send({ status: false, message: `the student with studentId: ${studentId}, has been deleted already.` });

        // deleting the product
        let deleteStudent = await studentModel.findOneAndUpdate(
            { _id: studentId },
            { isDeleted: true, deletedAt: new Date() },
            { new: true }
        );

        // sending response
        return res.status(200).send({ status: true, message: 'Success', data: deleteStudent });

    } catch (error) {
        res.status(500).send({ status: false, error: error.message });
    }
}

//===================== Exporting functions to use globally =====================//
module.exports = { addStudent, getStudentById, deleteStudent };