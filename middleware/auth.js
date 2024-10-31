const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.get("Authorization");

  if (!authHeader) {
    return res.status(401).json({
      mensaje: "Debe de autenticarse para hacer esto",
      codigo: "TokenNoProporcionado",
    });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      mensaje: "Formato de token inválido",
      codigo: "TokenFormatoInvalido",
    });
  }

  try {
    const revisarToken = jwt.verify(token, process.env.JWT_SECRET);
    req.user = revisarToken; // Almacenar los datos del usuario en la solicitud
    next();
  } catch (error) {
    return res.status(401).json({
      mensaje: "Su sesión es inválida o ha expirado",
      codigo: "TokenInvalido",
      detalles: error.message, // opcional: puedes eliminarlo en producción
    });
  }
};
