//===================== Importing module and packages =====================//
const express = require("express");
const mongoose = require("mongoose");
const moment = require("moment")
const route = require("./routes/route");
const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.json());

//===================== Connecting Mongo DB database cluster =====================//
mongoose.connect("mongodb+srv://soumya03:HDDAkiZhotm1eGf5@cluster0.ge3cm6p.mongodb.net/mini_project_student-data-manipulation", {
  useNewUrlParser: true
})
  .then(() => console.log('database connected..'))
  .catch(error => console.log(error))

//===== Global Middleware for Console the Date, Time, IP Address and Print the particular API Route Name when you will hit that API ========//
app.use(
  function printDetails(req, res, next) {
    const dateTime = moment().format('YYYY-MM-DD hh:mm:ss');
    console.log(`||->> Date: ${dateTime}  ||->> IP Address: ${req.ip}  ||->> Route Called: ${req.originalUrl} ----- ||`);
    next();
  }
);


app.use('/', route)

//===================== server =====================//
app.listen(PORT, () => console.log(`express app running on: ${PORT}..`));

