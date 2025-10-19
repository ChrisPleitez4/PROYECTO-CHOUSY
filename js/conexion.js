const express = require("express");
const mysql = require("mysql");
const app = express();
const path = require("path");
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // para usar JSON
app.use(express.static(path.join(__dirname, "..")));


//CONEXION A BD 
const conexion = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "choussy"
});

//MENSAJE MOSTRAR EN CMD AL CONECTAR
conexion.connect(err => {
    if(err) console.error("Error al conectar:", err);
    else console.log("Conexión exitosa a la BD!");
});
/*####################OPERACIONES PARA EL INDEX #########################################################/*/
// OBTENER ROLES
app.get("/roles", (req, res) => {
    conexion.query("SELECT * FROM rol", (err, resultados) => {
        if(err) return res.status(500).send(err);
        res.json(resultados); // Enviar como JSON
    });
});

// GUARDAR VISITANTE
app.post("/registrar", (req, res) => {
    const { nombre, idRol } = req.body;
    conexion.query("INSERT INTO visitante (nombre, idRol) VALUES (?, ?)", [nombre, idRol], (err, result) => {
        if(err) return res.status(500).send("Error al registrar");
        res.send("<h2>Visitante registrado correctamente</h2><a href='/'>Volver</a>");
    });
});


// OBTENER ESTADISTICAS
app.get("/estadisticas", (req, res) => {
    // CONTAR EL TOTAL DE VISITANTES
    const totalQuery = "SELECT COUNT(*) AS total FROM visitante";
    // CONSULTAR CUANTOS POR ROL 
    const porRolQuery = `
        SELECT r.nombreRol, COUNT(v.idVisitante) AS total 
        FROM visitante v
        JOIN rol r ON v.idRol = r.idRol
        GROUP BY r.nombreRol
    `;

    conexion.query(totalQuery, (err, totalResult) => {
        if (err) return res.status(500).send(err);

        conexion.query(porRolQuery, (err2, porRolResult) => {
            if (err2) return res.status(500).send(err2);

            res.json({
                total: totalResult[0].total,
                porRol: porRolResult
            });
        });
    });
});
/*#################### OPERACIONES PARA crear eventos #########################################################/*/
// POST para agregar evento
app.post("/eventos", (req, res) => {
  const { fecha, descripcion } = req.body; // ya no usas imagen

  if (!fecha || !descripcion) {
    return res.status(400).send("Faltan datos");
  }

  const sql = "INSERT INTO eventos (fecha, descripcion) VALUES (?, ?)";
  conexion.query(sql, [fecha, descripcion], (err, result) => {
    if (err) {
      console.error(" Error al insertar evento:", err);
      return res.status(500).send("Error al guardar el evento");
    }

    console.log(" Evento agregado:", { fecha, descripcion });
    res.sendStatus(200);
  });
});

// GET para obtener eventos
app.get("/eventos", (req, res) => {
  const sql = "SELECT * FROM eventos ORDER BY fecha ASC";
  conexion.query(sql, (err, resultados) => {
    if (err) {
      console.error(" Error al obtener eventos:", err);
      return res.status(500).send("Error al obtener eventos");
    }

    res.json(resultados); // enviar los eventos como JSON
  });
});
/*####################OPERACIONES PARA LOS VOTOS #########################################################/*/
// Guardar calificación
app.post("/calificar", (req, res) => {
  const { numEstrellas } = req.body;
  if (!numEstrellas || numEstrellas < 1 || numEstrellas > 5) {
    return res.status(400).send("Voto inválido");
  }

  const sql = "INSERT INTO votacion (numEstrellas) VALUES (?)";
  conexion.query(sql, [numEstrellas], (err, result) => {
    if (err) {
      console.error("Error al guardar votación:", err);
      return res.status(500).send("Error al guardar votación");
    }
    res.sendStatus(200);
  });
});


app.get("/promedio", (req, res) => {
  const sql = "SELECT AVG(numEstrellas) AS promedio, COUNT(*) AS total FROM votacion";
  conexion.query(sql, (err, result) => {
    if (err) return res.status(500).send("Error al obtener promedio");
    const promedio = result[0].promedio || 0;
    const total = result[0].total || 0;
    res.json({ promedio, total });
  });
});


app.listen(3000, () => console.log("Servidor corriendo en http://localhost:3000"));
