# Plan de Mejora UI/UX — TrackIt

> Documento de planificación técnica. Cada sección incluye el estado actual del código, la decisión de diseño y los cambios concretos a realizar.

---

## Prioridad 1 — Edición In-place (mayor impacto en usabilidad)

### Estado actual
`DailySummary.tsx` usa un formulario expandible (`editingTaskId === task.id`) que desplaza todas las tareas hacia abajo y requiere botones Save/Cancel explícitos.

### Objetivo
Edición directa dentro de la fila sin desplazamiento. Auto-save con debounce de 1.5s. Sin botones Save/Cancel.

### Cambios técnicos

#### 1.1 Descripción editable (click-to-edit)
- Reemplazar `<p>{task.description}</p>` por un `<input>` transparente que se activa al hacer clic.
- El input debe tener `border: none`, `background: transparent`, `outline: none` y solo mostrar un subrayado sutil al estar activo (`:focus`).
- Clase CSS nueva en `globals.css`:
  ```css
  .inline-edit {
    @apply bg-transparent border-0 border-b border-transparent focus:border-primary-400
           outline-none w-full font-medium text-gray-900 dark:text-gray-100
           transition-colors duration-200;
  }
  ```

#### 1.2 Horas editables (click-to-edit con TimePicker)
- El span `{formatTime(task.start_time, task.end_time)}` se convierte en un trigger.
- Al hacer clic, aparece el `TimePicker` inline dentro de la fila (sin expandir).
- El `TimePicker` debe ser compacto: reducir el tamaño de los spinners (`w-10 h-8`, texto `text-base`).

#### 1.3 Auto-save con debounce
- Nuevo estado local por tarea: `editValues: { description, startHour, endHour }`.
- `useRef` para el timer de debounce: `debounceRef.current`.
- En cada cambio: `clearTimeout(debounceRef.current); debounceRef.current = setTimeout(save, 1500)`.
- Al desmontar o cambiar de tarea: flush inmediato del debounce pendiente.
- Indicador visual sutil: punto gris parpadeante `●` junto al nombre mientras hay cambios sin guardar → cambia a ✓ verde al guardar.

#### 1.4 Eliminar formulario expandible
- Eliminar el bloque `editingTaskId === task.id ? (<div>formulario</div>) : (<div>vista</div>)`.
- La fila siempre muestra la vista, con los campos directamente editables.
- El estado `editingTaskId` y `editForm` se eliminan del componente.
- El `TimePicker` de horas aparece en un pequeño popover/dropdown anclado a las horas (no inline en la fila para no romper el layout).

#### 1.5 Acciones rápidas on-hover
- Ya existe `group` en la fila y los botones usan `opacity-0 group-hover:opacity-100`.
- Añadir botón **Duplicar** (icono de copia) junto al de borrar.
- Handler `handleDuplicateTask(task)`: llama a `onCreateTask` con los mismos datos pero `start_time` = ahora.

#### Archivos afectados
- `components/DailySummary.tsx` — refactor principal
- `components/TimePicker.tsx` — añadir prop `compact?: boolean`
- `app/globals.css` — clase `.inline-edit`
- `app/page.tsx` — añadir `onDuplicateTask` handler

---

## Prioridad 2 — Weekly Overview rediseñado

### Estado actual
`WeeklyCalendar.tsx` usa una barra horizontal `h-2` con gradiente azul-púrpura. Los días sin tiempo muestran "No time". El día actual tiene borde `border-primary-500` pero sin glow.

### Objetivo
Anillo de progreso SVG circular. Transición azul→verde al llegar a 8h. Glow en el día actual. Sin texto "No time".

### Cambios técnicos

#### 2.1 Progress Ring (SVG circular)
- Nuevo componente `components/ProgressRing.tsx`:
  ```tsx
  // Props: minutes (number), goal = 480
  // Renderiza un SVG con dos círculos: track (gris) + progress (coloreado)
  // stroke-dasharray y stroke-dashoffset calculados del porcentaje
  ```
- Radio: `r=20`, `cx=cy=24`, `strokeWidth=4`, tamaño total `48x48`.
- Color dinámico:
  - `0% → 99%`: `#7C3AED` (púrpura primario)
  - `100%+`: `#10B981` (esmeralda éxito)
- Transición CSS `transition: stroke-dashoffset 0.5s ease-in-out`.
- El tiempo formateado se muestra centrado dentro del anillo (`text-[10px]`).

#### 2.2 Estado "Today" mejorado
- Borde `border-2 border-[#7C3AED]` (ya existe, solo cambiar color a púrpura).
- Glow externo: `box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.2)` → clase Tailwind custom o inline style.
- Badge "Today": ya existe como `absolute -top-2 -right-2`. Cambiar a fondo sólido `#7C3AED` con texto blanco (ya está así, OK).

#### 2.3 Eliminar "No time"
- Días sin tiempo y que NO son hoy: mostrar un `+` tenue (`text-gray-300`) que aparece solo en hover.
- Días futuros (fecha > hoy): mostrar nada (estado vacío limpio).
- Implementación:
  ```tsx
  const isFuture = date > today;
  // Sin tiempo:
  !hasTime && (
    <div className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 text-lg">+</div>
  )
  ```
- Añadir `group` a la tarjeta del día.

#### Archivos afectados
- `components/WeeklyCalendar.tsx` — refactor de tarjetas
- `components/ProgressRing.tsx` — nuevo componente
- `app/globals.css` — variable CSS `--primary: #7C3AED` (cambio de color primario de azul a púrpura)
- `tailwind.config.ts` — actualizar `primary.500` a `#7C3AED`

> ⚠️ **Nota sobre el color primario**: El sistema actual usa azul (`#0ea5e9`) como primario. Cambiar a púrpura `#7C3AED` afecta a TODOS los botones, badges y bordes de la app. Confirmar con el usuario antes de aplicar globalmente o usar una variable separada solo para el Weekly.

---

## Prioridad 3 — Temporizador unificado en cabecera del Daily Summary

### Estado actual
`TaskTimer` es un widget flotante `fixed top-4 right-4` independiente del `DailySummary`. La desconexión visual es real: el usuario ve el timer arriba a la derecha y las tareas abajo a la izquierda.

### Objetivo
Barra fija en la parte superior del `DailySummary`. Favicon con punto rojo. Título dinámico.

### Cambios técnicos

#### 3.1 Persistent Timer Bar
- Mover `TaskTimer` de `app/page.tsx` (donde está como `fixed`) a la cabecera de `DailySummary`.
- Nueva estructura en `DailySummary`:
  ```
  ┌─────────────────────────────────────────────┐
  │ [●] 00:12:45  "Reunión de equipo"    [Stop] │  ← Timer bar (solo visible si hay tarea activa)
  │─────────────────────────────────────────────│
  │ Daily Summary              Total This Week  │
  │ ...                                         │
  ```
- Cuando no hay tarea activa: mostrar un input `"¿Qué estás haciendo?"` + botón Start en la misma barra.
- La barra tiene `position: sticky; top: 0; z-index: 10` para que permanezca visible al hacer scroll.
- Estilo: fondo `bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200`.

#### 3.2 Props necesarias
- `DailySummary` necesita recibir `activeTask`, `onStartTask`, `onStopTask` desde `page.tsx`.
- O alternativamente, `TaskTimer` se convierte en un componente que se renderiza dentro de `DailySummary` (más limpio).

#### 3.3 Favicon dinámico (punto rojo)
- En `TaskTimer` (o en el nuevo timer integrado), usar `useEffect` para modificar el favicon:
  ```ts
  useEffect(() => {
    const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (activeTask) {
      // Generar favicon con punto rojo via canvas
      const canvas = document.createElement('canvas');
      canvas.width = 32; canvas.height = 32;
      const ctx = canvas.getContext('2d')!;
      // Dibujar favicon base + círculo rojo
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(26, 6, 6, 0, Math.PI * 2);
      ctx.fill();
      link.href = canvas.toDataURL();
    } else {
      link.href = '/favicon.ico'; // restaurar
    }
  }, [activeTask]);
  ```

#### 3.4 Título dinámico
- En el mismo `useEffect`:
  ```ts
  document.title = activeTask
    ? `(${formatDuration(elapsedTime)}) TrackIt`
    : 'TrackIt - Simple Time Tracking';
  ```

#### Archivos afectados
- `components/TaskTimer.tsx` — añadir favicon + título dinámico
- `components/DailySummary.tsx` — integrar timer bar en cabecera
- `app/page.tsx` — ajustar props y posicionamiento
- `app/layout.tsx` — asegurar que el favicon base está en `<head>`

---

## Design System — Cambios globales

### Paleta de colores
| Token | Actual | Nuevo |
|-------|--------|-------|
| `--primary` | `#0ea5e9` (azul) | `#7C3AED` (púrpura) |
| `--success` | `#10b981` | `#10b981` (sin cambio) |
| `--background` | `#ffffff` | `#F9FAFB` (gris muy claro) |

**Impacto**: Cambiar `primary` en `tailwind.config.ts` → `primary.500: '#7C3AED'`. Regenerar todos los colores de la escala automáticamente.

### Tipografía
- Añadir Google Fonts `Inter` en `app/layout.tsx`:
  ```tsx
  import { Inter } from 'next/font/google';
  const inter = Inter({ subsets: ['latin'] });
  ```
- Aplicar `inter.className` al `<body>`.
- Actualizar `globals.css` para eliminar el stack de fuentes del sistema.

### Cards
- Actualizar clase `.card` en `globals.css`:
  ```css
  .card {
    @apply bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200
           dark:border-gray-700 p-6;
    /* border-radius: 12px ya está con rounded-xl */
    /* box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1) = shadow-md */
  }
  ```
  Ya está prácticamente alineado. Solo ajustar `shadow-lg` → `shadow-md`.

### Micro-interacciones
- Verificar que todas las transiciones usan `duration-200 ease-in-out` (ya está en `.btn`).
- Añadir a `.card`: `transition-shadow duration-200`.

---

## Orden de implementación recomendado

```
Sprint 1 (Prioridad 1 — In-place editing)
├── 1.1 Clase .inline-edit en globals.css
├── 1.2 Refactor DailySummary: eliminar formulario expandible
├── 1.3 Descripción editable con auto-save debounce
├── 1.4 TimePicker compacto para horas inline
└── 1.5 Botón Duplicar en acciones hover

Sprint 2 (Prioridad 2 — Weekly Overview)
├── 2.1 Componente ProgressRing.tsx
├── 2.2 Integrar ProgressRing en WeeklyCalendar
├── 2.3 Eliminar "No time", añadir hover "+"
├── 2.4 Glow en día actual
└── 2.5 Cambio de color primario (confirmar con usuario)

Sprint 3 (Prioridad 3 — Timer unificado)
├── 3.1 Favicon dinámico + título en TaskTimer
├── 3.2 Diseñar Timer Bar en DailySummary
├── 3.3 Pasar props activeTask/onStart/onStop
└── 3.4 Sticky positioning y estilos

Sprint 4 (Design System global)
├── 4.1 Fuente Inter via next/font
├── 4.2 Actualizar paleta en tailwind.config.ts
└── 4.3 Ajustar .card y micro-interacciones
```

---

## Riesgos y decisiones pendientes

| # | Riesgo | Decisión necesaria |
|---|--------|--------------------|
| 1 | Cambio de color primario azul→púrpura afecta toda la UI | ¿Aplicar globalmente o solo en Weekly? |
| 2 | Auto-save puede generar muchas llamadas a la API si el usuario escribe rápido | Debounce de 1.5s es suficiente; añadir cancelación en unmount |
| 3 | El TimePicker inline puede romper el layout de filas compactas | Usar popover flotante en vez de inline |
| 4 | Mover el timer al DailySummary cambia la arquitectura de props en page.tsx | Evaluar si conviene un Context o mantener prop drilling |
| 5 | El favicon canvas puede no funcionar si el favicon base no es accesible | Asegurar `/favicon.ico` en `/public` |
