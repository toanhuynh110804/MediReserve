const swaggerUi = require('swagger-ui-express');
const openapiDocument = require('../docs/openapi.spec');

function mountSwagger(app) {
  app.get('/openapi.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.json(openapiDocument);
  });

  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(openapiDocument, {
      customSiteTitle: 'MediReserve API',
      explorer: true,
    })
  );
}

module.exports = { mountSwagger };
