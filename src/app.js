const express = require("express");
const hbs = require("hbs");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const child_process = require("child_process");
const pdfRoute = require('./routes/pdf'); 
const mainRoute = require("./routes/main");
const User = require("./models/users");
const userRoute = require("./routes/user");
const authMiddleware = require("./controller/authMiddleware");
const dashboardRoute = require("./routes/dashboard");
const complainformRoute = require("./routes/complainform");
const historyRoute = require("./routes/history");
const { spawn } = require('child_process');   
const generatePDFRoute = require('./routes/generatePDF');
const app = express();
    
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/public", express.static("public"));

app.use(flash());   

app.use(
  session({
    secret: "your-secret-key", // Change this to a strong, random string
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use('', pdfRoute);
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.set("view engine", "hbs");
app.set("views", "views");
hbs.registerPartials("views/partials");
hbs.registerHelper("eq", function (v1, v2) {
  return v1 === v2;
});

// Your existing routes
app.use("", dashboardRoute);
app.use("", mainRoute);
app.use("", userRoute);
app.use("", complainformRoute);
app.use("", historyRoute);
app.use('/generate-pdf', generatePDFRoute);
 
// New route to trigger Python script execution
app.post("/generate_fir", (req, res) => {
  const complaint = req.body.complaint;

  const pythonProcess = child_process.spawn(
    "python",
    ["src/python_script/fir_generator.py", complaint]
  );

  pythonProcess.stdout.on("data", (data) => {
    console.log(`Python Script Output: ${data}`);
    res.send(data);
  });

  pythonProcess.stderr.on("data", (data) => {
    console.error(`Python Script Error: ${data}`);
    res.status(500).send("Internal Server Error");
  });
});
 
main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/RJPOLICE_HACK");
  console.log("Database connected");
}

app.listen(4000, () => {
  console.log("Server started on port 4000");
});
