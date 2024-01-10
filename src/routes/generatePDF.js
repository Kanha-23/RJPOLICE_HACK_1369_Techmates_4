const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');

router.get('/', (req, res) => {
    const pythonProcess = spawn('python', ['path/to/fir_generator.py']);

    pythonProcess.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    pythonProcess.on('close', (code) => {  
        console.log(`child process exited with code ${code}`);
        // Assuming the PDF is generated successfully, send it to the client
        res.sendFile('FIR_Report.pdf', { root: '.' });
    });
});

module.exports = router;
