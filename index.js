const express = require('express');
const http = require('http');
const { spawn } = require('child_process');
const { join } = require('path');
const { readFile, writeFile } = require('fs');
const path = require('path');
const app = express();
const server = http.createServer(app);
const port = 8080;

const PATH_MYSQL_API = './api/con_mysql.py';
const PATH_SYBASE_API = './api/con_sybase.py';

const PATH_GENERAL_RESULTSET = './json/resultset.json';
const PATH_DATA_RESULTSET = './json/data.json';
const PATH_TABLE_RESULTSET = './json/tables.py';


app.use(express.urlencoded({ extended: false })); 
app.use(express.json());

server.listen(port, () => console.log(`O server foi aberto na porta ${port}. Acesse em http://localhost:${port}`));

app.use(express.static(__dirname+ '/public'));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "./index.html"));
});

app.get("/json/:filename", (req, res) => {
    // Rota dos arquivos
    readFile("./json/" + req.params.filename, (error, data) => {
        console.log(data)
        return res.json(JSON.parse(data?.toString()))
    })
});

/*function inserirTabela(banco, table) {
    let pyPrc = spawn('python', ['./api/con_sybase.py', './api/resultset.json', 'q_list_columns', banco, table]);
    
    pyPrc.stdout.on('data', (result) => {
        console.log(result);

        // Insere tabela no banco
        pyPrc = spawn('python', ['./api/con_mysql.py', './api/resultset.json', 'create_table', banco, table]);

        pyPrc.stdout.on('data', (result) => {
            console.log(result);

            // Puxa dados da tabela pro resultset.json
            pyPrc = spawn('python', ['./api/con_sybase.py', './api/resultset.json', 'q_select_all_from_table', banco, table]);

            pyPrc.stdout.on('data', (result) => {
                console.log(result);

                // Insere dados da tabela no banco
                pyPrc = spawn('python', ['./api/con_mysql.py', './api/resultset.json', 'insert_data', banco, table]);
            })
        })
    })
}*/

function inserirTabela(banco, table) { // TESTE
    fetch('/json/funcionario_c').then(data => data.json()).then(json => {
        writeFile('/api/resultset.json', JSON.stringify(json))

        pyPrc = spawn('python', [PATH_MYSQL_API, './json/resultset.json', 'create_table', banco, table]);

        pyPrc.stdout.on('data', (result) => {

        })
    })

    let pyPrc = spawn('python', [PATH_SYBASE_API, './json/resultset.json', 'q_list_columns', banco, table]);
    
    pyPrc.stdout.on('data', (result) => {
        console.log(result);

        // Insere tabela no banco
        pyPrc = spawn('python', [PATH_MYSQL_API, './json/resultset.json', 'create_table', banco, table]);

        pyPrc.stdout.on('data', (result) => {
            console.log(result);

            // Puxa dados da tabela pro resultset.json
            pyPrc = spawn('python', [PATH_SYBASE_API, './json/resultset.json', 'q_select_all_from_table', banco, table]);

            pyPrc.stdout.on('data', (result) => {
                console.log(result);

                // Insere dados da tabela no banco
                pyPrc = spawn('python', [PATH_MYSQL_API, './json/resultset.json', 'insert_data', banco, table]);
            })
        })
    })
}

function criarBanco(banco) {
    spawn('python', [PATH_MYSQL_API, './json/resultset.json', 'create_schema', banco]);
}

app.post("/migrar", (req, res) => {
    // Rota da migração

    for (const table in req.body){
        criarBanco(req.body[table])
        console.log(table, req.body[table])
        inserirTabela(table, req.body[table])
    }
})

app.post("/mysql-db/insere-dados/:database/:table", (req, res) => {
    // Insere dados em tabela existente no MySQL

    // Puxa dados da tabela pro resultset.json
    pyPrc = spawn('python', [PATH_SYBASE_API, './json/resultset.json', 'q_select_all_from_table', req.params.database, req.params.table]);

    pyPrc.stdout.on('data', (result) => {
        console.log(result);

        // Insere dados da tabela no banco
        pyPrc = spawn('python', [PATH_MYSQL_API, './json/resultset.json', 'insert_data', req.params.database, req.params.table]);
    })
})

app.post("/mysql-db/com-dados/:database/:table", (req, res) => {
    // Insere tabela sem dados no MySQL

    // Puxa colunas da tabela pro resultset.json
    let pyPrc = spawn('python', [PATH_SYBASE_API, './json/resultset.json', 'q_list_columns', req.params.database, req.params.table]);
    
    pyPrc.stdout.on('data', (result) => {
        console.log(result);

        // Insere tabela no banco
        pyPrc = spawn('python', ['./api/con_mysql.py', './json/resultset.json', 'create_table', req.params.database, req.params.table]);

        pyPrc.stdout.on('data', (result) => {
            console.log(result);

            // Puxa dados da tabela pro resultset.json
            pyPrc = spawn('python', ['./api/con_sybase.py', './json/resultset.json', 'q_select_all_from_table', req.params.database, req.params.table]);

            pyPrc.stdout.on('data', (result) => {
                console.log(result);

                // Insere dados da tabela no banco
                pyPrc = spawn('python', ['./api/con_mysql.py', './json/resultset.json', 'insert_data', req.params.database, req.params.table]);
            })
        })
    })
});

app.post("/mysql-db/sem-dados/:database/:table", (req, res) => {
    // Insere tabela sem dados no MySQL
    let pyPrc = spawn('python', ['./api/con_sybase.py', './json/resultset.json', 'q_list_columns', req.params.database, req.params.table]);
    
    pyPrc.stdout.on('data', (result) => {
        console.log(result);

        // Insere tabela no banco
        pyPrc = spawn('python', ['./api/con_mysql.py', './json/resultset.json', 'create_table', req.params.database, req.params.table]);
    })
});

app.post("/mysql-db/novo-banco/:database", (req, res) => {
    // Cria novo banco de dados no MySQL
    spawn('python', [PATH_MYSQL_API, PATH_GENERAL_RESULTSET, 'create_schema', req.params.database]);
});

app.get("/sybase-db/:database/:table", (req, res) => {
    const pyPrc = spawn('python', [PATH_SYBASE_API, PATH_GENERAL_RESULTSET, 'q_list_tables', req.params.database, req.params.table]);

    pyPrc.stdout.on('data', (result) => {
        console.log(result)

        try {
            readFile(PATH_GENERAL_RESULTSET, (err, data) => {
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
    // Rota retorna tabelas de um banco
    const pyPrc = spawn('python', [PATH_SYBASE_API, PATH_GENERAL_RESULTSET, 'q_list_tables', req.params.database]);

    pyPrc.stdout.on('data', (result) => {
        console.log(result)

        try {
            readFile(PATH_GENERAL_RESULTSET, (err, data) => {
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
    // Rota lista os bancos do Sybase
    const pyPrc = spawn('python', [PATH_SYBASE_API, PATH_GENERAL_RESULTSET, 'q_databases', '']);

    pyPrc.stdout.on('data', (result) => {
        console.log(result)

        try {
            readFile(PATH_GENERAL_RESULTSET, (err, data) => {
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
