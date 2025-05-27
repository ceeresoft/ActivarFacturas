const { Connection, Request, TYPES } = require('tedious');
const fs = require('fs');


const connections = [];

// Ruta completa al archivo CRInfo.ini
const filePath = 'C:/CeereSio/CRInfo.ini';

// Leer el contenido del archivo de manera síncrona (puede ser asíncrona también)
const fileContent = fs.readFileSync(filePath, 'utf-8');

// Buscar la línea que contiene "DataSource"
const dataSourceLine = fileContent.split('\n').find(line => line.includes('DataSource'));

// Obtener el valor después del '=' y antes del '\'
const dataSourceValue = dataSourceLine.split('=')[1].split('\\')[0].trim();

// Buscar la línea que contiene exactamente Catalog
const CatalogLine = fileContent.split('\n').find(line => line.trim().startsWith('Catalog='));
const CatalogLineValue = CatalogLine.split('=')[1].split('\\')[0].trim();
console.log(CatalogLineValue);

const config = {
    server: dataSourceValue,
    authentication: {
        type: 'default',
        options: {
            userName: 'CeereRIPS',
            password: 'crsoft'
        }
    },
    options: { 
        port: 1433,
        database: CatalogLineValue,
        encrypt: false,
        requestTimeout: 30000000
    }
};

const connection = new Connection(config);

connection.connect();

connection.on('connect', (err) => {
    if (err) {
        console.error('Error al conectarse a la base de datos:', err.message);
    } else {
        console.log('Conectado a la base de datos');
    }
});


module.exports = connection;