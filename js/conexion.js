//  SERVIDOR DEL COLEGIO CHOUSSY
//Dependencias de node js
const express = require("express");
const mysql = require("mysql");
const path = require("path");
const app = express();

// Para utilizar el formato JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Carpeta publica para servir paginas archivos etc.
app.use(express.static(path.join(__dirname, "..")));

// ------------- CONECTANDONOS A LA BASE DE DATOS CHOUSSY ------------
const conexion = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "choussy"
});

conexion.connect((err) => {
  if (err) {
    console.error("Error al conectar a la base de datos:", err);
  } else {
    console.log("Conexión exitosa a la base de datos!");
  }
});

//RUTAS PARA ACCEDER A LA BASE DE DATOS E INSERTAR ELEMENTOS,CONSULTAR ETC.
// ---------- 1️ Obtener roles ----------
app.get("/roles", (req, res) => {
  const sql = "SELECT * FROM rol";
  conexion.query(sql, (err, resultado) => {
    if (err) return res.status(500).send("Error al obtener roles");
    res.json(resultado); // el front espera JSON
  });
});

// ---------- 2️ Registrar visitante ----------
app.post("/registrar", (req, res) => {
  const { nombre, idRol } = req.body;

  if (!nombre || !idRol) {
    return res.status(400).send("Datos incompletos");
  }

  const sql = "INSERT INTO visitante (nombre, idRol) VALUES (?, ?)";
  conexion.query(sql, [nombre, idRol], (err, result) => {
    if (err) {
      console.error("Error al registrar visitante:", err);
      return res.status(500).send("Error al registrar visitante");
    }
    res.send("Visitante registrado correctamente");
  });
});

// ---------- 3️ Obtener estadísticas ----------
app.get("/estadisticas", (req, res) => {
  const totalQuery = "SELECT COUNT(*) AS total FROM visitante";
  const porRolQuery = `
    SELECT r.nombreRol, COUNT(v.idVisitante) AS total
    FROM visitante v
    JOIN rol r ON v.idRol = r.idRol
    GROUP BY r.nombreRol
  `;

  conexion.query(totalQuery, (err, totalRes) => {
    if (err) return res.status(500).send(err);

    conexion.query(porRolQuery, (err2, porRolRes) => {
      if (err2) return res.status(500).send(err2);

      res.json({
        total: totalRes[0].total,
        porRol: porRolRes
      });
    });
  });
});

// ---------- 4️ Guardar evento ----------
app.post("/eventos", (req, res) => {
  const { fecha, descripcion } = req.body;

  if (!fecha || !descripcion) {
    return res.status(400).send("Datos incompletos para el evento");
  }

  const sql = "INSERT INTO eventos (fecha, descripcion) VALUES (?, ?)";
  conexion.query(sql, [fecha, descripcion], (err, result) => {
    if (err) {
      console.error("Error al guardar evento:", err);
      return res.status(500).send("Error al guardar el evento");
    }
    res.send("Evento agregado correctamente");
  });
});

// ---------- 5️ Obtener lista de eventos ----------
app.get("/eventos", (req, res) => {
  const sql = "SELECT * FROM eventos ORDER BY fecha ASC";
  conexion.query(sql, (err, resultado) => {
    if (err) {
      console.error("Error al obtener eventos:", err);
      return res.status(500).send("Error al obtener eventos");
    }
    res.json(resultado);
  });
});

// ---------- 6️ Guardar calificación ----------
app.post("/calificar", (req, res) => {
  const { numEstrellas } = req.body;
  if (!numEstrellas || numEstrellas < 1 || numEstrellas > 5) {
    return res.status(400).send("Voto inválido");
  }

  const sql = "INSERT INTO votacion (numEstrellas) VALUES (?)";
  conexion.query(sql, [numEstrellas], (err) => {
    if (err) {
      console.error("Error al guardar votación:", err);
      return res.status(500).send("Error al guardar votación");
    }
    res.send("Voto guardado correctamente");
  });
});

// ---------- 7️ Obtener promedio de calificaciones ----------
app.get("/promedio", (req, res) => {
  const sql = "SELECT AVG(numEstrellas) AS promedio, COUNT(*) AS total FROM votacion";
  conexion.query(sql, (err, resultado) => {
    if (err) return res.status(500).send("Error al obtener promedio");
    const promedio = resultado[0].promedio || 0;
    const total = resultado[0].total || 0;
    res.json({ promedio, total });
  });
});


//---------------------- 8 Encender el servidotr----------------------

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor del colegio encendido en http://localhost:${PORT}`);
});
