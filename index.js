const express = require('express');
const { spawn } = require('child_process');
const { join } = require('path');
const { readFile } = require('fs');
const app = express();
const port = 8080;

app.get("/", (req, res) => {
    const pyPrc = spawn('python', ['./api/sybase.py', 'q_count', 'cliente', './api/resultset.json']);

    pyPrc.stdout.on('data', (result) => {
        try {
            readFile('./api/resultset.json', (err, data) => {
                if(err) {
                    console.error(err);
                    throw err;
                }
                const resultParsed = JSON.parse(data?.toString());
                res.send(resultParsed);
            });
            
        } catch (error) {
            console.error(error);
        }
    })
});

app.listen(port, () => console.log(`O server foi aberto na porta ${port}. Acesse em http://localhost:${port}`));