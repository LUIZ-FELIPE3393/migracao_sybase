// Listar tabelas
fetch('/json/tabelas.json')
    .then((data) => data.json())
    .then((json) => console.log(json));

