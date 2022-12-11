//===================== Importing module and packages =====================//
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const studentModel = require("../models/studentModel");
const userModel = require("../models/userModel");
const { checkEmptyBody, isValid, isValidObjectId, isValidName, isValidNum } = require("../validation/validation");        // validations   


const addStudent = async (req, res) => {
    try {
        let userIdFromToken = req.userId;                               // collecting userId from request by token
        let userIdFromParams = req.params.userId;
        let requestBody = req.body;                                     // taking data from body


        let { studentName, subject, marks, userId } = requestBody;      // destructuring

        // checking if request body is empty
        if (!checkEmptyBody(requestBody)) return res.status(400).send({ status: false, message: "please provide data in request body" });

        // checking all the required fields .. if correct then assigning it 
        if (!isValid(studentName)) return res.status(400).send({ status: false, message: "student name is required" });
        if (!isValid(subject)) return res.status(400).send({ status: false, message: "subject is required" });
        if (!marks) return res.status(400).send({ status: false, message: "marks is required" });
        if (!isValid(userIdFromParams)) return res.status(400).send({ status: false, message: "userId is required" });


        // validating all the required fields 
        if (!isValidName(studentName)) return res.status(400).send({ status: false, message: `studentName: ${studentName} is invalid` });
        if (!isValidName(subject)) return res.status(400).send({ status: false, message: `subject: ${subject} is invalid` });
        if (!isValidObjectId(userIdFromParams)) return res.status(400).send({ status: false, message: `userId: ${userIdFromParams} is invalid` });

        if (userIdFromToken != userIdFromParams) return res.status(403).send({ status: false, message: `unauthorized access userId mismatch with token` });

        // checking that email and password must be unique
        // let isPresentStudent = await userModel.findOne({ userId: userId, studentName: studentName, subject: subject }).lean();
        let updateStudentMarks = await studentModel.findOneAndUpdate(
            { usrId: userIdFromParams, studentName: studentName, subject: subject, isDeleted: false },
            { $inc: { marks: marks } },
            { new: true }
        );
        if (!updateStudentMarks) {
            requestBody.userId = userIdFromParams
            // creating new user
            const createdStudent = await studentModel.create(requestBody);
            return res.status(201).send({ status: true, message: "User created successfully", data: createdStudent });
        }
        return res.status(200).send({ status: true, message: "Student marks updated successfully", data: updateStudentMarks });
    } catch (error) {
        res.status(500).send({ status: false, error: error.message });
    }
}

const updateStudent = async (req, res) => {
    try {

        const userIdFromParam = req.params.userId;                // accessing userId fro url(path param)
        const studentIdFromParam = req.params.studentId;          // accessing userId fro url(path param)
        const data = req.body;                                    // accessing data from body

        // validating userId got from path params
        if (!isValidObjectId(userIdFromParam)) return res.status(400).send({ status: false, message: `userId: ${userIdFromParam} is invalid, Please Provide Valid userId.` });
        if (!isValidObjectId(studentIdFromParam)) return res.status(400).send({ status: false, message: `studentIdFromParam: ${studentIdFromParam} is invalid, Please Provide Valid studentId.` });

        // checking that request body is empty or not
        if (!checkEmptyBody(data)) return res.status(400).send({ status: false, message: "please provide Some field to update." });

        // authorizing user with token's userId
        if (userIdFromParam !== req.userId) return res.status(403).send({ status: false, message: "Unauthorized user access." });

        // finding user in DB
        let findUserData = await userModel.findById(userIdFromParam)
        if (!findUserData) return res.status(400).send({ status: false, message: `User with userId: ${userIdFromParam} is not exist in database.` });

        let findStudentData = await studentModel.findOne({ _id: studentIdFromParam, isDeleted: false })
        if (!findStudentData) return res.status(400).send({ status: false, message: `Student with studentId: ${studentIdFromParam} is not exist in database.` });



        //------------------------------------------update student data ---------------------------------------------------------

        // destructuring fields to update
        let { studentName, subject, marks } = data;

        if (studentName) {
            studentName = studentName.trim();

            if (!isValidName(studentName)) return res.status(400).send({ status: false, message: `studentName: ${studentName}, is Not valid` });

            findStudentData.studentName = studentName;
        }

        if (subject) {
            subject = subject.trim();

            if (!isValidName(subject)) return res.status(400).send({ status: false, message: `subject: ${subject}, is Not valid` });

            findStudentData.subject = subject;
        }

        if (marks) {

            if (!isValidNum(marks)) return res.status(400).send({ status: false, message: `marks: ${marks}, is not valid` });

            findStudentData.marks = marks;
        }

        //updating user document
        findStudentData.save();

        return res.status(200).send({ status: true, message: "Student profile updated", data: findStudentData });
    }
    catch (error) {
        res.status(500).send({ status: false, error: error.message })
    }

}

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
        let getStudent = await studentModel.findOne({ _id: studentId, userId: userId });
        if (!getStudent) return res.status(404).send({ status: false, message: `no Student found with the studentId: ${studentId}, or the requested student data has already been deleted.` });

        // sending response
        return res.status(200).send({ status: true, message: 'Success', data: getStudent });
    }
    catch (error) {
        res.status(500).send({ status: false, error: error.message });
    }
}

const getStudentByFilter = async (req, res) => {
    try {
        const userIdFromParams = req.params.userId;                                             // taking userId from path params
        const queryParams = req.query;                                                          // taking query params data

        userIdFromParams = userIdFromParams.trim();

        if (!isValidObjectId(userIdFromParams)) return res.status(400).send({ status: false, message: `userIdFromParams: ${userIdFromParams} is invalid, Please Provide Valid userId.` });

        // authorizing user with token's userId
        if (userIdFromParams !== req.userId) return res.status(403).send({ status: false, message: "Unauthorized user access." });

        // assigning predefined fields to query criterion
        const filterQueryData = { isDeleted: false, userId: userIdFromParams };                 // creating a custom object

        // destructuring the data got from query
        let { studentName, subject, marks } = queryParams;

        if (studentName) {
            if (!isValidName(studentName)) return res.status(400).send({ status: false, message: `studentName: ${studentName} format is invalid` });
            filterQueryData['studentName'] = studentName.trim();
        }

        if (subject) {
            if (!isValidName(subject)) return res.status(400).send({ status: false, message: `subject: ${subject} format is invalid` });
            filterQueryData['subject'] = subject.trim();
        }

        if (marks) {
            if (!isValidNum(marks)) return res.status(400).send({ status: false, message: `marks: ${marks} format is invalid` });
            filterQueryData['marks'] = marks.trim();
        }

        // querying in Db with filterData
        const findStudentData = await studentModel.find(filterQueryData).sort({ marks: 1 });
        if (findStudentData.length === 0) return res.status(404).send({ status: false, message: 'no student found' });

        return res.status(200).send({ status: true, message: 'Success', data: findStudentData });
    } catch (error) {
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
        let studentData = await studentModel.findOne({ _id: studentId, userId: userId });
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
module.exports = { addStudent, getStudentById, getStudentByFilter, updateStudent, deleteStudent };