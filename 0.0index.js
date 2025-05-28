// Importa el módulo express para crear el servidor
const express = require('express');

// Crea una instancia de una aplicación Express
const app = express();

// Middleware para permitir que el servidor entienda datos en formato JSON en el cuerpo de las solicitudes
app.use(express.json());


// Define un edpoint GET en la ruta /entidades
// Este endpoint puede recibir parámetros por la URL como query string (por ejemplo, ?nombre=roberto)
app.get('/entidades', (req, res) => {
    
    // Extrae los parámetros enviados como query desde la URL
    const { nombre, alias, edad } = req.query;

    // Devuelve una respuesta en formato JSON con los datos recibidos
    res.json({
        mensaje: 'Datos recibidos correctamente',
        nombre,
        alias,
        edad
    });
});


// Define el puerto en el que se va a ejecutar el servidor (puede ser cualquier número disponible)
const PORT = 3500;

// Inicia el servidor y muestra un mensaje en la consola cuando está listo
app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
