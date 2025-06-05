const express = require('express');
const { Request, TYPES } = require('tedious');
const connection = require('./db');

const app = express();
const PORT = 3001;


app.get('/BuscarFactura/:IdEmpresaV/:NumeroFactura', (req, res) => {
    const { IdEmpresaV, NumeroFactura } = req.params;

    const request = new Request(
        `
        SELECT FC.[Id Factura] FROM Factura FC
        WHERE FC.[Id EmpresaV] = @IdEmpresaV AND FC.[No Factura] = @NumeroFactura
        `,
        (err) => {
            if (err) {
                console.error('Error ejecutando la consulta:', err);
                return res.status(500).send('Error interno del servidor');
            }
        }
    );

    request.addParameter('IdEmpresaV', TYPES.Int, parseInt(IdEmpresaV));
    request.addParameter('NumeroFactura', TYPES.VarChar, NumeroFactura);

    let idFactura = null;

    request.on('row', (columns) => {
        idFactura = columns[0].value;
    });

    request.on('requestCompleted', () => {
        if (idFactura !== null) {
            res.json({ idFactura });
        } else {
            res.status(404).send('Factura no encontrada');
        }
    });

    connection.execSql(request);
});


app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
