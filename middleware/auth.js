const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.get("Authorization");

  if (!authHeader) {
    return res.status(401).json({ mensaje: "No hay Token" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ mensaje: "no hay Token" });
  }

  try {
    const revisarToken = jwt.verify(token, process.env.JWT_SECRET);
    req.user = revisarToken; // Almacenar los datos del usuario en la solicitud
    next();
  } catch (error) {
    return res.status(500).json({ mensaje: "Token inválido" });
  }
};
