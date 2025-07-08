const { Request, TYPES} = require('tedious');
const Router = require('express').Router;
const connection = require('../bd/bd');

const router = Router();

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

        require.on

    } catch (error) {
        
    }
});