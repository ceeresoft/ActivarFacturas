const express = require('express');
const { ejecutarConsulta, TYPES } = require('./db');

const app = express();
const PORT = 3001;

app.get('/BuscarFactura/:IdEmpresaV/:NumeroFactura', (req, res) => {
    const { IdEmpresaV, NumeroFactura } = req.params;

    let idFactura = null;

    const query = `
        SELECT FC.[Id Factura] FROM Factura FC
        WHERE FC.[Id EmpresaV] = @IdEmpresaV AND FC.[No Factura] = @NumeroFactura
    `;

    const parametros = [
        { nombre: 'IdEmpresaV', tipo: TYPES.Int, valor: parseInt(IdEmpresaV) },
        { nombre: 'NumeroFactura', tipo: TYPES.VarChar, valor: NumeroFactura }
    ];

    ejecutarConsulta(
        query,
        parametros,
        (columns) => {
            idFactura = columns[0].value;
        },
        () => {
            if (idFactura !== null) {
                res.json({ idFactura });
            } else {
                res.status(404).send('Factura no encontrada');
            }
        },
        (err) => {
            console.error('Error en la consulta:', err.message);
            res.status(500).send('Error interno');
        }
    );
});


app.get("/EmpresavConEstado7", (req, res) => {
  const query = `
        SELECT [Id EmpresaV] , [Resolución Facturación EmpresaV]
        FROM Empresav
        WHERE [Id Estado]= 7;
    `;
  const parametros = [];
  ejecutarConsulta(
    query,
    parametros,
    (columns) => {
     
        EmpresaV = columns[0].value + "|" + columns[1].value;
     
         
    },
    () => {
      if (  EmpresaV !== null) {
        res.json(EmpresaV);
      } else {
        res.status(404).send("No se encontraron registros de EmpresaV");
      }
    },
    (err) => {
      console.error("Error en la consulta:", err);
      res.status(500).send(`Error interno en el programa: ${err.message}`);
    }
  );
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
