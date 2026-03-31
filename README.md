# Presti API - HACKITBA 2026

El presente trabajo, desarrollado en el marco de _HACKITBA 2026_, la hackathon organizada por _Computer Society_ en el _ITBA_, consiste en una API backend orientada a flujos fintech y de decision crediticia.

La plataforma permite que cada empresa cliente configure su propia operacion, definiendo productos financieros, reglas de elegibilidad, consultas sobre postulantes e integraciones con fuentes externas y servicios de IA.

Cuenta principalmente con las siguientes funcionalidades:

- <b>Gestion de Clientes y Autenticacion</b>: Se permite registrar clientes, iniciar sesion mediante JWT y generar API Keys para integraciones de servidor a servidor.

- <b>Gestion de Usuarios</b>: Cada cliente puede administrar sus propios usuarios o postulantes, asociados por CUIL.

- <b>Catalogo de Productos Financieros</b>: Se permite definir productos como prestamos, microprestamos y tarjetas de credito, con sus restricciones y parametros comerciales.

- <b>Politica Crediticia</b>: Cada cliente cuenta con una politica configurable para definir umbrales de situacion BCRA, cantidad de entidades con deuda, deuda total externa e historial limpio requerido.

- <b>Recomendaciones Crediticias</b>: La API genera recomendaciones de productos para un postulante a partir de datos internos, informacion financiera externa y recomendaciones potenciadas con IA.

- <b>Monitoreo de Cartera</b>: Se registran consultas por CUIL y se exponen endpoints para seguir cambios de situacion crediticia dentro de la cartera de cada cliente.

- <b>Suscripciones y Limites de Uso</b>: Se incorporan planes de suscripcion con limites sobre usuarios, productos, API Keys y consultas diarias.

- <b>Integracion con APIs Externas</b>: Se consume informacion del BCRA y se deja preparada la integracion con Veraz para enriquecer evaluaciones crediticias.

- <b>Asistente de IA</b>: Se incluye un chat crediticio con Gemini y endpoints de recomendaciones potenciadas con Groq.

- <b>Documentacion Interactiva</b>: La API expone documentacion Swagger para explorar y probar los endpoints de manera sencilla.

<details>
  <summary>Contenidos</summary>
  <ol>
    <li><a href="#instalacion">Instalacion</a></li>
    <li><a href="#variables-de-entorno">Variables de Entorno</a></li>
    <li><a href="#arquitectura">Arquitectura</a></li>
    <li><a href="#autenticacion-y-suscripciones">Autenticacion y Suscripciones</a></li>
    <li><a href="#endpoints-principales">Endpoints Principales</a></li>
    <li><a href="#flujo-de-recomendacion">Flujo de Recomendacion</a></li>
    <li><a href="#integrantes">Integrantes</a></li>
  </ol>
</details>

## Instalacion

Para instalar y ejecutar el proyecto de forma local, se requiere contar con una base de datos PostgreSQL disponible, ya sea localmente o mediante Supabase.

Se debe clonar el repositorio mediante:

- HTTPS:

```sh
git clone https://github.com/[OWNER]/presti-api.git
```

- SSH:

```sh
git clone git@github.com:[OWNER]/presti-api.git
```

Luego, dentro de la carpeta del proyecto, instalar las dependencias:

```sh
npm install
```

Una vez creada la configuracion de entorno, ejecutar las migraciones:

```sh
npm run migrations:run
```

Finalmente, iniciar el servidor en modo desarrollo:

```sh
npm run start:dev
```

La API quedara disponible en `http://localhost:3000/api/v1` y la documentacion Swagger en `http://localhost:3000/api/docs`.

Tambien es posible poblar el entorno con datos de demostracion mediante:

```sh
npm run seed:demo
```

Y generar un build de produccion mediante:

```sh
npm run build
npm run start:prod
```

Scripts utiles del proyecto:

```sh
npm run start
npm run start:dev
npm run start:debug
npm run build
npm run lint
npm run format
npm run test
npm run test:watch
npm run test:cov
npm run migrations:generate -- MigrationName
npm run migrations:run
npm run migrations:revert
npm run seed:demo
```

<p align="right"><a href="#presti-api---hackitba-2026">Volver</a></p>

## Variables de Entorno

Se debe copiar el archivo de ejemplo y completar los valores necesarios:

```sh
cp .env.example .env
```

Las variables principales son las siguientes:

### Aplicacion

- `NODE_ENV`: `development`, `production` o `test`
- `PORT`: puerto HTTP de la API
- `CORS_ORIGIN`: origenes permitidos para CORS, separados por coma

### Base de Datos

- `DB_HOST`
- `DB_PORT`
- `DB_USERNAME`
- `DB_PASSWORD`
- `DB_DATABASE`

### Autenticacion

- `JWT_SECRET`: secreto para firmar tokens JWT
- `JWT_EXPIRES_IN`: duracion del token, por ejemplo `7d`

### APIs Externas

- `BCRA_BASE_URL`
- `VERAZ_BASE_URL`
- `VERAZ_USERNAME`
- `VERAZ_PASSWORD`
- `VERAZ_API_KEY`

### IA

- `GEMINI_API_KEY`
- `GROQ_API_KEY`

El archivo `.env.example` incluido en el repositorio documenta cada una de estas variables y sus valores esperados.

<p align="right"><a href="#presti-api---hackitba-2026">Volver</a></p>

## Arquitectura

La aplicacion esta organizada por modulos dentro de `src/modules`, siguiendo una estructura clara por dominio:

- `auth`: registro, login, guards JWT y soporte para autenticacion con API Key
- `clientes`: gestion de clientes y API Keys
- `usuarios`: manejo de postulantes o usuarios asociados a cada cliente
- `productos`: definicion de productos financieros
- `motor-reglas`: recomendaciones, consulta historica y generacion asistida por IA
- `suscripciones`: asignacion de planes y control de uso diario
- `politica-crediticia`: umbrales y criterios de aprobacion por cliente
- `cartera`: monitoreo de consultas y cambios de situacion crediticia
- `external-apis`: integraciones con BCRA y Veraz
- `chat`: asistente de IA crediticio

La aplicacion utiliza:

- NestJS como framework principal
- TypeORM para persistencia
- PostgreSQL / Supabase como base de datos
- Swagger / OpenAPI para documentacion
- JWT y API Keys para autenticacion
- Gemini para chat crediticio y Groq para recomendaciones de productos

El prefijo global configurado para la API es `/api/v1`.

<p align="right"><a href="#presti-api---hackitba-2026">Volver</a></p>

## Autenticacion y Suscripciones

La mayor parte de las rutas estan protegidas por un guard global basado en JWT. Las rutas publicas utilizan el decorador `@Public()`.

El flujo habitual de autenticacion es el siguiente:

1. Crear un cliente con `POST /api/v1/auth/signup`
2. Iniciar sesion con `POST /api/v1/auth/login`
3. Utilizar el token JWT devuelto sobre las rutas protegidas
4. Opcionalmente generar API Keys mediante `POST /api/v1/clientes/api-keys`

Al registrarse un cliente nuevo, la plataforma crea ademas una suscripcion inicial `PROFESSIONAL` y una politica crediticia por defecto.

Los endpoints `POST /api/v1/usuarios/refresh-bcra` y `GET|POST|PATCH /api/v1/recomendaciones...` admiten tanto `Authorization: Bearer <token>` como `x-api-key`.

Las rutas `POST /api/v1/auth/signup`, `POST /api/v1/auth/login`, `GET /api/v1/suscripciones` y `POST /api/v1/chat` son publicas.

Ademas, el sistema incluye planes de suscripcion con limites operativos:

- `PROFESSIONAL`: 10 usuarios, 5 productos, 2 API Keys, 100 consultas diarias
- `BUSINESS`: 50 usuarios, 20 productos, 5 API Keys, 500 consultas diarias
- `ENTERPRISE`: 500 usuarios, 200 productos, 20 API Keys, 5000 consultas diarias

Las consultas de recomendaciones consumen cupo diario a traves del modulo de suscripciones.

<p align="right"><a href="#presti-api---hackitba-2026">Volver</a></p>

## Endpoints Principales

La API se organiza principalmente en las siguientes areas funcionales:

### Auth

- `POST /api/v1/auth/signup`
- `POST /api/v1/auth/login`

### Clientes y API Keys

- `GET /api/v1/clientes`
- `GET /api/v1/clientes/:id`
- `POST /api/v1/clientes`
- `PATCH /api/v1/clientes/:id`
- `DELETE /api/v1/clientes/:id`
- `POST /api/v1/clientes/api-keys`
- `GET /api/v1/clientes/api-keys`
- `PATCH /api/v1/clientes/api-keys/:apiKey/desactivar`

### Usuarios

- `GET /api/v1/usuarios`
- `GET /api/v1/usuarios/:cuil`
- `POST /api/v1/usuarios`
- `POST /api/v1/usuarios/refresh-bcra`
- `PATCH /api/v1/usuarios/:cuil`
- `DELETE /api/v1/usuarios/:cuil`

### Productos

- `GET /api/v1/productos`
- `GET /api/v1/productos/:id`
- `POST /api/v1/productos`
- `PATCH /api/v1/productos/:id`
- `DELETE /api/v1/productos/:id`

### Politica Crediticia

- `GET /api/v1/politica-crediticia`
- `PATCH /api/v1/politica-crediticia`

### Recomendaciones

- `GET /api/v1/recomendaciones`
- `GET /api/v1/recomendaciones/:id`
- `POST /api/v1/recomendaciones`
- `PATCH /api/v1/recomendaciones/:id`
- `POST /api/v1/recomendaciones/ia`
- `POST /api/v1/recomendaciones/ia/personalizada`

### Cartera

- `GET /api/v1/portfolio`
- `GET /api/v1/portfolio/tamanio`

### Suscripciones

- `GET /api/v1/suscripciones`
- `POST /api/v1/suscripciones`
- `GET /api/v1/suscripciones/activa`
- `GET /api/v1/suscripciones/uso`

### Chat con IA

- `POST /api/v1/chat`

Para consultar esquemas de request y response, se recomienda utilizar Swagger en `http://localhost:3000/api/docs`.

<p align="right"><a href="#presti-api---hackitba-2026">Volver</a></p>

## Flujo de Recomendacion

Cuando se invoca `POST /api/v1/recomendaciones`, la API actualmente realiza el siguiente proceso:

1. valida la suscripcion activa del cliente y registra el uso diario
2. consulta y persiste informacion publica del BCRA para el CUIL solicitado
3. registra la consulta dentro de la cartera privada del cliente
4. realiza upsert del postulante por CUIL si todavia no existe
5. evalua la politica crediticia configurada para el cliente
6. carga los productos activos del cliente
7. utiliza IA para seleccionar los productos mas adecuados segun el perfil BCRA
8. persiste las recomendaciones generadas para su seguimiento posterior

De esta manera, la recomendacion final surge de combinar datos operativos del cliente, politica crediticia, contexto financiero externo y una capa de recomendacion asistida por IA.

<p align="right"><a href="#presti-api---hackitba-2026">Volver</a></p>

## Integrantes

Equipo desarrollador de Presti API para HACKITBA 2026.

Martín Alejando Barnatán (martin.barnatan.dev@gmail.com)

Juan Pablo Birsa (juanbirsa@gmail.com)

Ignacio Pedemonte Berthoud (ipedemonteb@gmail.com)

Pedro Salinas (psalinas351@gmail.com)

<p align="right"><a href="#presti-api---hackitba-2026">Volver</a></p>
