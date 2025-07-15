const { Request, TYPES} = require('tedious');  //permite conectarse a sql desde js
const Router = require('express').Router;      //servicio web
const connection = require('../bd/bd');        //conexion con la base de datos
const { request } = require('express');
const { lchmod } = require('fs/promises');
const { error } = require('console');

const router = Router();                       //agrupacion de las rutas


router.get('/', (req, res) => {
    res.status(200).send('Todo esta ok');      //ruta de prueba para ver si funcinan
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
//ndpoint TIPO GET que me retorne en formato  json los prefijos y id empresaV

router.get('/PruebaEmpresaV', async (req,res) =>{
    try{
        const request = new Request('select [Id EmpresaV],[Prefijo Resolución Facturación EmpresaV]   from EmpresaV where [Id Estado]=7;', (err) => {
            if(err){
                console.error(`Error de consulta ${err}`);
                    if(!res.headersSent){
                        res.status(500).send(`Error interno del servidor ${err}`)
                    }
                }
            }          
        );

        let resultados = [];

        request.on('row',(Columns) => {
            let EmpresaV ={ 
                IdEmpresaV: Columns[0].value,
                PrefijoResoluciónFacturaciónEmpresaV: Columns[1].value
            };
            resultados.push(EmpresaV);
        });

        request.on('requestCompleted',() => {
            console.log('Resultados de la consulta:');
            console.log(resultados);
            if (!res.headersSent){
                res.json(resultados)
            }
        });

        request.on('error',(err) =>{
            console.error(`Error en la consulta ${err}`);
            if (!res.headersSent) {
                res.status(500).send('Error en el servidor');
            }
        });

        connection.execSql(request)

    }catch (error){
        console.error(`Error en la conexion o en la ejecucion de la consulta${error}`);
        if (!res.headersSent) {
            res.status(500).send('error interno del servidor')
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

router.get('/buscarFactura/:NroFactura/:idempresaV',async (req, res) => {
const NroFactura =  req.params.NroFactura ;
const idempresaV = req.params.idempresaV;


    try{
        const request = new Request(
            `Select [Id Factura] From Factura WHERE [Id EmpresaV] = ${idempresaV} and  [No Factura] = ${NroFactura}`, (err) => {
                if (err){
                    console.error(`Error de consulta ${err}`);
                    if (!res.headersSent) {
                        res.status(500).send(`Error inerno del servidor ${err}`);
                    }
                }
            }
        );

        let resultados =[];

        request.on('row', (Columns) => {
            let factura = {
                idFactura: Columns[0].value
                

            };                       
        resultados.push(factura);
        });

        request.on('requestCompleted',() => {
            console.log('Resultados de la consulta:');
            console.log(resultados);
            if(!res.headersSent){
                res.json(resultados)
            }
        } ) 


        request.on('error',(err) => {
            console.error(`Error en la contulsta ${err}`);
            if (!res.headersSent) {
                res.status(500).send(`Error en la conexion o en la ejecucion de la consulta ${error}`);
            }
        })

        connection.execSql(request)

    }catch (error){
        console.error(`Error en la conexion o en la ejecucion de la consulta ${error}`);
        if (!res.headersSent){
            res.status(500).send('Error interno del servidor')
        }
    }

});


    module.exports = router;

//crear un endpoint de tipo POST que reciba como parametro el id factura y actualice en la tabla factura donde el id sea igual al parametro EstadoFacturaElectronica = null

