# EcoWash Admin - Desarrollo de Vistas (Fase 1: UI Estática)

Este repositorio contiene el panel de administración (aplicación de escritorio en Electron) para el sistema EcoWash. 

Actualmente estamos en la **Fase 1: Maquetación y Navegación Estática**. 
**REGLA ESTRICTA:** Queda prohibido implementar lógica de servidor, consumo de APIs (fetch/axios) o JavaScript complejo en esta etapa. Solo se requiere HTML y CSS puro. La lógica de integración con el backend se desarrollará al final, una vez que todas las vistas estén aprobadas.

## 📌 Enlaces de Contexto (Para uso con IA)
Si utilizas ChatGPT, Claude o Gemini para ayudarte a generar el HTML/CSS, **debes proporcionarles los siguientes enlaces** para que la IA entienda el modelo de negocio, los campos de base de datos y la estructura del proyecto cliente:

* **Repositorio Web Cliente (Spring Boot):** `https://github.com/YeahBaby666/ecowash.git`
* **Repositorio Admin Actual (Electron):** `https://github.com/YeahBaby666/ecowash-admin-electron.git`

**Prompt recomendado para la IA:** > *"Revisa el repositorio del cliente en Spring Boot para entender el modelo de datos de EcoWash (pedidos, estados, clientes). Luego, basándote en la estructura del repositorio Admin, genérame el HTML estático y el CSS para la vista de [nombre de la vista], respetando que no haya JavaScript de lógica de servidor. La navegación debe ser únicamente a través de etiquetas `<a href='vista.html'>`."*

## 📂 Qué modificar y qué NO tocar

Solo debes trabajar dentro de la carpeta `src/`. El resto del sistema (Node.js/Electron) está bloqueado para esta fase.

* ✅ **PERMITIDO:** Crear y editar archivos `.html` dentro de `src/` (ej. `pedidos.html`, `inventario.html`).
* ✅ **PERMITIDO:** Crear y editar archivos `.css` dentro de `src/css/`.
* ✅ **PERMITIDO:** Navegación entre vistas usando anclas simples (ej. `<a href="inventario.html">Ir a Inventario</a>`).
* ❌ **PROHIBIDO:** Modificar `main.js`, `package.json` o `preload.js`.
* ❌ **PROHIBIDO:** Añadir scripts `.js` para simular bases de datos, hacer `fetch`, `setInterval` o conectarse a Spring Boot. Todo el contenido (tablas, listas, estados) debe estar escrito directamente en el HTML ("quemado" o "hardcodeado").

## 🛠️ Flujo de Trabajo

1.  Actualiza tu rama principal: `git pull origin main`
2.  Crea una rama específica para la vista asignada: `git checkout -b ui-vista-pedidos`
3.  Desarrolla el HTML y CSS. Asegúrate de que los botones y enlaces lleven a las otras vistas estáticas correspondientes.
4.  Prueba visualmente ejecutando el archivo `.bat` (ver sección de Arranque).
5.  Sube los cambios: `git push origin ui-vista-pedidos` y notifica al equipo para la revisión.

## 📝 Requisitos de las Vistas
* **Interactividad básica:** Los modales o menús desplegables pueden usar CSS puro (ej. `:target`, `:hover` o `checkbox hacks`) o JS mínimo exclusivo para el DOM (ej. `element.classList.toggle('active')`). 
* **Datos de prueba:** Llena las tablas y tarjetas con datos ficticios realistas para evaluar cómo se verá en producción.

---

## 🚀 Archivos de Arranque (Importante al Clonar)
Al clonar este repositorio, la carpeta `node_modules` **NO** se descarga.
* ❌ **NO USAR `run_final.vbs`:** Este archivo es exclusivo para la PC física de la lavandería en producción. Si lo usas tras clonar, fallará de forma invisible y no verás la aplicación.
* ✅ **USAR SIEMPRE `run_debug.bat`:** Haz doble clic en este archivo para trabajar. Este script instalará automáticamente las dependencias si faltan y mantendrá la consola abierta para mostrarte cualquier error en tiempo de ejecución.