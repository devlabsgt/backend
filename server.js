const express = require("express");
const routes = require("./routes"); // Importa el router desde routes/index.js
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const cron = require("node-cron");
require("dotenv").config({ path: ".env" });
const fs = require('fs').promises;

const {
  crearConfiguracionCorreoPorDefecto,
} = require("./controllers/mailConfigController");

const {
  crearSuperUsuarioPorDefecto,
} = require("./controllers/usuariosController");

const {
  actualizarEstadoFechaFinal,
} = require("./controllers/proyectoController");

// Conectar a MongoDB
mongoose.Promise = global.Promise;
mongoose
  .connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB conectado");
    // Crear configuración de correo por defecto si no existe
    crearConfiguracionCorreoPorDefecto();
    // Crear superusuario por defecto si no existe
    crearSuperUsuarioPorDefecto();
  })
  .catch((error) => {
    console.error("Error conectando a MongoDB:", error.message);
    process.exit(1); // Salir si hay un error de conexión
  });

// Crear el servidor
const app = express();

// Configurar carpeta pública para archivos estáticos (como imágenes y otros recursos)
app.use("/public", express.static(path.join(__dirname, "public")));

// Habilitar bodyparser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configurar CORS de manera más permisiva para desarrollo
const corsOptions = {
  origin: "*", // Permitir todos los orígenes en desarrollo
  credentials: true, // Permitir cookies y otros encabezados de autenticación
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Rutas de la app
app.use("/", routes); // Usar `routes` directamente

// Configurar tarea programada para verificar proyectos finalizados cada día a las 9:00 AM
cron.schedule(
  "0 9 * * *",
  async () => {
    console.log(
      "Ejecutando tarea programada para actualizar proyectos finalizados"
    );
    await actualizarEstadoFechaFinal();
  },
  {
    timezone: "America/Guatemala",
  }
);

// Configurar puerto y host
const host = process.env.HOST || "0.0.0.0";
const port = process.env.PORT || 5000;
app.listen(port, host, () => {
  console.log(`El servidor está funcionando en http://${host}:${port}`);
});

// Crear directorio de uploads si no existe
const uploadsDir = path.join(__dirname, 'uploads', 'proyectos');
fs.mkdir(uploadsDir, { recursive: true })
  .catch(console.error);

// Servir archivos estáticos
app.use('/uploads', express.static('uploads'));