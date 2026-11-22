// Punto de entrada: carga variables de entorno y arranca el servidor HTTP.
require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`NetScope API corriendo en http://localhost:${PORT}`);
});
