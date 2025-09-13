# Stage 1: Builder (instala dependencias y construye el app si es necesario)
FROM node:22 AS builder

WORKDIR /app

# Copia solo los archivos de dependencias para caching
COPY package*.json ./

# Instala dependencias (usa ci para installs determinísticos y reproducibles)
RUN npm ci

# Copia el resto del código (excluyendo node_modules gracias a .dockerignore)
COPY . .

# Ejecuta el build de NestJS (genera /dist, aunque en dev no se usa directamente)
RUN npm run build

# Stage 2: Runtime (más liviano, usa slim para reducir tamaño)
FROM node:22-slim

WORKDIR /app

# Copia dependencias instaladas del builder (solo production deps si usas --only=production, pero como es dev, copiamos todo)
COPY --from=builder /app/node_modules ./node_modules

# Copia el código fuente y el build (en dev, volumes sobrescribirán el código fuente)
COPY --from=builder /app/dist ./dist
COPY . .

# Expone el puerto (opcional, pero buena práctica)
EXPOSE 3000

# CMD para modo dev (mantiene tu lógica actual con Nest watch mode)
CMD ["npm", "run", "start:dev"]