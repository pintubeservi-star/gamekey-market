# ARTEX CLIPPER AI

Aplicación Android + motor de procesamiento de video. Se mantiene dentro de este repositorio como proyecto independiente para no alterar GAMEKEY MARKET.

## Estado
- Portal web de prueba en `/clipper`.
- Backend FastAPI para recibir videos, detectar cambios de escena con FFmpeg y exportar MP4 verticales.
- Flujo de compilación Android Debug APK con GitHub Actions.
- La detección actual es visual/heurística. No promete viralidad ni incluye todavía un modelo semántico de IA, ASR, publicación automática ni analítica Meta.

## Backend
Desplegar `artex-clipper/backend` como servicio Docker en Railway o cualquier host compatible. Configurar `ARTEX_STORAGE` con un volumen persistente y `MAX_UPLOAD_MB`.
La API expone `/health`, `/api/jobs`, `/api/jobs/{id}` y `/outputs/{filename}`.

## Portal
La ruta `/clipper` usa `NEXT_PUBLIC_ARTEX_API_URL` para conectar el backend.

## Android
El proyecto Android está en `artex-clipper/android`. El workflow `.github/workflows/artex-android.yml` compila un APK debug y lo publica como artifact. Para distribución pública se necesita firma de release y proteger la clave fuera del repositorio.

## Uso responsable
Solo procesa material propio o con autorización. Recortar, subtitular o cambiar música no elimina derechos de autor. No se extraen videos privados ni se evaden restricciones de plataformas.
