const { Request, TYPES} = require('tedious');
const Router = require('express').Router;
const connection = require('../bd/bd');

const router = Router();


router.get('/', (req, res) => {
    res.status(200).send('Todo esta ok');
})

router.get('/PruebaFactura', async (req, res) => {
    try {
        const request = new Request(
            'SELECT TOP(1) *  FROM Factura', (err) => {
                if(err){
                    console.error(`Error de Consulta ${err}`);
                    if(!res.headersSent){
                        res.status(500).send(`Error Interno del servidor ${err}`);
                    }
                }
            }
        );

        let resultados = [];

        request.on('row', (Columns) => {
            let factura = {
                idfactura: Columns[0].value
            };
            resultados.push(factura);
        });

         request.on('requestCompleted', () => {
            console.log('Resultados de la consulta:');
            console.log(resultados);
            if (!res.headersSent) {
                res.json(resultados);  
            }
        });

        request.on('error', (err) => {
            console.error('Error en la consulta:', err);
            if (!res.headersSent) {
                res.status(500).send('Error interno del servidor');
            }
        });

        connection.execSql(request);

    } catch (error) {
        console.error('Error en la conexión o en la ejecución de la consulta:', error);
        if (!res.headersSent) {
            res.status(500).send('Error interno del servidor');
        }
    }
});

module.exports = router;