const { Request, TYPES, Connection} = require('tedious');  //permite conectarse a sql desde js
const Router = require('express').Router;      //servicio web
const connection = require('../bd/bd');        //conexion con la base de datos
const { request } = require('express');
const { lchmod } = require('fs/promises');
const { error } = require('console');
const { types } = require('util');
const { enableCompileCache } = require('module');

const router = Router();                       //agrupacion de las rutas

// ✅ Ruta de prueba simple para verificar si el servidor responde
router.get('/', (req, res) => {
    res.status(200).json({ message: 'Todo está ok' });
});

// ✅ Ruta para obtener una factura de prueba (la primera encontrada)
router.get('/PruebaFactura', async (req, res) => {
    try {
        const request = new Request(
            `SELECT TOP(1) * FROM Factura 
            where   [Id Factura] =  88670 `,
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
                IdFactura: Columns[3].value
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
    if (req.params.NroFactura === undefined || req.params.idempresaV === undefined) {
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
                IdFactura: Columns[0].value
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

router.post('/Actualizar', async (req, res) => {
    const { IdFactura } = req.body;
    const IdFacturaNum = Number(IdFactura);
    console.log(`IdFactura recibido: ${IdFacturaNum}`);

    if (!IdFactura || isNaN(IdFacturaNum)) {
        return res.status(400).json({ error: 'El parámetro IdFactura es obligatorio y debe ser numérico.' });
    }

    //validamos si el ID es null
    try {
        const checkRequest = new Request(
            `SELECT EstadoFacturaElectronica FROM Factura WHERE [Id Factura] = @IdFactura`,
            (err, rowCount) => {
                if (err) {
                    console.error('Error en la consulta SELECT:', err);
                    if (!res.headersSent) {
                        return res.status(500).json({ error: 'Error al verificar la factura.' });
                    }
                }
                if (rowCount === 0 && !res.headersSent) {
                    return res.status(404).json({ mensaje: `No se encontró la factura con el ID ${IdFacturaNum}` });
                }
            }
        );

        checkRequest.addParameter('IdFactura', TYPES.Int, IdFacturaNum);

        let estadoActual = null;

        checkRequest.on('row', columns => {
            estadoActual = columns[0].value;
        });

        checkRequest.on('requestCompleted', () => {
            if (estadoActual === null) {
                if (!res.headersSent) {
                    return res.status(200).json({ mensaje: `La factura ${IdFacturaNum} ya tiene EstadoFacturaElectronica en NULL.` });
                }
                return;
            }

            // Si no era NULL, actualizamos
            const updateRequest = new Request(
                `UPDATE Factura SET EstadoFacturaElectronica = NULL WHERE [Id Factura] = @IdFactura`,
                (err, rowCount) => {
                    if (err) {
                        console.error('Error en la actualización:', err);
                        if (!res.headersSent) {
                            return res.status(500).json({ error: 'Error al actualizar la factura.' });
                        }
                        return;
                    }

                    if (!res.headersSent) {
                        return res.status(200).json({ mensaje: `Factura ${IdFacturaNum} actualizada correctamente.` });
                    }
                }
            );

            updateRequest.addParameter('IdFactura', TYPES.Int, IdFacturaNum);
            connection.execSql(updateRequest);
        });

        connection.execSql(checkRequest);

    } catch (error) {
        console.error('Error en el try-catch:', error);
        if (!res.headersSent) {
            return res.status(500).json({ error: `Error interno: ${error.message}` });
        }
    }
});

