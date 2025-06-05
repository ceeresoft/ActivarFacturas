const { Request, TYPES } = require('tedious');
const Router = require('express').Router;
const connection = require('./db');

const router = Router();


router.get('BuscarFactura/:IdEmpresaV/:NumeroFactura', async (req, res) => {

    const IdEmpresaV = req.params.IdEmpresaV;
    const NumeroFactura = req.params.NumeroFactura;

    const request = new Request(
        `
        SELECT FC.[Id Factura] FROM Factura FC
        WHERE FC.[Id EmpresaV] = @IdEmpresaV  AND FC.[No Factura] = @NumeroFactura
        `,
        (err) => {
            if (err) {
                console.error('Error executing patient query:', err);
                res.status(500).send('Internal Server Error');
            }
        }

    );

    request.addParameter('IdEmpresaV', TYPES.Int, IdEmpresaV);
    request.addParameter('NumeroFactura', TYPES.VarChar, NumeroFactura);

    let idfactura;

    request.on('row', (columns) => {
        idfactura = columns[0];
    })

    request.on('requestCompleted', async () => {
        idfactura
    }

    )

});




