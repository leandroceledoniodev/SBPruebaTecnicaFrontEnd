# SB Solicitudes Internas — Frontend

Aplicación web en React 19 y TypeScript para registrar, consultar y gestionar solicitudes internas de servicios tecnológicos. Consume la API .NET 8 ubicada en `../backend`.

## Requisitos

- Node.js 20 o superior
- npm 10 o superior
- API disponible en `https://localhost:7080`

## Ejecución local

```bash
npm install
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`. Vite redirige las peticiones `/api` hacia el backend local y admite su certificado HTTPS de desarrollo.

Para usar otra dirección de API, crea un archivo `.env` a partir de `.env.example` y establece `API_PROXY_TARGET`. Al no utilizar el prefijo `VITE_`, esta variable permanece en la configuración del servidor de desarrollo y no se incorpora al bundle del navegador.

## Validación

```bash
npm run lint
npm run build
```

## Usuarios de prueba

Todos los usuarios semilla utilizan la contraseña `Password123!`.

| Rol | Correo |
| --- | --- |
| Administrador | `admin@sb.gob.do` |
| Analista | `analista@sb.gob.do` |
| Solicitante | `solicitante@sb.gob.do` |

## Estructura

- `src/components`: componentes visuales reutilizables y layout principal
- `src/context`: sesión y autenticación
- `src/pages`: vistas asociadas a las rutas de la aplicación
- `src/services`: cliente HTTP centralizado y manejo uniforme de errores
- `src/types`: contratos TypeScript alineados con los DTO de la API
- `src/utils`: traducción y formato de datos de presentación

La autorización visual se adapta al rol autenticado, mientras que la API conserva la responsabilidad definitiva de autorizar cada operación.
