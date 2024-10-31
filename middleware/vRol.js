module.exports = (rolesPermitidos) => {
  return (req, res, next) => {
    const { rol } = req.user; // Obtener el rol del usuario autenticado

    if (!rolesPermitidos.includes(rol)) {
      return res.status(403).json({
        mensaje: `No tienes autorización para hacer esto (${rol})`,
        codigo: "ErrorAutorizacion",
        detalles: `Rol ${rol} no tiene acceso a esta funcion.`,
      });
    }

    next();
  };
};
