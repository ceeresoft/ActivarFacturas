const { Connection, Request, TYPES } = require('tedious');
const fs = require('fs');

const filePath = 'C:/CeereSio/CRInfo.ini';
const fileContent = fs.readFileSync(filePath, 'utf-8');

const dataSourceLine = fileContent.split('\n').find(line => line.includes('DataSource'));
const dataSourceValue = dataSourceLine.split('=')[1].split('\\')[0].trim();

const CatalogLine = fileContent.split('\n').find(line => line.trim().startsWith('Catalog='));
const CatalogLineValue = CatalogLine.split('=')[1].split('\\')[0].trim();

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

function ejecutarConsulta(query, parametros = [], onRow, onComplete, onError) {
    const connection = new Connection(config);

    connection.on('connect', (err) => {
        if (err) {
            console.error('Error al conectar a la base de datos:', err.message);
            if (onError) onError(err);
            return;
        }

        const request = new Request(query, (err, rowCount) => {
            if (err) {
                if (onError) onError(err);
            } else {
                if (onComplete) onComplete(rowCount);
            }
            connection.close();
        });

        // Añadir parámetros
        parametros.forEach(p => {
            request.addParameter(p.nombre, p.tipo, p.valor);
        });

        request.on('row', onRow);
        connection.execSql(request);
    });

    connection.connect();
}

module.exports = {
    ejecutarConsulta,
    TYPES
};
