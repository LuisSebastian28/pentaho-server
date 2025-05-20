require("dotenv").config();
const express = require("express");
const cors = require("cors");

const { exec } = require("child_process");
const app = express();

// Configuración
// Habilita CORS para tu frontend (ajusta la URL si es necesario)
app.use(
  cors({
    origin: "http://localhost:3000", // Puerto default de React
  })
);

app.use(express.json());

// Ruta para ejecutar ETL
app.post("/ejecutar-etl", (req, res) => {
  const panPath = "S:\\Trabajos\\nuxway\\data-integration\\pan.bat"; // ← Ajusta esta ruta!
  const ktrPath = "S:\\Trabajos\\nuxway\\pentaho_reports\\Transformation 1.ktr"; // ← Ajusta esta ruta!

  const command = `"${panPath}" -file="${ktrPath}"`;

  console.log("Ejecutando:", command);

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error("❌ Error:", stderr);
      return res.status(500).json({ error: stderr });
    }
    console.log("✅ Éxito:", stdout);
    res.json({ success: true, output: stdout });
  });
});

// Iniciar servidor
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor listo en http://localhost:${PORT}`);
});
