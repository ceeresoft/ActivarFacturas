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

const connection = new Connection(config);

function consultarFactura(idFactura, callback) {
    const request = new Request(
        `SELECT * FROM [Factura] WHERE [id factura] = @IdFactura`,
        (err, rowCount) => {
            if (err) {
                console.error('Error al ejecutar la consulta:', err.message);
                callback(err);
            } else if (rowCount === 0) {
                console.log('No se encontró la factura con ID:', idFactura);
                callback(null, null);
            }
        }
    );

    let facturaEncontrada = null;

    request.addParameter('IdFactura', TYPES.Int, idFactura);

    request.on('row', (columns) => {
        facturaEncontrada = {};
        columns.forEach(column => {
            facturaEncontrada[column.metadata.colName] = column.value;
        });
    });

    request.on('requestCompleted', () => {
        callback(null, facturaEncontrada);
    });

    connection.execSql(request);
}

function actualizarEstadoFactura(idFactura, nuevoEstado, callback) {
    const request = new Request(
        `UPDATE [Factura] SET [EstadoFacturaElectronica] = @Estado WHERE [id factura] = @IdFactura`,
        (err, rowCount) => {
            if (err) {
                console.error('Error al actualizar la factura:', err.message);
                callback(err);
            } else {
                console.log(`Factura actualizada correctamente. Filas afectadas: ${rowCount}`);
                callback(null, rowCount);
            }
        }
    );

    request.addParameter('Estado', TYPES.NVarChar, nuevoEstado);
    request.addParameter('IdFactura', TYPES.Int, idFactura);

    connection.execSql(request);
}

connection.connect();

connection.on('connect', (err) => {
    if (err) {
        console.error('Error al conectarse a la base de datos:', err.message);
        return;
    }

    console.log('Conectado a la base de datos');

    consultarFactura(83361, (err, factura) => {
        if (err) return;

        if (factura) {
            console.log('Factura encontrada:', factura);

            actualizarEstadoFactura(83361, 'Procesado', (err, rowsAffected) => {
                if (err) return;
                console.log('Actualización finalizada.');
                connection.close();
            });

        } else {
            console.log('No se pudo actualizar porque la factura no existe.');
            connection.close();
        }
    });
});
