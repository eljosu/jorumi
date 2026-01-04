# JORUMI - 3D Assets Package
## 📦 Sistema Completo de Assets 3D para Juego Web

> **Estado:** ✅ Infraestructura completa  
> **Assets:** ⏳ Pendientes de generación  
> **Versión:** 1.0 - Enero 2026

---

## 🎯 ¿Qué es esto?

Este es un **sistema completo y profesional** para gestionar assets 3D del juego JORUMI, incluyendo:

✅ **Especificaciones técnicas detalladas** (formato JSON)  
✅ **Prompts optimizados para IA generativa** (Meshy, Rodin, Luma)  
✅ **Código de integración Three.js/React** (componentes listos)  
✅ **Documentación completa** (guías, ejemplos, troubleshooting)  
✅ **Sistema de carga y caché** (AssetLoader con preloading)  
✅ **Inventario completo** (17 assets base + 19 variantes)

---

## 📂 Estructura del Proyecto

```
client/assets/3d/
│
├── 📘 README.md                          ← Guía técnica principal
├── 📘 QUICKSTART.md                      ← Empieza aquí (guía rápida)
├── 📘 INTEGRATION_GUIDE.md               ← Guía completa Three.js
├── 📘 ASSET_INVENTORY.md                 ← Lista completa de assets
├── 📘 INDEX.md                           ← Este archivo
│
├── 📁 specs/                             ← Especificaciones técnicas (JSON)
│   ├── characters_spec.json              ← 5 personajes + variantes
│   ├── resources_spec.json               ← 4 recursos + variantes
│   ├── vehicles_spec.json                ← 3 vehículos + LODs
│   └── dice_spec.json                    ← 5 dados con símbolos
│
├── 📁 prompts/                           ← Prompts para generación IA
│   ├── CHARACTER_PROMPTS.md              ← Prompts detallados personajes
│   └── RESOURCES_VEHICLES_DICE_PROMPTS.md ← Resto de assets
│
├── 📁 examples/                          ← Código React Three Fiber
│   ├── GameBoard.example.tsx             ← Escena completa del juego
│   ├── Character.component.tsx           ← Componente de personaje
│   ├── DiceRoller.component.tsx          ← Sistema de dados con física
│   └── AssetLoader.utility.ts            ← Sistema de carga con caché
│
└── 📁 [characters/resources/vehicles/dice/] ← Assets GLB (vacío por ahora)
```

---

## 🚀 Cómo Usar Este Sistema

### Para Artistas 3D

#### 1️⃣ **Generación Rápida con IA** (Recomendado para prototipado)

```
1. Lee: prompts/CHARACTER_PROMPTS.md
2. Copia el prompt del asset que quieres generar
3. Ve a Meshy.ai o Rodin.ai
4. Genera el modelo 3D
5. Descarga como GLB
6. Valida en Three.js Editor
7. Ajusta escala/origen en Blender si es necesario
8. Coloca en: client/assets/3d/{category}/{name}/
```

**Tiempo estimado:** 10-30 min por asset

#### 2️⃣ **Modelado Manual** (Para calidad final)

```
1. Lee: specs/characters_spec.json (o el que corresponda)
2. Modela en Blender siguiendo specs exactas
3. Texturiza (workflow PBR)
4. Exporta como GLB con texturas embebidas
5. Valida tamaño, escala y calidad
6. Entrega en carpeta correspondiente
```

**Tiempo estimado:** 2-6 horas por asset

### Para Desarrolladores

#### 1️⃣ **Setup Inicial**

```bash
# Instalar dependencias
npm install three @react-three/fiber @react-three/drei

# Opcional: postprocessing y debugging
npm install @react-three/postprocessing leva
```

#### 2️⃣ **Integrar Sistema de Carga**

```tsx
// En tu App.tsx principal
import { getAssetLoader } from './client/assets/3d/examples/AssetLoader.utility';

function App() {
  useEffect(() => {
    // Preload assets prioritarios al inicio
    getAssetLoader().preloadPriority();
  }, []);
  
  return <YourGameComponent />;
}
```

#### 3️⃣ **Usar Componentes Listos**

```tsx
import { Character } from './client/assets/3d/examples/Character.component';
import { CharacterType } from './engine/domain/types';

<Canvas>
  <Character
    type={CharacterType.DOCTOR}
    position={[0, 0, 0]}
    isSelected={selectedId === 'doctor-1'}
    onClick={() => handleSelect('doctor-1')}
    showNameTag
    name="Dr. Smith"
  />
</Canvas>
```

#### 4️⃣ **Implementar Escena Completa**

```tsx
// Copia y adapta: examples/GameBoard.example.tsx
// Ya incluye:
// - Iluminación optimizada
// - Controles de cámara
// - Grid helper
// - Sistema de loading
```

---

## 📊 Assets Disponibles

### Personajes (5 base)
- ✅ **Especificaciones:** `specs/characters_spec.json`
- ✅ **Prompts:** `prompts/CHARACTER_PROMPTS.md`
- ✅ **Componente:** `examples/Character.component.tsx`
- ⏳ **Assets GLB:** Pendientes de generación

1. Doctor (médico futurista)
2. Soldado (combate)
3. Campesino (recolector)
4. Constructor (ingeniero)
5. Minero (extracción)

### Recursos (4 base)
- ✅ **Especificaciones:** `specs/resources_spec.json`
- ✅ **Prompts:** `prompts/RESOURCES_VEHICLES_DICE_PROMPTS.md`
- ⏳ **Assets GLB:** Pendientes de generación

1. Comida (cajas)
2. Medicina (maletines)
3. Metal (lingotes)
4. Minerales (cristales glowing)

### Vehículos (3)
1. Nave Nodriza Alienígena (elemento central)
2. Barca de Transporte
3. Plataforma Flotante

### Dados (5)
1. Dado Ataque Alienígena (símbolos especiales)
2. Dado Acción Alienígena
3. Dado Humano D6
4. Dados Humanos 2D3
5. Dado de Combate

**Total:** 17 assets base + 19 variantes = **36 assets**

---

## 🎯 Siguiente Paso Inmediato

### Opción A: Generar Assets con IA (Rápido)

**Fase 1 - Core Gameplay (1-2 días):**
```
1. Genera 5 personajes base
   → Usa: prompts/CHARACTER_PROMPTS.md
   → Herramienta: Meshy.ai
   
2. Genera 4 recursos
   → Usa: prompts/RESOURCES_VEHICLES_DICE_PROMPTS.md
   → Herramienta: Rodin.ai (más rápido para props)
   
3. Genera 3 dados prioritarios
   → Puede requerir ajustes manuales en Blender
```

**Resultado:** Prototipo jugable con todos los elementos visuales

### Opción B: Contratar Artista 3D (Calidad)

**Briefing al artista:**
```
1. Entrega: client/assets/3d/specs/ (todas las specs)
2. Referencias: prompts/*.md (descripciones detalladas)
3. Estilo: Realista estilizado, ciencia ficción distópica
4. Formato: GLB con texturas embebidas, PBR workflow
5. Calendario: Ver ASSET_INVENTORY.md para prioridades
```

**Resultado:** Assets de calidad production-ready

### Opción C: Placeholder Geométricos (Desarrollo)

**Mientras se generan assets reales:**
```tsx
// Usa cubos/cilindros temporales
function PlaceholderCharacter({ position, type }) {
  const color = CHARACTER_COLORS[type];
  return (
    <mesh position={position}>
      <boxGeometry args={[0.5, 1.75, 0.5]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}
```

**Resultado:** Desarrollo continúa sin bloqueos

---

## 🔧 Herramientas Recomendadas

### Generación 3D con IA
- **Meshy.ai** → https://www.meshy.ai (mejor para personajes)
- **Rodin.ai** → https://hyperhuman.deemos.com/rodin (rápido)
- **Luma AI** → https://lumalabs.ai (image-to-3D)

### Modelado 3D
- **Blender** → https://www.blender.org/ (gratis, potente)
- **Maya/3ds Max** → Industria estándar (de pago)

### Texturizado
- **Substance Painter** → Estándar industria PBR
- **Quixel Mixer** → Gratis, muy bueno
- **Blender** → Nodos de shader (incluido)

### Validación
- **Three.js Editor** → https://threejs.org/editor/
- **glTF Viewer** → https://gltf-viewer.donmccurdy.com/
- **Babylon Sandbox** → https://sandbox.babylonjs.com/

---

## ✅ Checklist de Implementación

### Para el Equipo de Arte
- [ ] Revisar QUICKSTART.md
- [ ] Leer specs de personajes
- [ ] Generar primeros 3 personajes (Doctor, Soldado, Campesino)
- [ ] Validar en Three.js Editor
- [ ] Entregar GLB en carpetas correctas
- [ ] Iterar basándose en feedback

### Para el Equipo de Desarrollo
- [ ] Instalar dependencias Three.js
- [ ] Implementar AssetLoader.utility.ts
- [ ] Crear componente Character con estados
- [ ] Integrar con GameState del motor
- [ ] Añadir sistema de dados con física
- [ ] Optimizar rendimiento (60 FPS target)
- [ ] Conectar con UI del juego

### Para Project Manager
- [ ] Revisar ASSET_INVENTORY.md (plan completo)
- [ ] Decidir: IA vs. Artista vs. Híbrido
- [ ] Asignar tareas por prioridad
- [ ] Establecer calendario (ver fases en ASSET_INVENTORY)
- [ ] Definir criterios de aceptación
- [ ] Coordinar validación técnica

---

## 📈 Métricas de Éxito

### Técnicas
- ✅ Todos los assets <1MB
- ✅ Escala coherente (1 unit = 1m)
- ✅ 60 FPS con 10+ assets en pantalla
- ✅ Carga inicial <3 segundos
- ✅ Sin errores de validación glTF

### Visuales
- ✅ Estilo coherente entre assets
- ✅ Lectura clara desde cámara isométrica
- ✅ Diferenciación obvia entre tipos
- ✅ Calidad profesional o prototipo claro

### Workflow
- ✅ Pipeline documentado y repetible
- ✅ Assets organizados y nombrados correctamente
- ✅ Código de integración limpio y mantenible
- ✅ Equipo capacitado en el sistema

---

## 🆘 Soporte

### Si tienes dudas:

**Técnicas (desarrollo):**
- Lee: `INTEGRATION_GUIDE.md`
- Ejemplos: `examples/*.tsx`
- Debug: Ver sección Troubleshooting en INTEGRATION_GUIDE

**Artísticas (modelado):**
- Lee: `README.md` (especificaciones técnicas)
- Specs detalladas: `specs/*.json`
- Prompts: `prompts/*.md`

**Gestión (coordinación):**
- Plan completo: `ASSET_INVENTORY.md`
- Guía rápida: `QUICKSTART.md`
- Este archivo: `INDEX.md`

---

## 🎉 Resultado Final

Con este sistema completo tendrás:

✅ **36 assets 3D** (17 base + 19 variantes)  
✅ **Pipeline optimizado** (IA + manual)  
✅ **Integración perfecta** con Three.js  
✅ **Componentes React reutilizables**  
✅ **Sistema de carga inteligente**  
✅ **Rendimiento optimizado** (60 FPS)  
✅ **Documentación completa**  
✅ **Código production-ready**  

**Un juego web 3D profesional y optimizado para JORUMI.**

---

## 📄 Documentos Clave por Rol

| Rol | Empieza aquí | Luego lee | Referencias |
|-----|--------------|-----------|-------------|
| **Artista 3D** | QUICKSTART.md | CHARACTER_PROMPTS.md | specs/*.json |
| **Desarrollador** | INTEGRATION_GUIDE.md | examples/*.tsx | README.md |
| **Tech Lead** | README.md | AssetLoader.utility.ts | INTEGRATION_GUIDE |
| **Project Manager** | INDEX.md (este) | ASSET_INVENTORY.md | QUICKSTART.md |
| **QA/Testing** | ASSET_INVENTORY.md | README.md (checklist) | - |

---

**Versión:** 1.0  
**Fecha:** Enero 2026  
**Estado:** ✅ Sistema completo, listo para producción de assets  
**Licencia:** Uso interno proyecto JORUMI



