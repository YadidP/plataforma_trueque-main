# Plataforma de Trueque - Créditos Verdes

Este es un monorepo para la aplicación full-stack "Créditos Verdes", un marketplace de trueque digital.

## Arquitectura

- **Monorepo:** Contiene el frontend, backend y scripts de base deatos.
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS.
- **Backend:** NestJS, TypeScript, TypeORM.
- **Base de Datos:** PostgreSQL 16.
- **Orquestación:** Docker Compose.

---

## 🚀 Cómo Empezar

Sigue estos pasos para levantar todo el entorno de desarrollo.

### Prerrequisitos

- Docker y Docker Compose instalados.

### 1. Configurar Variables de Entorno

Hay dos archivos de ejemplo `.env.example`, uno en la raíz (`/`) y otro en `/backend`. Cópialos para crear tus archivos `.env` locales.

```bash
# Desde la raíz del proyecto
cp .env.example .env
cp backend/.env.example backend/.env
```

No es necesario modificar los valores por defecto para el entorno de desarrollo local.

### 2. Construir y Levantar los Contenedores

Este comando construirá las imágenes de Docker para el frontend y el backend, iniciará los contenedores y aplicará los scripts de la base de datos (esquema, funciones, triggers y seeds).

```bash
docker compose up -d --build
```

El proceso puede tardar unos minutos la primera vez. Los `healthchecks` se aseguran de que el backend espere a que la base de datos esté lista antes de iniciar.

### 3. Acceder a la Aplicación

Una vez que los contenedores estén en ejecución, podrás acceder a los siguientes servicios:

- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:3000](http://localhost:3000)
- **Documentación Swagger API:** [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

---

## 👥 Usuarios de Prueba

La base de datos se inicia con los siguientes usuarios. La contraseña para todos es `123456`.

- **Usuario común:** `ana@email.com`
- **Usuario común:** `pedro@email.com`
- **Emprendedor:** `maria@email.com`
- **Administrador:** `admin@email.com`

---

## 🧪 Flujo de Demostración Sugerido

1.  **Registro y Bienvenida:**
    - Ve a [http://localhost:5173/register](http://localhost:5173/register) y crea un nuevo usuario.
    - Al registrarte, serás redirigido al Dashboard. Verás una notificación de bienvenida y tu saldo inicial será de **10 créditos** (gracias al trigger `trg_welcome_credits`).

2.  **Publicar y Ganar Incentivo:**
    - Desde el Dashboard, haz clic en "Crear Nueva Publicación".
    - Completa el formulario y publica un artículo.
    - Serás redirigido de nuevo al Dashboard. Verás una notificación y tu saldo habrá aumentado a **15 créditos** (10 de bienvenida + 5 de incentivo por el trigger `trg_listing_incentive`).

3.  **Comprar Créditos:**
    - Ve a la sección "Mi Billetera" desde el menú de navegación.
    - Elige un paquete de créditos y haz clic en "Comprar".
    - Tu saldo se actualizará instantáneamente (gracias al procedimiento `sp_comprar_creditos`).

4.  **Realizar un Intercambio:**
    - Inicia sesión con otro usuario (ej. `pedro@email.com`, pass: `123456`).
    - Ve a "Explorar" y busca el artículo que publicaste en el paso 2.
    - Haz clic en "Intercambiar ahora" y confirma la transacción.
    - El trigger `trg_atomic_exchange` se encargará de:
        - Validar el saldo.
        - Debitar los créditos del comprador (Pedro).
        - Acreditar los créditos al vendedor (tu usuario).
        - Marcar la publicación como "intercambiada".
        - Registrar el impacto (CO2, ítems reutilizados).
        - Generar logs de auditoría.

5.  **Verificar Resultados:**
    - Revisa la billetera de ambos usuarios para ver los saldos actualizados.
    - Ve a la sección "Mis Intercambios" para ver el historial.
    - Como administrador (`admin@email.com`), puedes explorar el panel de administración para ver métricas y auditorías.

---

## Scripts Útiles de Docker

- **Detener contenedores:** `docker compose down`
- **Ver logs:** `docker compose logs -f [nombre_del_servicio]` (ej. `backend`, `frontend`, `db`)
- **Reiniciar un servicio:** `docker compose restart [nombre_del_servicio]`
