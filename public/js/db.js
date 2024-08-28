// Listar bancos de dados
fetch('/sybase-db')
    .then((data) => data.json())
    .then((json) => console.log(json));

