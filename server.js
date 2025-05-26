require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");

const app = express();

// Configuración CORS
app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

app.use(express.json());

// Directorio base donde buscar las transformaciones
const BASE_DIR = "C:\\Users\\NUXWAY\\Documents\\Pentaho Saves";

// Ruta para listar transformaciones disponibles
app.get("/listar-transformaciones", (req, res) => {
  fs.readdir(BASE_DIR, (err, files) => {
    if (err) {
      console.error("Error leyendo directorio:", err);
      return res
        .status(500)
        .json({ error: "Error al leer el directorio de transformaciones" });
    }

    const transformaciones = files
      .filter((file) => file.endsWith(".ktr"))
      .map((file) => ({
        nombre: file,
        ruta: path.join(BASE_DIR, file),
      }));

    res.json(transformaciones);
  });
});

app.post("/ejecutar-etl", (req, res) => {
  const { ktrPath, fechaInicio, fechaFin } = req.body;

  if (!ktrPath) {
    return res.status(400).json({ error: "No se especificó la transformación" });
  }

  const panPath = `"C:\\Users\\NUXWAY\\Desktop\\Proyecto John-Herramientas\\Pentaho\\data-integration\\pan.bat"`;

  // Construimos el comando correctamente
  let command = `${panPath} /file:"${ktrPath}"`;

  if (fechaInicio && isValidDate(fechaInicio)) {
    command += ` "/param:FECHA_INICIO=${fechaInicio}"`;
  }

  if (fechaFin && isValidDate(fechaFin)) {
    command += ` "/param:FECHA_FIN=${fechaFin}"`;
  }

  console.log("Comando completo:", command);

  exec(command, { maxBuffer: 1024 * 1024 * 5 }, (error, stdout, stderr) => {
    if (error) {
      console.error("Error en ejecución:", {
        command: command,
        error: error,
        stdout: stdout,
        stderr: stderr,
      });
      return res.status(500).json({
        error: "Error en la ejecución",
        details: stderr || stdout || error.message,
        command: command,
      });
    }

    const success = stdout.includes("Finished processing") && !stdout.includes("ERROR");

    res.json({
      success,
      output: stdout,
      message: success
        ? "Transformación ejecutada correctamente"
        : "La transformación terminó con posibles errores",
    });
  });
});

// Función para validar fechas en formato YYYY-MM-DD
function isValidDate(dateString) {
  const regEx = /^\d{4}-\d{2}-\d{2}$/;
  if (!regEx.test(dateString)) return false;

  const date = new Date(dateString);
  const timestamp = date.getTime();
  return !isNaN(timestamp);
}

// Iniciar servidor
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor listo en http://localhost:${PORT}`);
});
