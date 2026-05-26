@echo off
TITLE EcoWash Admin - Consola de Desarrollo
CLS

echo [INFO] Analizando entorno local...
:: REVISIÓN DE ENTORNO TRAS CLONAR
if not exist node_modules (
    echo [ALERTA] No se detecto 'node_modules'.
    echo [ACCION] Instalando dependencias de Electron...
    echo.
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Fallo al ejecutar 'npm install'. Verifica Node.js instalado en el sistema.
        pause
        exit /b %errorlevel%
    )
    echo [OK] Dependencias instaladas.
)

echo [INFO] Levantando entorno de Electron...
echo [INFO] NO CIERRES ESTA VENTANA.
echo.

:: EJECUCIÓN DIRECTA
call .\node_modules\.bin\electron.cmd .

:: CAPTURA DE ERRORES
if %errorlevel% neq 0 (
    echo.
    echo [CRITICO] La aplicacion de Electron ha fallado.
    echo Codigo de error: %errorlevel%
    pause
)