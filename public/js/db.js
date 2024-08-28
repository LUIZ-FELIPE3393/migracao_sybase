// Listar tabelas
fetch('/json/tabelas.json')
    .then((data) => data.json())
    .then((json) => console.log(json));

fetch('/mysql-db/com-dados/bd2024/venda')
    .then((data) => data.json())
    .then((json) => console.log(json));

fetch('/mysql-db/com-dados/bd2024/venda')
    .then((data) => data.json())
    .then((json) => console.log(json));
