
# Simulador de Decisiones IDIGER — v0.1 (PR #1)

Este repositorio contiene el **esqueleto funcional** del simulador (escenario: **Inundación urbana**), listo para desplegarse en **Azure Static Web Apps** con backend **Azure Functions** opcional y reglas en **JSON**.

## Estructura
```
/frontend  # React + Vite + Tailwind + MapLibre + Zustand
/api       # Azure Functions (JS) — endpoint de prueba /status
/rules     # Reglas editables del escenario
```

## Requisitos
- Node.js >= 18
- Cuenta de GitHub
- Suscripción de Azure (Free tier funciona)

## Pasos rápidos
1. **Instalar dependencias** del frontend:
   ```bash
   cd frontend
   npm i
   ```
2. **Correr en local** (solo UI):
   ```bash
   npm run dev
   ```
   Abre http://localhost:5173
3. **Deploy** (recomendado): crea el recurso **Azure Static Web Apps**, vincúlalo a tu repo (`app_location: frontend`, `api_location: api`, `output_location: dist`). Azure generará un **workflow** de GitHub Actions automáticamente y publicará la app.

> Si deseas usar el workflow incluido en este PR, configura el secreto `AZURE_STATIC_WEB_APPS_API_TOKEN` en el repositorio. Alternativamente, deja que Azure cree el suyo.

## Scripts útiles
```bash
# desde /frontend
npm run dev      # entorno local
npm run build    # build de producción a /frontend/dist
npm run preview  # sirve el build localmente
```

## Notas de arquitectura
- **Mapa**: MapLibre con estilo público de demo.
- **Consola IA**: mensajería basada en reglas y eventos de simulación cada 10s.
- **Panel de Decisiones**: EDRE, PMU, Alertas SAB — coherente con el rol coordinador del IDIGER.
- **Reglas**: movibles a `/rules/escenario_inundacion.json` para fácil ajuste.
- **Backend**: `/api/status` prueba la ruta Functions; luego se agregan conectores SIRE/SAB.

## Próximos pasos (v0.1)
- AAR (resumen de decisiones y KPIs)
- Persistencia de sesiones (localStorage)
- Mejoras visuales (tema institucional)
- Inyectores de incidentes por UPZ/canales

---

### Cómo crear el PR
1. Crea el repo `simulador-idiger` en tu GitHub.
2. Crea una rama: `feature/v0.1-skeleton`.
3. Copia estos archivos y haz commit:
   ```bash
   git add .
   git commit -m "feat: v0.1 skeleton (React+MapLibre+Consola IA+Rules+Functions)"
   git push -u origin feature/v0.1-skeleton
   ```
4. Abre un **Pull Request** de `feature/v0.1-skeleton` → `main`.
5. Si ya creaste **Azure Static Web Apps** conectado a `main`, al hacer **merge** quedará publicado automáticamente.

