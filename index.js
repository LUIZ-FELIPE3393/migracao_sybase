const express = require('express');
const http = require('http');
const { spawn, spawnSync } = require('child_process');
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

function inserirTabelaMysql(banco, table, dados) {
    let pyPrc = spawnSync('python', [PATH_SYBASE_API, './json/columns.json', 'q_list_columns', banco, table]);
    let error = pyPrc.stderr?.toString()?.trim();
    if (error) {
        console.error(error);
        throw Error("Erro na migração:", error);
    }

    pyPrc = spawnSync('python', [PATH_SYBASE_API, './json/constraints.json', 'q_related_tables', banco, table]);
    error = pyPrc.stderr?.toString()?.trim();
    if (error) {
        console.error(error);
        throw Error("Erro na migração:", error);
    }

    pyPrc = spawnSync('python', [PATH_MYSQL_API, './json/columns.json', 'create_table', banco, table, './json/constraints.json']);
    console.log(pyPrc.stdout?.toString()?.trim());
    error = pyPrc.stderr?.toString()?.trim();
    if (error) {
        console.error(error);
        throw Error("Erro na migração:", error);
    }

    console.log("Migração bem sucedida");

    if (dados === true) {
        pyPrc = spawnSync('python', [PATH_SYBASE_API, './json/dados.json', 'q_select_all_from_table', banco, table]);
        error = pyPrc.stderr?.toString()?.trim();
        if (error) {
            console.error(error);
            throw Error("Erro na migração:", error);
        }

        pyPrc = spawnSync('python', [PATH_MYSQL_API, './json/dados.json', 'insert_data', banco, table]);
        error = pyPrc.stderr?.toString()?.trim();
        if (error) {
            console.error(error);
            throw Error("Erro na migração:", error);
        }
    }
}

function criarBancoMysql(banco) {
    spawn('python', [PATH_MYSQL_API, PATH_GENERAL_RESULTSET, 'create_schema', banco]);
}

function inserirTabelaSybase(banco, table, dados) {
    let pyPrc = spawnSync('python', [PATH_MYSQL_API, './json/columns.json', 'q_list_columns', banco, table]);
    let error = pyPrc.stderr?.toString()?.trim();
    if (error) {
        console.error(error);
        throw Error("Erro na migração:", error);
    }

    pyPrc = spawnSync('python', [PATH_MYSQL_API, './json/constraints.json', 'q_related_tables', banco, table]);
    error = pyPrc.stderr?.toString()?.trim();
    if (error) {
        console.error(error);
        throw Error("Erro na migração:", error);
    }

    pyPrc = spawnSync('python', [PATH_SYBASE_API, './json/columns.json', 'create_table', banco, table, './json/constraints.json']);
    console.log(pyPrc.stdout?.toString()?.trim());
    error = pyPrc.stderr?.toString()?.trim();
    if (error) {
        console.error(error);
        throw Error("Erro na migração:", error);
    }

    if (dados === true) {
        pyPrc = spawnSync('python', [PATH_MYSQL_API, './json/dados.json', 'q_select_all_from_table', banco, table]);
        error = pyPrc.stderr?.toString()?.trim();
        if (error) {
            console.error(error);
            throw Error("Erro na migração:", error);
        }

        pyPrc = spawnSync('python', [PATH_SYBASE_API, './json/dados.json', 'insert_data', banco, table]);
        console.log(pyPrc.stdout?.toString()?.trim());
        error = pyPrc.stderr?.toString()?.trim();
        if (error) {
            console.error(error);
            throw Error("Erro na migração:", error);
        }
    }

    console.log("Migração bem sucedida");
}

function criarBancoSybase(banco) {
    const pyPrc = spawnSync('python', [PATH_SYBASE_API, PATH_GENERAL_RESULTSET, 'create_database', banco]);
}

app.post("/migrar/mysql", async (req, res) => {
    // Rota da migração
    console.log(req.body);

    try {
        req.body.slice().reverse().forEach(table => {
            console.log(table);
            criarBancoSybase(table["database"]);
            try {
                inserirTabelaSybase(table["database"], table["table"])
            } catch (error) {
                console.error("Erro durante a migração dos banco:", error);
                throw Error("Erro de migração")
            } 
        });
    } catch (error) {
        return res.send(500).send({message: "Erro durante a migração dos banco:" + error});
    }

    return res.status(200).send({message: "Migração bem sucedida"})
})

app.post("/migrar/mysql/dados", async (req, res) => {
    // Rota da migração
    console.log(req.body);

    try {
        req.body.slice().reverse().forEach(table => {
            console.log(table);
            criarBancoSybase(table["database"]);
            try {
                inserirTabelaSybase(table["database"], table["table"], true)
            } catch (error) {
                console.error("Erro durante a migração dos banco:", error);
                throw Error("Erro de migração")
            } 
        });
    } catch (error) {
        return res.send(500).send({message: "Erro durante a migração dos banco:" + error});
    }
    return res.status(200).send({message: "Migração bem sucedida"})
})

app.post("/migrar/sybase", async (req, res) => {
    // Rota da migração
    console.log(req.body);

    try {
        req.body.slice().reverse().forEach(table => {
            console.log(table);
            criarBancoMysql(table["database"]);
            try {
                inserirTabelaMysql(table["database"], table["table"])
            } catch (error) {
                console.error("Erro durante a migração dos banco:", error);
                throw Error("Erro de migração")
            } 
        });
    } catch (error) {
        return res.send(500).send({message: "Erro durante a migração dos banco:" + error});
    }

    return res.status(200).send({message: "Migração bem sucedida"})
})

app.post("/migrar/sybase/dados", async (req, res) => {
    // Rota da migração
    console.log(req.body);

    try {
        req.body.slice().reverse().forEach(table => {
            console.log(table);
            criarBancoMysql(table["database"]);
            try {
                inserirTabelaMysql(table["database"], table["table"], true)
            } catch (error) {
                console.error("Erro durante a migração dos banco:", error);
                throw Error("Erro de migração")
            } 
        });
    } catch (error) {
        return res.send(500).send({message: "Erro durante a migração dos banco:" + error});
    }

    return res.status(200).send("Migração bem sucedida")
})

/* /// ROTAS DE CONSULTA MYSQL /// */

app.post("/mysql-db/:database/:table", (req, res) => {
    // Mostra as tabelas referenciadas pela tabela fornecida
    const pyPrc = spawnSync('python', [PATH_MYSQL_API, PATH_GENERAL_RESULTSET, 'q_related_tables', req.params.database, req.params.table]);

    const result = pyPrc.stdout?.toString()?.trim();
    const error = pyPrc.stderr?.toString()?.trim();

    console.error(error);
    if (error) {
        return res.status(500).send("Problema interno com script python: " + error)
    }

    return res.json(JSON.parse(result));
})

app.get("/mysql-db/:database/:table", (req, res) => {
    // Mostra as colunas da tabela fornecida
    const pyPrc = spawn('python', [PATH_MYSQL_API, PATH_GENERAL_RESULTSET, 'q_list_tables', req.params.database, req.params.table]);

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

app.get("/mysql-db", (req, res) => {
    // Rota consulta bancos do Servidor
    const pyPrc = spawnSync('python', [PATH_MYSQL_API, PATH_GENERAL_RESULTSET, 'q_databases', '']);

    const result = pyPrc.stdout?.toString()?.trim();
    const error = pyPrc.stderr?.toString()?.trim();

    console.error(error);
    if (error) {
        return res.status(500).send("Problema interno com script python: " + error)
    }

    return res.json(JSON.parse(result));
});

app.get("/mysql-db/:database", (req, res) => {
    // Rota consulta tabelas de um banco
    const pyPrc = spawnSync('python', [PATH_MYSQL_API, PATH_GENERAL_RESULTSET, 'q_list_tables', req.params.database]);

    const result = pyPrc.stdout?.toString()?.trim();
    const error = pyPrc.stderr?.toString()?.trim();

    console.error(error);
    if (error) {
        return res.status(500).send("Problema interno com script python: " + error)
    }

    return res.json(JSON.parse(result));
})

/* /// ROTAS DE CONSULTA SYBASE /// */

app.post("/sybase-db/:database/:table", (req, res) => {
    // Mostra as tabelas referenciadas pela tabela fornecida
    const pyPrc = spawnSync('python', [PATH_SYBASE_API, PATH_GENERAL_RESULTSET, 'q_related_tables', req.params.database, req.params.table]);

    const result = pyPrc.stdout?.toString()?.trim();
    const error = pyPrc.stderr?.toString()?.trim();

    console.error(error);
    if (error) {
        return res.status(500).send("Problema interno com script python: " + error)
    }

    return res.json(JSON.parse(result));
})

app.get("/sybase-db/:database/:table", (req, res) => {
    // Mostra as colunas da tabela fornecida
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
    const pyPrc = spawnSync('python', [PATH_SYBASE_API, PATH_GENERAL_RESULTSET, 'q_list_tables', req.params.database]);

    const result = pyPrc.stdout?.toString()?.trim();
    const error = pyPrc.stderr?.toString()?.trim();

    console.error(error);
    if (error) {
        return res.status(500).send("Problema interno com script python: " + error)
    }

    return res.json(JSON.parse(result));
})

app.get("/sybase-db", async (req, res) => {
    // Rota lista os bancos do Sybase
    const pyPrc = spawnSync('python', [PATH_SYBASE_API, PATH_GENERAL_RESULTSET, 'q_databases', '']);

    const result = pyPrc.stdout?.toString()?.trim();
    const error = pyPrc.stderr?.toString()?.trim();

    console.error(error);
    if (error) {
        return res.status(500).send("Problema interno com script python: " + error)
    }

    return res.json(JSON.parse(result));
});
