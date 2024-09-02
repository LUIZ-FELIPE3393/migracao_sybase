const tablesInMigration = [] //Pilha de tabelas que serão migradas

document.querySelector("#sybase-form").addEventListener("submit", (event) => {
    event.preventDefault();

    document.querySelector("#sybase-form").querySelector("button[type='submit']").setAttribute("disabled", "");
    fetch('/migrar-sybase', {
        method: "POST", 
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(tablesInMigration)})
        .then(response => {
            console.log(response);
            document.querySelector("#sybase-form").querySelector("button[type='submit']").removeAttribute("disabled");
        })
})

function unblockAllTables(database) {
    document.querySelector("#sybase-form").querySelector("button[type='submit']").removeAttribute("disabled");
    for (const table of document.querySelector(`#${database}`).querySelectorAll("input")) {
        if(table.getAttribute("ref") !== "true")
            table.removeAttribute("disabled");
    }
}

function blockAllTables(database) {
    document.querySelector("#sybase-form").querySelector("button[type='submit']").setAttribute("disabled", "");
    for (const table of document.querySelector(`#${database}`).querySelectorAll("input")) {
        table.setAttribute("disabled", "");
    }
}

function pushToMigration(database, table) {
    if (tablesInMigration.find((t) => { return t.table === table}) === undefined) {
        tablesInMigration.push({table: table, database: database});
    }
}

async function changeTablesInMigration(database, table, checked) {
    await fetch(`/sybase-db/${database}/${table}`, {method: "POST"})
        .then((data) => data.json())
        .then(async (references) => {
            if (checked === true) {
                pushToMigration(database, table);
            } else {
                tablesInMigration.splice(tablesInMigration.indexOf({table: table, database: database}), 1);
            }

            for (const ref of references) {
                if (checked === true) {
                    document.querySelector(`#${ref.ref_table}`).checked = true;
                    document.querySelector(`#${ref.ref_table}`).setAttribute("disabled", "");
                    document.querySelector(`#${ref.ref_table}`).setAttribute("ref", "true");
                    if (table !== ref.ref_table) {
                        console.log(table, ref.ref_table);
                        await changeTablesInMigration(database, ref.ref_table, true);
                    }
                } else {
                    document.querySelector(`#${ref.ref_table}`).removeAttribute("disabled");
                    document.querySelector(`#${ref.ref_table}`).removeAttribute("ref");
                    tablesInMigration.splice(tablesInMigration.indexOf({table: ref.ref_table, database: database}), 1);
                }
            }
        });
}

// Listar os bancos do Sybase
fetch("/sybase-db")
    .then((data) => data.json())
    .then(async (databases) => {
        for (const db of databases) {
            const database = document.createElement("div");
            database.innerHTML = databaseHTML.replaceAll(":name:", db.name);
            document.querySelector("#idSybase").appendChild(database);
            await fetch(`/sybase-db/${db.name}`)
                .then((data) => data.json())
                .then((tables) => {
                    console.log(tables)

                    for (const tb of tables) {
                        const table = document.createElement("div");
                        table.innerHTML = tableHTML.replaceAll(":name:", tb.name).replaceAll(":database:", db.name);
                        document.querySelector("#"+db.name).appendChild(table);
                        table.querySelector("input")
                            .addEventListener("click", async () => {
                                blockAllTables(db.name);
                                await changeTablesInMigration (
                                    db.name, 
                                    tb.name,
                                    table.querySelector('input').checked
                                );
                                unblockAllTables(db.name);
                            })
                    }
                });   
        }
    });

const tableHTML = `
    <input class="form-check-input" type="checkbox" id=":name:" name=":name:" value=":database:">
    <label class="form-check-label">:name:</label><br>
`

const databaseHTML = `
    <!--Botão de expandir 1-->
    <p>
        <button class="btn btn-primary" type="button" data-toggle="collapse" data-target="#:name:" aria-expanded="false" aria-controls="collapseExample">
            :name:
        </button>
    </p>
    <!--Tabelas do banco-->
    <div class="collapse" id=":name:"> 
        
    </div>
`
