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
