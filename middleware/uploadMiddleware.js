const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');

// Función para generar un nombre de archivo único y seguro
const generateSafeFileName = (originalName) => {
  const timestamp = Date.now();
  const randomHash = crypto.randomBytes(8).toString('hex');
  const extension = path.extname(originalName);
  const safeName = `${timestamp}-${randomHash}${extension}`;
  return safeName;
};

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    try {
      // Si es un nuevo proyecto, usar un directorio temporal
      const projectId = req.params.id || 'temp';
      const uploadDir = path.join(process.cwd(), 'uploads', 'proyectos', projectId);
      
      // Crear directorio recursivamente si no existe
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: function (req, file, cb) {
    const safeFileName = generateSafeFileName(file.originalname);
    cb(null, safeFileName);
  }
});

// Validación de tipo MIME real
const validateMimeType = async (filePath, allowedTypes) => {
  const fileType = await import('file-type');
  const result = await fileType.fileTypeFromFile(filePath);
  
  if (!result) return false;
  return allowedTypes.includes(result.mime);
};

// Filtro de archivos mejorado
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.pdf'];
  
  // Verificar extensión
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowedExtensions.includes(ext)) {
    return cb(new Error('Tipo de archivo no permitido por extensión'));
  }

  // Verificar tipo MIME declarado
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error('Tipo de archivo no permitido por MIME type'));
  }

  cb(null, true);
};

// Configuración de multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 10 // máximo 10 archivos por solicitud
  }
});

// Middleware para validación posterior a la carga
const validateUploadedFiles = async (req, res, next) => {
  if (!req.files || req.files.length === 0) return next();

  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
  const validationPromises = req.files.map(async (file) => {
    const isValid = await validateMimeType(file.path, allowedTypes);
    if (!isValid) {
      // Eliminar el archivo inválido
      await fs.unlink(file.path);
      throw new Error(`Archivo inválido: ${file.originalname}`);
    }
    return true;
  });

  try {
    await Promise.all(validationPromises);
    next();
  } catch (error) {
    next(error);
  }
};

// Middleware para manejar errores de carga
const handleUploadError = (err, req, res, next) => {
  // Limpiar archivos en caso de error
  if (req.files) {
    Promise.all(req.files.map(file => fs.unlink(file.path)))
      .catch(console.error);
  }

  if (err instanceof multer.MulterError) {
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          message: 'El archivo excede el tamaño máximo permitido (5MB)'
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          message: 'Se ha excedido el número máximo de archivos permitidos'
        });
      default:
        return res.status(400).json({
          message: `Error en la carga de archivo: ${err.message}`
        });
    }
  }

  if (err.message.includes('Tipo de archivo no permitido')) {
    return res.status(400).json({
      message: err.message
    });
  }

  next(err);
};

module.exports = {
  upload,
  validateUploadedFiles,
  handleUploadError
};