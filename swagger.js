const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Library API",
      version: "1.0.0",
      description: "API for managing a library of books",
    },
    servers: [
      {
        url: "/api",
      },
    ],
  },
  apis: ["../routes/*.js"],
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);

module.exports = {
  swaggerUi,
  swaggerDocs,
};
