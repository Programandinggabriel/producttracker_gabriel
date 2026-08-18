const swaggerAutogen = require('swagger-autogen')();

const outputFile = './swagger.json';
const endpointsFiles = [
    './src/app.js',
    './src/routes/category.js',
    './src/routes/product.js',
    './src/routes/user.js'
];

const doc = {
  info: {
    title: 'API Product Tracker',
    description: 'Documentación de la API para la aplicación Product Tracker',
  },
  host: 'localhost:5000',
  schemes: ['http'],
};

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
  console.log('Swagger generado correctamente');
});