# Bliss Team Tracker

Aplicación web para gestión de tareas diarias del equipo de Bliss Marketing.

## Stack
- **Backend:** Node.js + Express + Prisma + PostgreSQL
- **Frontend:** React + Vite + Tailwind CSS

---

## Desarrollo local

### Requisitos
- Node.js 18+
- PostgreSQL 14+

### 1. Backend

```bash
cd backend
cp .env.example .env
# Editar .env con tu DATABASE_URL y JWT_SECRET
npm install
npm run db:migrate:dev     # crea las tablas
npm run db:seed            # crea admin y proyecto Bliss
npm run dev
```

La API corre en `http://localhost:3001`

**Credenciales por defecto:**
- Email: `admin@blissmkt.ar`
- Password: `admin123`  ← cambiarlo desde el panel de admin

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

La app corre en `http://localhost:5173`

---

## Deploy en producción (team.blissmkt.ar)

### Backend (servidor con Node.js)

```bash
cd backend
cp .env.example .env
# Configurar DATABASE_URL apuntando a tu PostgreSQL de producción
# Configurar JWT_SECRET con un string largo y aleatorio
npm install --production
npm run db:generate
npm run db:migrate       # aplica migraciones
npm run db:seed          # solo la primera vez
```

Usar **PM2** para mantenerlo corriendo:
```bash
npm install -g pm2
pm2 start src/index.js --name team-tracker-api
pm2 save
pm2 startup
```

### Frontend (build estático)

```bash
cd frontend
# Editar vite.config.js: cambiar proxy por URL completa del backend
# O configurar variable de entorno VITE_API_URL=https://team.blissmkt.ar/api
npm run build
# Subir la carpeta dist/ al hosting
```

### Nginx (subdominio team.blissmkt.ar)

```nginx
server {
    listen 80;
    server_name team.blissmkt.ar;

    # Frontend (archivos estáticos)
    root /var/www/team-tracker/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API (proxy inverso)
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

Luego: `certbot --nginx -d team.blissmkt.ar` para HTTPS.

---

## Estructura del proyecto

```
team-tracker/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma     # Modelos: User, Project, WorkDay, Task
│   │   └── seed.js           # Admin inicial + proyecto Bliss
│   └── src/
│       ├── controllers/      # Lógica de negocio
│       ├── middleware/        # Auth JWT
│       ├── routes/           # Endpoints
│       └── index.js
└── frontend/
    └── src/
        ├── pages/
        │   ├── Login.jsx
        │   ├── Dashboard.jsx  # Vista diaria del equipo
        │   └── Admin.jsx      # Panel admin
        ├── components/
        │   ├── TaskCard.jsx   # Tarjeta de tarea con timer
        │   ├── AddTaskModal.jsx
        │   └── admin/         # Tabs: Proyectos, Equipo, Reportes
        ├── context/AuthContext.jsx
        └── api/client.js      # Axios con JWT automático
```

## Roles disponibles
| Valor | Descripción |
|-------|-------------|
| ADMIN | Acceso completo + panel de administración |
| DESIGNER | Diseñador |
| CM | Community Manager |
| ACCOUNT_EXECUTIVE | Ejecutivo de Cuentas |
| ANALYST | Analista |
| WEB_DEVELOPER | Desarrollador Web |

## Flujo de uso diario
1. Usuario ingresa con email y contraseña
2. Se crea automáticamente la jornada del día
3. Agrega tareas asociadas a un proyecto/cliente
4. Hace clic en **Iniciar** cuando arranca una tarea → se registra la hora de inicio
5. Hace clic en **Completar** cuando la termina → se registra la hora de fin y se calcula la duración
6. Al terminar el día, hace clic en **Finalizar jornada**
