const express = require('express');
const http = require('http');
const { spawn } = require('child_process');
const { join } = require('path');
const { readFile } = require('fs');
const path = require('path');
const app = express();
const server = http.createServer(app);
const port = 8080;

app.use(express.urlencoded({ extended: false })); 
app.use(express.json());

server.listen(port, () => console.log(`O server foi aberto na porta ${port}. Acesse em http://localhost:${port}`));

app.use(express.static(__dirname+ '/public'));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "./index.html"));
});

app.get("/json/:filename", (req, res) => {
    readFile("./json/" + req.params.filename, (error, data) => {
        console.log(data)
        return res.json(JSON.parse(data?.toString()))
    })
});

function inserirTabela() {
    let pyPrc = spawn('python', ['./api/con_sybase.py', './api/resultset.json', 'q_list_columns', req.params.database, req.params.table]);
    
    pyPrc.stdout.on('data', (result) => {
        console.log(result);

        // Insere tabela no banco
        pyPrc = spawn('python', ['./api/con_mysql.py', './api/resultset.json', 'create_table', req.params.database, req.params.table]);

        pyPrc.stdout.on('data', (result) => {
            console.log(result);

            // Puxa dados da tabela pro resultset.json
            pyPrc = spawn('python', ['./api/con_sybase.py', './api/resultset.json', 'q_select_all_from_table', req.params.database, req.params.table]);

            pyPrc.stdout.on('data', (result) => {
                console.log(result);

                // Insere dados da tabela no banco
                pyPrc = spawn('python', ['./api/con_mysql.py', './api/resultset.json', 'insert_data', req.params.database, req.params.table]);
            })
        })
    })
}

app.post("/migrar", (req, res) => {

})

app.post("/mysql-db/insere-dados/:database/:table", (req, res) => {
    // Insere dados em tabela existente no MySQL

    // Puxa dados da tabela pro resultset.json
    pyPrc = spawn('python', ['./api/con_sybase.py', './api/resultset.json', 'q_select_all_from_table', req.params.database, req.params.table]);

    pyPrc.stdout.on('data', (result) => {
        console.log(result);

        // Insere dados da tabela no banco
        pyPrc = spawn('python', ['./api/con_mysql.py', './api/resultset.json', 'insert_data', req.params.database, req.params.table]);
    })
})

app.post("/mysql-db/com-dados/:database/:table", (req, res) => {
    // Insere tabela sem dados no MySQL

    // Puxa colunas da tabela pro resultset.json
    let pyPrc = spawn('python', ['./api/con_sybase.py', './api/resultset.json', 'q_list_columns', req.params.database, req.params.table]);
    
    pyPrc.stdout.on('data', (result) => {
        console.log(result);

        // Insere tabela no banco
        pyPrc = spawn('python', ['./api/con_mysql.py', './api/resultset.json', 'create_table', req.params.database, req.params.table]);

        pyPrc.stdout.on('data', (result) => {
            console.log(result);

            // Puxa dados da tabela pro resultset.json
            pyPrc = spawn('python', ['./api/con_sybase.py', './api/resultset.json', 'q_select_all_from_table', req.params.database, req.params.table]);

            pyPrc.stdout.on('data', (result) => {
                console.log(result);

                // Insere dados da tabela no banco
                pyPrc = spawn('python', ['./api/con_mysql.py', './api/resultset.json', 'insert_data', req.params.database, req.params.table]);
            })
        })
    })
});

app.post("/mysql-db/sem-dados/:database/:table", (req, res) => {
    // Insere tabela sem dados no MySQL
    let pyPrc = spawn('python', ['./api/con_sybase.py', './api/resultset.json', 'q_list_columns', req.params.database, req.params.table]);
    
    pyPrc.stdout.on('data', (result) => {
        console.log(result);

        // Insere tabela no banco
        pyPrc = spawn('python', ['./api/con_mysql.py', './api/resultset.json', 'create_table', req.params.database, req.params.table]);
    })
});

app.post("/mysql-db/novo-banco/:database", (req, res) => {
    // Cria novo banco de dados no MySQL
    spawn('python', ['./api/con_mysql.py', './api/resultset.json', 'create_schema', req.params.database]);
});

app.get("/sybase-db/:database/:table", (req, res) => {
    const pyPrc = spawn('python', ['./api/con_sybase.py', './api/resultset.json', 'q_list_tables', req.params.database, req.params.table]);

    pyPrc.stdout.on('data', (result) => {
        console.log(result)

        try {
            readFile('./api/resultset.json', (err, data) => {
                if(err) {
                    console.error(err);
                    throw err;
                }
                const resultParsed = JSON.parse(data?.toString());
                return res.json(resultParsed);
            });
            
        } catch (error) {
            console.error(error);
        }
    })

    pyPrc.stderr.on('error', (error) => {
        console.error(error);
    }) 
});

app.get("/sybase-db/:database", (req, res) => {
    const pyPrc = spawn('python', ['./api/con_sybase.py', './api/resultset.json', 'q_list_tables', req.params.database]);

    pyPrc.stdout.on('data', (result) => {
        console.log(result)

        try {
            readFile('./api/resultset.json', (err, data) => {
                if(err) {
                    console.error(err);
                    throw err;
                }
                const resultParsed = JSON.parse(data?.toString());
                return res.json(resultParsed);
            });
            
        } catch (error) {
            console.error(error);
        }
    })

    pyPrc.stderr.on('error', (error) => {
        console.error(error);
    }) 
})

app.get("/sybase-db", async (req, res) => {
    const pyPrc = spawn('python', ['./api/con_sybase.py', './api/resultset.json', 'q_databases', '']);

    pyPrc.stdout.on('data', (result) => {
        console.log(result)

        try {
            readFile('./api/resultset.json', (err, data) => {
                if(err) {
                    console.error(err);
                    throw err;
                }
                const resultParsed = JSON.parse(data?.toString());
                console.log(resultParsed);
                return res.json(resultParsed);
            });
            
        } catch (error) {
            console.error(error);
        }
    })

    pyPrc.stderr.on('error', (error) => {
        console.error(error);
    })
});
