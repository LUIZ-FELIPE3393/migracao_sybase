const mysqlForm = document.querySelector("#mysql-form");

mysqlForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const server = mysqlForm.querySelector("#idServer").value;
    const port = mysqlForm.querySelector("#idUsuario").value;
    const user = mysqlForm.querySelector("#idPorta").value;
    const password = mysqlForm.querySelector("#idSenha").value;

    console.log(server, port, user, password);

    mysqlForm.querySelector("button[type='submit']").setAttribute("disabled", "");
    fetch('/migrar/mysql/dados', {
        method: "POST", 
        headers: {
            'Content-Type': 'application/json',
            'mysql-server': server,
            'mysql-port': port, 
            'mysql-user': user, 
            'mysql-password': password
        },
        body: JSON.stringify(tablesInMigrationSybase)})
        .then(response => {
            console.log(response);
            document.querySelector("#console").textContent = response.status + " : " + response.statusText;
            mysqlForm.querySelector("button[type='submit']").removeAttribute("disabled");
        })
})

function unblockAllTablesMysql(database) {
    sybaseForm.querySelector("button[type='submit']").removeAttribute("disabled");
    for (const table of document.querySelector(`#MYSQL_${database}`).querySelectorAll("input")) {
        if(table.getAttribute("ref") !== "true")
            table.removeAttribute("disabled");
    }
}

function blockAllTablesMysql(database) {
    sybaseForm.querySelector("button[type='submit']").setAttribute("disabled", "");
    for (const table of document.querySelector(`#MYSQL_${database}`).querySelectorAll("input")) {
        table.setAttribute("disabled", "");
    }
}

async function changetablesInMigrationMySQL(database, table, checked) {
    await fetch(`/mysql-db/${database}/${table}`, {method: "POST"})
        .then((data) => data.json())
        .then(async (references) => {
            if (checked === true) {
                pushToMigration(database, table);
            } else {
                tablesInMigrationSybase.splice(tablesInMigrationSybase.indexOf({table: table, database: database}), 1);
            }

            for (const ref of references) {
                if (checked === true) {
                    mysqlForm.querySelector(`#${ref.ref_table}`).checked = true;
                    if (table !== ref.ref_table) {
                        console.log(table, ref.ref_table);
                        mysqlForm.querySelector(`#${ref.ref_table}`).setAttribute("ref", "true");
                        await changetablesInMigrationMySQL(database, ref.ref_table, true);
                    }
                } else {
                    mysqlForm.querySelector(`#${ref.ref_table}`).removeAttribute("ref");
                    tablesInMigrationSybase.splice(tablesInMigrationSybase.indexOf({table: ref.ref_table, database: database}), 1);
                }
            }
        });
}

// Listar os bancos do Sybase
fetch("/mysql-db")
    .then((data) => data.json())
    .then(async (databases) => {
        for (const db of databases) {
            const database = document.createElement("div");
            database.innerHTML = databaseHTML.replaceAll(":name:", db.name).replaceAll(":target:", "MYSQL_"+db.name);
            document.querySelector("#idMysql").querySelector("#idFormbnc").appendChild(database);
            await fetch(`/mysql-db/${db.name}`)
                .then((data) => data.json())
                .then((tables) => {
                    console.log(tables)

                    for (const tb of tables) {
                        const table = document.createElement("div");
                        table.innerHTML = tableHTML.replaceAll(":name:", tb.name).replaceAll(":database:", db.name);
                        document.querySelector("#MYSQL_"+db.name).appendChild(table);
                        table.querySelector("input")
                            .addEventListener("click", async () => {
                                blockAllTablesMysql(db.name);
                                await changetablesInMigrationMySQL (
                                    db.name, 
                                    tb.name,
                                    table.querySelector('input').checked
                                );
                                unblockAllTablesMysql(db.name);
                            })
                    }
                });   
        }
    });
