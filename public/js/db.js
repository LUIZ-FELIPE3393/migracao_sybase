// Listar bancos de dados
fetch('/sybase-db').then((data) => console.log(data));

/*
fetch('/a')
    .then((response) => response.json())
    .then((body) => {
        console.log(body);
    }).catch((error) => {
        console.error('error in execution', error);
    })*/