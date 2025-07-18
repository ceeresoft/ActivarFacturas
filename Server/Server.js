const express = require('express'); 
const compression = require('compression');
const cors = require('cors');


const Facturas = require('./Routes/FacturasRoutes');

const app = express();


app.use(compression());

app.use(cors());

app.use(express.json({limit: '1000mb'}));

//Evita que Express crashee si no puede parsear JSON
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        console.error(`Error de JSON mal formado:${err.message}`);
        return res.status(400).json({error:'El cuerpo de la solicitud no es un JSON valido'});
    }
    next();
});

app.use(express.urlencoded({ limit: '1000mb', extended: true}));

app.set('view engine', 'ejs');

let connections = [];

app.get('/api/executeQuery', (req, res) => {
    executeQuery();
    res.send('Funciono el envio');
}); 

// Endpoint para establecer la conexión SSE
app.get('/api/sse', (req, res) => {
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
    });

    // Mantener la conexión abierta
    res.write('\n');

    // Limpiar la lista de conexiones al iniciar una nueva conexión SSE
    connections.length = 0;

    // Almacenar la respuesta del cliente para futuras actualizaciones
    connections.push(res);

    // Manejar la desconexión del cliente
    req.on('close', () => {
        const index = connections.indexOf(res);
        if (index !== -1) {
            connections.splice(index, 1);
        }
    });
});


// Usamos el prefijo '/api' para separar claramente las rutas del backend (API REST) 
// de posibles rutas de frontend (páginas web, vistas, etc.). 
// Esto mejora la organización, facilita el mantenimiento y sigue buenas prácticas 
// comunes en aplicaciones profesionales y escalables.

app.use('/api/facturas', Facturas);


const port = process.env.PORT || 3500;

app.listen(port, () => {
    console.log(`Servidor Corriendo por http://localhost:${port}`);
});

