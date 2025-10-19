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



app.listen(3000, () => console.log("Servidor corriendo en http://localhost:3000"));
