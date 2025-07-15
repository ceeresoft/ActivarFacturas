const { Request, TYPES} = require('tedious');  //permite conectarse a sql desde js
const Router = require('express').Router;      //servicio web
const connection = require('../bd/bd');        //conexion con la base de datos
const { request } = require('express');
const { lchmod } = require('fs/promises');
const { error } = require('console');
const { types } = require('util');

const router = Router();                       //agrupacion de las rutas

// ✅ Ruta de prueba simple para verificar si el servidor responde
router.get('/', (req, res) => {
    res.status(200).json({ message: 'Todo está ok' });
});

// ✅ Ruta para obtener una factura de prueba (la primera encontrada)
router.get('/PruebaFactura', async (req, res) => {
    try {
        const request = new Request(
            'SELECT TOP(1) * FROM Factura',
            (err) => {
                if (err) {
                    console.error(`Error de consulta: ${err}`);
                    if (!res.headersSent) {
                        res.status(500).json({ error: `Error interno del servidor: ${err.message || err}` });
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
                res.status(500).json({ error: `Error interno en la consulta: ${err.message || err}` });
            }
        });

        connection.execSql(request);

    } catch (error) {
        console.error('Error en la conexión o en la ejecución de la consulta:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: `Error interno del servidor: ${error.message || error}` });
        }
    }
});

//ndpoint TIPO GET que me retorne en formato  json los prefijos y id empresaV

router.get('/PruebaEmpresaV', async (req, res) => {
    try {
        const request = new Request(
            'SELECT [Id EmpresaV], [Prefijo Resolución Facturación EmpresaV] FROM EmpresaV WHERE [Id Estado] = 7;',
            (err) => {
                if (err) {
                    console.error(`Error de consulta: ${err}`);
                    if (!res.headersSent) {
                        res.status(500).json({ error: `Error interno del servidor: ${err.message || err}` });
                    }
                }
            }
        );

        let resultados = [];

        request.on('row', (Columns) => {
            let EmpresaV = {
                IdEmpresaV: Columns[0].value,
                PrefijoResoluciónFacturaciónEmpresaV: Columns[1].value
            };
            resultados.push(EmpresaV);
        });

        request.on('requestCompleted', () => {
            console.log('Resultados de la consulta:');
            console.log(resultados);
            if (!res.headersSent) {
                res.json(resultados);
            }
        });

        request.on('error', (err) => {
            console.error(`Error en la consulta: ${err}`);
            if (!res.headersSent) {
                res.status(500).json({ error: `Error en la ejecución de la consulta: ${err.message || err}` });
            }
        });

        connection.execSql(request);

    } catch (error) {
        console.error(`Error en la conexión o ejecución: ${error}`);
        if (!res.headersSent) {
            res.status(500).json({ error: `Error interno del servidor: ${error.message || error}` });
        }
    }
});


//Debes crear un endpoint TIPO GET que me retorne en formato  json un id factura segun un numero de factura escrito por el cliente y el id empresaV seleccionado previamente


router.get('/prueba/:Nombre/:Cargo', (req, res) => {
    let nom = req.params.Nombre;
    let cargo = req.params.Cargo;

    return res.status(200).send(`Fernando una pregunta de ${nom} el cual tiene un cargo de ${cargo}`);
    // return res.status(200).send("Fernando una pregunta de " + nom + " el cual tiene un cargo de  " + cargo);
    
})

        // ✅ Endpoint para buscar una factura por número y empresa
router.get('/buscarFactura/:NroFactura/:idempresaV', async (req, res) => {
    const NroFactura = Number(req.params.NroFactura);
    const idempresaV = Number(req.params.idempresaV);

        // ✅ Validación de existencia
    if (!NroFactura || !idempresaV) {
        return res.status(400).json({ error: 'Faltan parámetros en la URL' });
    }

        // ✅ Validación de tipo
    if (isNaN(NroFactura) || isNaN(idempresaV)) {
        return res.status(400).json({ error: 'Los parámetros deben ser numéricos' });
    }

    try {
        const request = new Request(
            `SELECT [Id Factura] 
            FROM Factura 
            WHERE [Id EmpresaV] = @idempresaV AND [No Factura] = @NroFactura`,
            (err) => {
                if (err) {
                    console.error(`Error de consulta: ${err}`);
                    if (!res.headersSent) {
                        res.status(500).json({ error: `Error interno del servidor: ${err.message || err}` });
                    }
                }
            }
        );

        // ✅ Parámetros seguros
        request.addParameter('idempresaV', TYPES.Int, idempresaV);
        request.addParameter('NroFactura', TYPES.Int, NroFactura);

        let resultados = [];

        request.on('row', (Columns) => {
            let factura = {
                idFactura: Columns[0].value
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
            console.error(`Error en la consulta: ${err}`);
            if (!res.headersSent) {
                res.status(500).json({ error: `Error al ejecutar la consulta: ${err.message || err}` });
            }
        });

        connection.execSql(request);

    } catch (error) {
        console.error(`Error en la conexión o ejecución: ${error}`);
        if (!res.headersSent) {
            res.status(500).json({ error: `Error interno del servidor: ${error.message || error}` });
        }
    }
});

    module.exports = router;

//crear un endpoint de tipo POST que reciba como parametro el id factura y actualice en la tabla factura donde el id sea igual al parametro EstadoFacturaElectronica = null

router.post('/Actualizar', async (req, res) =>{
    const idFactura = Number(req.params.idFactura);
    const EstadoFacturaElectronica = Number(req.params.EstadoFacturaElectronica);

    //Validacion de existencia 
    if (!idFactura || !EstadoFacturaElectronica) {
        return res.status(400).json({error: 'faltan parametros en la URL'});
        
    }

    //Validacion de tipo
    if (isNaN(idFactura) || isNaN(EstadoFacturaElectronica)) {
        return res.status(400).json({error: 'Los parametros deben de ser numericos'})   
    }

    try {
        const request = new Request(
            `UPDATE Factura SET EstadoFacturaElectronica = NULL 
            WHERE [Id Factura] = @IdFactura`,
            (err) => {
                if (err) {
                    console.error(`Error de consulta ${err}`);
                    if (!res.headersSent) {
                        res.status(500).json({ error: `Error interno del servidor: ${err.message || err}`});
                    }
                }
            }
        );

        request.addParameter('Id Factura', TYPES.Int, idFactura);
        request.addParameter('EstadoFacturaElectronica', TYPES.Int, EstadoFacturaElectronica);

        let resultados = [];

        request.on('row', (Columns) => {
            let factura = {
                idFactura: Columns[0].value,
                EstadoFacturaElectronica: Columns[1].value,
            };
            resultados.push(factura);
        });

        request.on('requestCompleted',()=> {
            console.log('Resultados de la consulta:');
            console.log(resultados);
            if (!res.headersSent) {
                res.json(resultados);
            }
        });

        request.on('error', (err) => {
            console.error(`Error en la consulta: ${err}`);
            if (!res.headersSent) {
                res.status(500).json({eror: `Error al ejecutar la consulta: ${err.message || err}`})
            }
        })


    } catch (error) {
        
    }
})
//prueb


