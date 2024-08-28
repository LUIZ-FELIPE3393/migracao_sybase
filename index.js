const express = require('express');
const { spawn } = require('child_process');
const { join } = require('path');
const { readFile } = require('fs');
const app = express();
const port = 8080;

app.get("/", (req, res) => {
    const pyPrc = spawn('python', ['./api/sybase.py', 'q_count', 'cliente', './api/resultset.json']);

    const result = pyPrc.stdout?.toString()?.trim();
    const error = pyPrc.stderr?.toString()?.trim();

    const status = result === 'OK';

    if (status) {
        try {
            const buffer = readFile('/api/resultset.json');
            const resultParsed = JSON.parse(buffer?.toString());
            console.log("19 - ", resultParsed);
            res.send(resultParsed.toString());
        } catch (error) {
            console.error(error);
        }
        
    } else {
        console.error(error);
        res.send("Erro");
    }
});

app.listen(port, () => console.log(`O server foi aberto na porta ${port}. Acesse em http://localhost:${port}`));