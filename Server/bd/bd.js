const {Connection, Request, TYPES} = require('tedious');
const fs = require('fs');
const { ErrorMessageToken } = require('tedious/lib/token/token');
// const { Server } = require('http');
// const { type } = require('os');
// const { error } = require('console');
// const exp = require('constants');

const connections= [];

const RutaCrInfo = 'C:/CeereSio/CRInfo.ini';

const ContenidoCRInfo = fs.readFileSync (RutaCrInfo, 'utf-8');

const LineaDataSource = ContenidoCRInfo.split('\n').find(line => line.includes('DataSource'));

const ValorDataSource = LineaDataSource.split('=')[1].split('\\')[0].trim();

console.log('Source => ' , ValorDataSource );

const LienaCatalog = ContenidoCRInfo.split('\n').find(line => line.trim().startsWith('Catalog='));

console.log(LienaCatalog);


// const ValorCatalog = LienaCatalog.split('=')[1];
const ValorCatalog = LienaCatalog.split('=')[1].split('\\')[0].trim();

console.log('Catalog => ', ValorCatalog);


const config = {
    server: ValorDataSource,
    authentication: {
        type: 'default',
        options: {
            userName: 'CeereRIPS',
            password: 'crsoft'
        }
    },
    options: {
        encrypt: false,
        trustServerCertificate: true,
        language: 'Spanish',
        requestTimeout: 300000,
    },
};


const connection = new Connection(config);

connection.connect();

connection.on('connect', (err) => {
    if(err){
        console.error('ERROR AL INTENTAR CONECTAR CON EL SERVIDOR O LA BASE DE DATOS ', err.message);
        
    }else{
        console.log('Conectado Correctamente a la base de datos');
        
    }
});

module.exports = connection;







