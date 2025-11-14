# 🗡️ La Orden Suprema

**Plataforma de gestión de misiones y asesinos de élite**

Una aplicación web moderna para la gestión de contratos, asesinos y misiones con un sistema completo de administración, autenticación y seguimiento en tiempo real.

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Scripts Disponibles](#-scripts-disponibles)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Roles de Usuario](#-roles-de-usuario)
- [Funcionalidades Principales](#-funcionalidades-principales)
- [Contribuir](#-contribuir)

---

## ✨ Características

- 🎨 **Diseño Moderno**: Interfaz minimalista inspirada en Stripe con tema oscuro/claro
- 🔐 **Autenticación Completa**: Sistema de login con 2FA mock
- 👥 **Multi-Rol**: Soporte para Contratistas, Asesinos y Administradores
- 📊 **Panel de Administración**: Gestión completa de usuarios, misiones y estadísticas
- 🗺️ **Mapas Interactivos**: Visualización de ubicaciones con Leaflet
- 🌐 **Multiidioma**: Soporte para Español e Inglés
- 📱 **Responsive**: Diseño adaptable a todos los dispositivos
- ⚡ **Rendimiento Optimizado**: Construido con Vite para desarrollo rápido

---

## 🛠️ Tecnologías

### Core
- **React 19.2** - Biblioteca de UI
- **TypeScript 5.9** - Tipado estático
- **Vite 7.2** - Build tool y dev server

### Routing & State
- **React Router DOM 7.9** - Navegación SPA
- **Context API** - Gestión de estado global

### UI & Styling
- **CSS Modules** - Estilos con scope local
- **Lucide React** - Iconos modernos
- **Leaflet 1.9** - Mapas interactivos

### Development
- **ESLint** - Linting de código
- **TypeScript ESLint** - Reglas específicas para TS

---

## 📦 Requisitos Previos

Asegúrate de tener instalado:

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0 o **bun** >= 1.0.0

---

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd frontend
```

### 2. Instalar dependencias

Con npm:
```bash
npm install
```

Con bun (recomendado para mejor rendimiento):
```bash
bun install
```

### 3. Iniciar el servidor de desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

---

## ⚙️ Configuración

### Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto (opcional):

```env
VITE_API_URL=http://localhost:3000
VITE_MAP_TILE_URL=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
```

### Tema

El tema se puede cambiar dinámicamente. El sistema detecta automáticamente la preferencia del navegador y permite cambio manual.

---

## 📜 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Inicia el servidor de desarrollo

# Producción
npm run build        # Compila TypeScript y construye para producción
npm run preview      # Previsualiza la build de producción

# Calidad de Código
npm run lint         # Ejecuta ESLint
```

---

## 📁 Estructura del Proyecto

```
frontend/
├── public/              # Archivos estáticos
├── src/
│   ├── assets/         # Imágenes, fuentes, etc.
│   ├── components/     # Componentes reutilizables
│   │   ├── Header/
│   │   ├── Hero/
│   │   ├── MissionCard/
│   │   └── ...
│   ├── context/        # Context API providers
│   │   └── LanguageContext.tsx
│   ├── data/           # Datos mock y constantes
│   ├── pages/          # Páginas/vistas principales
│   │   ├── Home/
│   │   ├── login/
│   │   ├── register/
│   │   ├── admin/
│   │   ├── contractor/
│   │   ├── assasin/
│   │   └── ...
│   ├── routes/         # Configuración de rutas
│   ├── services/       # Servicios y lógica de negocio
│   ├── styles/         # Estilos globales y variables CSS
│   │   ├── App.css
│   │   └── variables.css
│   ├── types/          # Definiciones de TypeScript
│   ├── App.tsx         # Componente raíz
│   └── index.tsx       # Punto de entrada
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 👤 Roles de Usuario

### 🎯 Contratista (Contractor)
- Crear y gestionar contratos
- Buscar y contratar asesinos
- Ver historial de misiones
- Realizar pagos

### 🗡️ Asesino (Assassin)
- Ver misiones disponibles
- Aceptar/rechazar contratos
- Actualizar estado de misiones
- Gestionar perfil y especialidades
- Registrar deudas

### 👑 Administrador (Admin)
- Panel de control completo
- Gestión de usuarios (CRUD)
- Supervisión de misiones
- Estadísticas y reportes
- Moderación de contenido

---

## 🎯 Funcionalidades Principales

### Autenticación
- Login con email/contraseña
- Registro de nuevos usuarios
- Sistema 2FA mock
- Recuperación de contraseña (mock)

### Dashboard por Rol
- **Contratista**: Gestión de contratos y búsqueda de asesinos
- **Asesino**: Misiones disponibles y perfil profesional
- **Admin**: Panel de control con estadísticas y gestión

### Gestión de Misiones
- Crear nuevas misiones
- Asignar asesinos
- Seguimiento de estado
- Historial completo
- Mapa de ubicaciones

### Sistema de Pagos (Mock)
- Gestión de transacciones
- Historial de pagos
- Registro de deudas

### Internacionalización
- Cambio de idioma en tiempo real
- Soporte para ES/EN
- Persistencia de preferencia

---

## 🎨 Sistema de Diseño

### Paleta de Colores

**Tema Oscuro (Default)**
- Primary Gold: `#d4af37`
- Background: `#0a0a0a`
- Text: `#ffffff`

**Tema Claro**
- Primary Gold: `#c9a02c`
- Background: `#fafafa`
- Text: `#1a1a1a`

### Componentes
- Botones con estados hover/active
- Cards con glassmorphism
- Modales con backdrop blur
- Animaciones sutiles y fluidas

---

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📝 Notas de Desarrollo

### Datos Mock
Actualmente la aplicación utiliza datos mock almacenados en `src/data/`. Para conectar con un backend real:

1. Implementar servicios en `src/services/`
2. Actualizar las llamadas API
3. Configurar variables de entorno

### Testing
Los archivos de test están configurados pero requieren implementación:
- `src/App.test.js`
- `src/setupTests.js`

---

## 📄 Licencia

Este proyecto es privado y confidencial.

---

## 👥 Equipo

Desarrollado con ⚔️ por el equipo de La Orden Suprema

---

**Actiones Secundum Fidem** 🗡️
