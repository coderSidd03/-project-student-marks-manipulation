
//===================== Importing express module =====================//
const express = require("express");
const { registerUser, loginUser } = require("../controllers/userController");
const { addStudent, getStudentById, getStudentByFilter, updateStudent, deleteStudent } = require("../controllers/studentController");
const { authUser } = require("../Auth/auth");

const router = express.Router();                                                       // storing Router object 



//---------------------------------------->   - User API -    <----------------------------------------------//
router.post("/user/register", registerUser);                    // >>>>> user creation                  (post-api)
router.post("/user/login", loginUser);                          // >>>>> user login                     (post-api)

//--------------------------------------->   - Student API -   <---------------------------------------------//
router.post("/student/register/:userId", authUser, addStudent);                 // >>>>> student creation                   (post-api)
router.get("/student/get/:studentId/:userId", authUser, getStudentById);        // >>>>> student data                       (get-api)
router.get("/student/get/:userId", authUser, getStudentByFilter);               // >>>>> student data                       (get-api)
router.put("/student/get/:studentId/:userId", authUser, updateStudent);         // >>>>> student update                     (put-api)
router.delete("/student/delete/:studentId/:userId", authUser, deleteStudent);   // >>>>> student deletion                   (delete-api)


//---------------------------------------->   - For All Incorrect Path Calling -    <----------------------------------------------//
router.all('/*', async (req, res) => { return res.status(404).send({ status: false, message: "Page Not Found" }); });


module.exports = router;        // exporting router