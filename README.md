# Product Tracker

Aplicación **Full Stack** para la gestión y seguimiento de productos, desarrollada con **Node.js, React, PostgreSQL y Redis**.

> 🚧 **Proyecto en desarrollo activo**

## 📌 Sobre el proyecto

Product Tracker nace como un proyecto práctico para construir una aplicación Full Stack completa, trabajando tanto el backend como el frontend y aplicando buenas prácticas de arquitectura y separación de responsabilidades.

Actualmente el desarrollo se encuentra principalmente en la construcción del **backend**, con autenticación, rutas básicas y CRUD de usuarios ya implementados.

La aplicación comenzó utilizando **DummyJSON** como fuente externa de datos de prueba. Ya se logró además la integración con la **API de eBay**, gracias a una excepción otorgada para este proyecto al no almacenar datos de usuarios de eBay. Posteriormente se completará una capa de providers para desacoplar el consumo de APIs externas de la lógica de negocio.

## 📂 Estructura del proyecto

```
product-tracker/
├── backend/    # API REST (Node.js, Express, PostgreSQL, Redis)
├── frontend/   # Cliente web (React)
└── README.md   # Este archivo
```

Cada carpeta cuenta con su propio README con detalles específicos:

* [`backend/README.md`](./backend/README.md)
* [`frontend/README.md`](./frontend/README.md)

## 🛠️ Tecnologías

* **Node.js / Express** — Backend y API REST
* **React** — Frontend
* **PostgreSQL** — Persistencia de datos
* **Redis** — Integración planificada para caché y optimización
* **DummyJSON** — Fuente externa utilizada actualmente durante el desarrollo
* **eBay API** — Integrada mediante una excepción otorgada al proyecto por no almacenar datos de usuarios de eBay

## 🚀 Estado actual

### Implementado

* [x] Configuración inicial del backend
* [x] Rutas básicas
* [x] Autenticación
* [x] CRUD de usuarios
* [x] Integración inicial con API externa (DummyJSON)
* [x] Integración con la API de eBay (bajo excepción por no almacenar datos de usuario)
* [x] Integración con PostgreSQL
* [x] Integración de Redis

### En desarrollo / Próximamente

* [ ] Capa de Providers
* [ ] Gestión de productos
* [ ] Desarrollo del frontend con React
* [ ] Caché y optimización
* [ ] Validaciones y manejo de errores
* [ ] Tests
* [ ] Despliegue

## 🎯 Objetivo

Convertir progresivamente el proyecto en una aplicación Full Stack más completa y cercana a un entorno real, poniendo en práctica:

* Diseño de APIs REST
* Arquitectura backend
* Autenticación y autorización
* Integración con servicios externos
* PostgreSQL y persistencia de datos
* Redis y estrategias de caché
* Desarrollo con React
* Testing y optimización

---

**Estado:** 🚧 En desarrollo activo