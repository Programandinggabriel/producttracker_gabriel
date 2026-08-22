# Product Tracker — Backend

API REST del proyecto **Product Tracker**, construida con **Node.js, Express, PostgreSQL y Redis**.

> 🚧 **En desarrollo activo** — actualmente es la parte con más avance del proyecto.

## 📌 Descripción

Este backend expone la API que consume el frontend en React. Actualmente maneja autenticación y CRUD de usuarios.

Está pensado para evolucionar hacia una capa de **providers** que desacople el consumo de APIs externas de la lógica de negocio.

## 🛠️ Tecnologías

* **Node.js / Express** — Servidor y rutas de la API REST
* **PostgreSQL** — Persistencia de datos (integración en progreso)
* **Redis** — Caché y optimización (integración planificada)
* **DummyJSON** — Fuente externa utilizada actualmente durante el desarrollo

## 🚀 Estado actual

### Implementado

* [x] Configuración inicial del servidor
* [x] Rutas básicas
* [x] Autenticación
* [x] CRUD de usuarios
* [x] Integración inicial con API externa (DummyJSON)
* [x] Integración con PostgreSQL
* [x] Integración de Redis (caché)

### En desarrollo / Próximamente

* [ ] Capa de Providers
* [ ] Gestión de productos (CRUD)
* [ ] Validaciones y manejo de errores
* [ ] Tests
* [ ] Despliegue

## 📂 Estructura (referencial)

```
backend/
├── src/
|   ├── config/
|   ├── controllers/
│   ├── cron/
│   ├── errors/
│   ├── jobs/
│   ├── middleware/
│   ├── models/
│   ├── providers/
│   ├── redis/
│   ├── routes/
│   ├── services/
│   └── templates/
├── package.json
└── README.md
```

## ⚙️ Instalación y uso

```bash
cd backend
npm install
npm run dev
```

> Ajusta este bloque con los scripts y variables de entorno reales de tu `package.json` (por ejemplo, puerto, cadena de conexión a PostgreSQL, host de Redis, etc.).

---

**Estado:** 🚧 En desarrollo activo