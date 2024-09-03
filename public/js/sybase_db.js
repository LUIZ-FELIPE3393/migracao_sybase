const tablesInMigrationSybase = [] //Pilha de tabelas que serão migradas
const sybaseForm = document.querySelector("#sybase-form");

sybaseForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const server = sybaseForm.querySelector("#idServer").value;
    const port = sybaseForm.querySelector("#idUsuario").value;
    const user = sybaseForm.querySelector("#idPorta").value;
    const password = sybaseForm.querySelector("#idSenha").value;

    const dados = sybaseForm.querySelector("#check2");

    console.log(server, port, user, password);

    sybaseForm.querySelector("button[type='submit']").setAttribute("disabled", "");
    if (dados.checked === true) {
        fetch('/migrar/sybase/dados', {
            method: "POST", 
            headers: {
                'Content-Type': 'application/json',
                'sybase-server': server,
                'sybase-port': port, 
                'sybase-user': user, 
                'sybase-password': password
            },
            body: JSON.stringify(tablesInMigrationSybase)})
            .then(response => {
                console.log(response);
                sybaseForm.querySelector("button[type='submit']").removeAttribute("disabled");
            })
    } else {
        fetch('/migrar/sybase', {
            method: "POST", 
            headers: {
                'Content-Type': 'application/json',
                'sybase-server': server,
                'sybase-port': port, 
                'sybase-user': user, 
                'sybase-password': password
            },
            body: JSON.stringify(tablesInMigrationSybase)})
            .then(response => {
                console.log(response);
                sybaseForm.querySelector("button[type='submit']").removeAttribute("disabled");
            })
    }
    
})

function unblockAllTablesSybase(database) {
    sybaseForm.querySelector("button[type='submit']").removeAttribute("disabled");
    for (const table of document.querySelector(`#SYBASE_${database}`).querySelectorAll("input")) {
        if(table.getAttribute("ref") !== "true")
            table.removeAttribute("disabled");
    }
}

function blockAllTablesSybase(database) {
    sybaseForm.querySelector("button[type='submit']").setAttribute("disabled", "");
    for (const table of document.querySelector(`#SYBASE_${database}`).querySelectorAll("input")) {
        table.setAttribute("disabled", "");
    }
}

function pushToMigration(database, table) {
    const dependency = tablesInMigrationSybase.find((t) => { return t.table === table});
    if (dependency === undefined) {
        tablesInMigrationSybase.push({table: table, database: database});
    } else {
        const index = tablesInMigrationSybase.indexOf(dependency);
        tablesInMigrationSybase.splice(index, 1);
        tablesInMigrationSybase.push({table: table, database: database});
        console.log(index, tablesInMigrationSybase);
    }
}

async function changetablesInMigrationSybase(database, table, checked) {
    await fetch(`/sybase-db/${database}/${table}`, {method: "POST"})
        .then((data) => data.json())
        .then(async (references) => {
            if (checked === true) {
                pushToMigration(database, table);
            } else {
                tablesInMigrationSybase.splice(tablesInMigrationSybase.indexOf({table: table, database: database}), 1);
            }

            for (const ref of references) {
                if (checked === true) {
                    document.querySelector(`#${ref.ref_table}`).checked = true;
                    if (table !== ref.ref_table) {
                        console.log(table, ref.ref_table);
                        document.querySelector(`#${ref.ref_table}`).setAttribute("ref", "true");
                        await changetablesInMigrationSybase(database, ref.ref_table, true);
                    }
                } else {
                    document.querySelector(`#${ref.ref_table}`).removeAttribute("ref");
                    tablesInMigrationSybase.splice(tablesInMigrationSybase.indexOf({table: ref.ref_table, database: database}), 1);
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
            database.innerHTML = databaseHTML.replaceAll(":name:", db.name).replaceAll(":target:", "SYBASE_"+db.name);
            document.querySelector("#idSybase").querySelector("#idFormbnc").appendChild(database);
            await fetch(`/sybase-db/${db.name}`)
                .then((data) => data.json())
                .then((tables) => {
                    console.log(tables)
                    for (const tb of tables) {
                        const table = document.createElement("div");
                        table.innerHTML = tableHTML.replaceAll(":name:", tb.name).replaceAll(":database:", db.name);
                        document.querySelector("#SYBASE_"+db.name).appendChild(table);
                        table.querySelector("input")
                            .addEventListener("click", async () => {
                                blockAllTablesSybase(db.name);
                                await changetablesInMigrationSybase (
                                    db.name, 
                                    tb.name,
                                    table.querySelector('input').checked
                                );
                                unblockAllTablesSybase(db.name);
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
        <button class="btn btn-primary" type="button" data-toggle="collapse" data-target="#:target:" aria-expanded="false" aria-controls="collapseExample">
            :name:
        </button>
    </p>
    <!--Tabelas do banco-->
    <div class="collapse" id=":target:"> 
        
    </div>
`
