# Tokenizado

Proyecto universitario full-stack de autenticación con **tokens de sesión** almacenados en base de datos.

| Capa | Stack |
|------|--------|
| Backend | Node.js · Express · Prisma · **SQLite** · Zod · bcryptjs · helmet · cors |
| Frontend | React 18 · Vite · Tailwind CSS · React Router · lucide-react · axios |
| Tests | `node:test` + supertest |
| API docs | Colección Postman incluida |

---

## ¿Por qué SQLite?

Se eligió **SQLite** (archivo local `prisma/dev.db`) para que el profesor pueda clonar, instalar y ejecutar **sin Docker, sin PostgreSQL y sin servicios externos**. El esquema Prisma es portable: cambiando `provider` a `postgresql` y la `DATABASE_URL` el mismo código funciona con Postgres en producción.

---

## Requisitos

- Node.js **18+** (recomendado 20 LTS)
- npm 9+

---

## Instalación rápida

```bash
# 1. Backend
cd backend
cp .env.example .env          # ya incluido un .env listo
npm install
npx prisma migrate dev --name init
npx prisma db seed
npm run dev                   # http://localhost:4000

# 2. Frontend (otra terminal)
cd frontend
cp .env.example .env
npm install
npm run dev                   # http://localhost:5173
```

### Usuarios demo (seed)

| Email | Contraseña |
|-------|------------|
| `ana@demo.com` | `Password123!` |
| `bruno@demo.com` | `Password123!` |
| `carla@demo.com` | `Password123!` |

---

## Endpoints API

Base URL: `http://localhost:4000/api`

Respuesta unificada en **todos** los endpoints:

```json
{ "success": true|false, "message": "...", "data": { } }
```

| Método | Ruta | Auth | Descripción | Códigos |
|--------|------|------|-------------|---------|
| `GET` | `/health` | — | Estado del servicio | 200 |
| `GET` | `/users` | — | Primeros 10 usuarios (sin password) | 200, 500 |
| `POST` | `/users` | — | Crear usuario (hash bcrypt, email único) | 201, 400, 409, 500 |
| `POST` | `/auth/login` | — | Login → crea Token (7 días) | 200, 400, 401, 500 |
| `PATCH` | `/users/name` | Bearer | Actualizar nombre del usuario autenticado | 200, 400, 401, 404, 500 |

### Ejemplo de login

```bash
curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ana@demo.com","password":"Password123!"}'
```

### Ejemplo de PATCH con Bearer

```bash
curl -s -X PATCH http://localhost:4000/api/users/name \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Ana Actualizada"}'
```

---

## Arquitectura

```
tokenizado/
├── backend/
│   ├── src/
│   │   ├── app.js / server.js
│   │   ├── config/env.js
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── middleware/   # authBearer, validate (Zod), error
│   │   ├── utils/        # response unificado, asyncHandler
│   │   └── validators/
│   ├── prisma/schema.prisma + seed.js
│   └── tests/api.test.js
├── frontend/             # Vite React SPA
├── postman/users-api.postman_collection.json
└── README.md
```

### Flujo de autenticación

1. `POST /auth/login` compara el hash con `bcrypt.compare`.
2. Se genera un token opaco con `crypto.randomBytes(32).toString('hex')`.
3. Se guarda en la tabla `Token` con `expiresAt` = ahora + 7 días.
4. El middleware `authBearer` lee `Authorization: Bearer …`, busca el token, comprueba caducidad y adjunta `req.user` (sin password).

**No se usa JWT** a propósito: el token vive en BD y se puede invalidar borrando la fila (logout / rotación).

---

## Frontend

- Tema SaaS oscuro (slate/indigo, glass cards, gradientes sutiles).
- Páginas: **Login**, **Register** (checklist de fuerza de contraseña), **Dashboard** (stats + tabla con búsqueda/skeleton), **Profile** (PATCH nombre).
- Token en `localStorage`; axios interceptor añade `Authorization`.
- Toasts para éxito/error.

---

## Tests

```bash
cd backend
npm test
```

Cubre: health, list users (sin password), register, duplicado 409, password débil 400, login + token, login fallido 401, PATCH name con/sin Bearer.

---

## Postman

Importa `postman/users-api.postman_collection.json`.

- Variable `baseUrl` = `http://localhost:4000`
- Variable `token` se rellena sola tras ejecutar **Login** (test script).

---

## Cómo defender este proyecto delante del profesor

### P: ¿Por qué SQLite y no PostgreSQL?

**R:** Para maximizar la reproducibilidad en defensa: cero servicios externos. El esquema Prisma es idéntico; migrar a Postgres es cambiar `provider` + `DATABASE_URL`. Justifico la decisión por portabilidad académica, no por limitaciones técnicas.

### P: ¿Por qué tokens en BD en lugar de JWT?

**R:** Un JWT es autocontenido e irrevocable hasta que expire. Aquí el token es opaco (`crypto.randomBytes`), se valida contra la tabla `Token` y se puede invalidar al instante. Es un modelo de sesión clásico, más sencillo de explicar y auditar.

### P: ¿Cómo evitas devolver contraseñas?

**R:** En Prisma uso `select` explícito sin `password` (`USER_SAFE_SELECT`). En login se usa `sanitizeUser` que hace destructuring omitiendo `password`. Los tests comprueban `password === undefined`.

### P: ¿Qué hace el middleware de autenticación?

**R:** Extrae el Bearer, busca el `Token`, comprueba `expiresAt`, carga el `User` y lo adjunta a `req.user`. Si falta, es inválido o caducó → 401.

### P: ¿Cómo validas la entrada?

**R:** Zod en `validators/user.schemas.js` + middleware `validate`. Contraseñas con reglas (longitud, mayúscula, minúscula, número, especial). Errores → 400 con mensaje claro.

### P: ¿Qué capas tiene el backend?

**R:** Routes → Controllers (try/catch + HTTP) → Services (lógica + Prisma) → Middleware (auth, validate, errors). Respuestas unificadas con `{ success, message, data }`.

### P: ¿Cómo demuestras que funciona?

**R:** Seed con 3 usuarios, colección Postman, tests automatizados (`npm test`) y smoke con curl. Frontend conectado al mismo flujo.

### P: ¿Seguridad aplicada?

**R:** `helmet`, CORS restringido al origen del frontend, rate-limit ligero, bcrypt cost 12, tokens de 256 bits, nunca se loguea ni se serializa el password, body limit 100kb.

### P: ¿Qué mejorarías en producción?

**R:** Postgres/managed DB, refresh tokens + rotación, HTTPS, cookies httpOnly, rate-limit más estricto en `/login`, logging estructurado, CI, y posiblemente email verification.

---

## FAQ para el profesor

**¿Necesito Docker?** No.  
**¿Necesito crear una BD a mano?** No: `prisma migrate dev` crea el archivo SQLite.  
**¿Puertos?** Backend `4000`, Frontend `5173`.  
**¿Cómo reseteo datos?** `cd backend && npm run db:reset` (vuelve a migrar y seed).  
**¿Dónde está el `.env`?** `backend/.env` y `frontend/.env` (plantillas en `.env.example`).

---

## Scripts útiles

```bash
# Backend
npm run dev          # watch mode
npm start            # producción
npm test             # tests críticos
npx prisma studio    # UI de la BD

# Frontend
npm run dev
npm run build
npm run preview
```

---

## Licencia

MIT — proyecto académico.
