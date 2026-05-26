Set WshShell = CreateObject("WScript.Shell")
' Ejecuta el comando npm start en modo oculto (0) y sin esperar a que termine (False)
WshShell.Run "cmd.exe /c npm start", 0, False