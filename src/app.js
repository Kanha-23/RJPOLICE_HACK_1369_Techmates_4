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
const generatePDFRoute = require('./routes/generatePDF');
const { PythonShell } = require('python-shell');
const app = express();
const { spawn } = require('child_process');

const multer = require('multer');
const upload = multer({ dest: 'public/uploads/' });






// Add this function to run Python scripts asynchronously
function runPythonScriptAsync(scriptPath, ...args) {
  return new Promise((resolve, reject) => {
    PythonShell.run(scriptPath, { args }, (err, results) => {
      if (err) reject(err);
      else resolve(results.join("\n"));
    });
  });
}





// ...

app.use(bodyParser.urlencoded({ extended: true }));
app.use("/public", express.static("public"));
app.use(upload.single('fileToOCR'));

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


// ...

// New route to handle file upload and trigger OCR
// ...

// New route to handle file upload and trigger OCR
app.post("/perform_ocr", async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("No file uploaded");
    }

    const filePath = req.file.path;

    // Run OCR script asynchronously using spawn
    const pythonProcess = spawn('python', ['python_scripts/ocr.py', filePath]);

    let ocrOutput = '';

    pythonProcess.stdout.on('data', (data) => {
      ocrOutput += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error(`Python Script Error: ${data}`);
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        // Send the OCR output to the client
        res.status(200).json(JSON.parse(ocrOutput));
      } else {
        console.error(`Python Script exited with code ${code}`);
        res.status(500).send("Internal Server Error");
      }
    });

  } catch (error) {
    console.error("Error performing OCR:", error);
    res.status(500).send("Internal Server Error");
  }
});


// New route to trigger Python script execution
// ...

// New route to handle file upload and trigger OCR
app.post("/perform_ocr", async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("No file uploaded");
    }

    const filePath = req.file.path;

    // Run OCR script asynchronously
    const ocrOutput = await runPythonScriptAsync("python_scripts/ocr.py", filePath);

    // Send the OCR output to the client
    res.status(200).json(JSON.parse(ocrOutput));
  } catch (error) {
    console.error("Error performing OCR:", error);
    res.status(500).send("Internal Server Error");
  }
});


main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/RJPOLICE_HACK");
  console.log("Database connected");
}

app.listen(5000, () => {
  console.log("Server started on port 5000");
});
