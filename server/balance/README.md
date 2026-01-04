# JORUMI - Sistema de Balance y Tuning Automático

Sistema completo de análisis, simulación y ajuste automático de balance para el juego JORUMI.

## 📋 Tabla de Contenidos

- [Visión General](#visión-general)
- [Arquitectura](#arquitectura)
- [Instalación](#instalación)
- [Guía de Uso](#guía-de-uso)
- [Componentes](#componentes)
- [Ejemplos](#ejemplos)
- [API Reference](#api-reference)
- [Métricas](#métricas)
- [Añadir Nuevos Parámetros](#añadir-nuevos-parámetros)
- [FAQ](#faq)

---

## Visión General

Este sistema permite:

- ✅ **Evaluar el balance** entre humanos y alienígenas mediante simulaciones masivas
- ✅ **Detectar desbalances** automáticamente (win rate, duración, recursos, etc.)
- ✅ **Ajustar parámetros** sin modificar reglas base
- ✅ **Iterar automáticamente** mediante algoritmos de optimización
- ✅ **Reproducir resultados** con RNG seedeado

### Principios Clave

1. **No cambiar reglas, solo parámetros**: El motor de reglas permanece intacto
2. **Todo es medible**: Cada ajuste tiene métricas asociadas
3. **100% server-side**: No depende de UI ni cliente
4. **Reproducible**: Mismo seed = mismo resultado
5. **Separación de concerns**: Motor → Parámetros → Análisis

---

## Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                    Balance System                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐ │
│  │ BalanceConfig│───▶│SimulationRun│───▶│MetricsCollec │ │
│  │              │    │              │    │              │ │
│  └──────────────┘    └──────────────┘    └──────────────┘ │
│         │                   │                    │          │
│         │                   ▼                    ▼          │
│         │            ┌──────────────┐    ┌──────────────┐ │
│         │            │  GameEngine  │    │ BalanceAnaly │ │
│         │            │  + AlienAI   │    │              │ │
│         │            └──────────────┘    └──────────────┘ │
│         │                                        │          │
│         │                                        ▼          │
│         │                                ┌──────────────┐ │
│         └───────────────────────────────▶│  AutoTuner   │ │
│                                          │              │ │
│                                          └──────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Flujo de Trabajo

1. **BalanceConfig** define parámetros ajustables
2. **SimulationRunner** ejecuta N partidas con esos parámetros
3. **MetricsCollector** recopila estadísticas de cada partida
4. **BalanceAnalyzer** detecta problemas y sugiere ajustes
5. **AutoTuner** ajusta parámetros iterativamente hasta convergencia

---

## Instalación

```bash
cd server
npm install
```

El sistema de balance está en `server/balance/` y depende de:
- `engine/` - Motor de reglas de JORUMI
- `ai/` - IA alienígena

---

## Guía de Uso

### Inicio Rápido

```typescript
import { 
  DEFAULT_BALANCE_CONFIG,
  SimulationRunner,
  createDefaultSimulationConfig 
} from './balance';

// 1. Crear configuración
const config = DEFAULT_BALANCE_CONFIG;

// 2. Ejecutar simulación
const simConfig = createDefaultSimulationConfig(config, 1000);
const runner = new SimulationRunner(simConfig);
const result = await runner.run();

// 3. Ver resultados
console.log(`Win rate humanos: ${result.summary.humanWinRate * 100}%`);
console.log(`Turnos promedio: ${result.summary.avgTurns}`);
```

### Análisis de Balance

```typescript
import { BalanceAnalyzer, MetricsCollector, generateTextReport } from './balance';

// Recolectar métricas agregadas
const collector = new MetricsCollector(config);
result.metrics.forEach(m => collector.recordGame(m));
const aggregated = collector.aggregate();

// Analizar
const analyzer = new BalanceAnalyzer(config);
const report = analyzer.analyze(result, aggregated);

// Imprimir reporte
console.log(generateTextReport(report));

// Ver problemas detectados
report.issues.forEach(issue => {
  console.log(`[${issue.severity}] ${issue.title}`);
  console.log(`  ${issue.description}`);
});

// Ver recomendaciones
report.recommendations.forEach(rec => {
  console.log(`${rec.title} (Prioridad: ${rec.priority}/10)`);
  rec.parameterAdjustments.forEach(adj => {
    console.log(`  • ${adj.parameter}: ${adj.currentValue} → ${adj.suggestedValue}`);
  });
});
```

### Auto-Tuning

```typescript
import { AutoTuner, createDefaultTuningConfig, TuningStrategy } from './balance';

// Configurar tuning
const tuningConfig = createDefaultTuningConfig();
tuningConfig.strategy = TuningStrategy.HILL_CLIMBING;
tuningConfig.maxIterations = 20;
tuningConfig.gamesPerIteration = 100;
tuningConfig.parametersToTune = [
  'alien.mothershipInitialHealth',
  'survival.foodConsumptionPerHuman',
  'gathering.peasantFood',
];

// Ejecutar
const tuner = new AutoTuner(tuningConfig);
const tuningResult = await tuner.tune(initialConfig);

// Usar mejor configuración
const bestConfig = tuningResult.bestConfig;
console.log(`Mejora: ${tuningResult.improvementPercentage}%`);
```

---

## Componentes

### 1. BalanceConfig

Configuración centralizada de todos los parámetros ajustables.

**Categorías:**
- `initial` - Configuración inicial (población, recursos)
- `survival` - Mecánicas de supervivencia (comida, medicina)
- `combat` - Mecánicas de combate (daño, escudos)
- `gathering` - Recolección de recursos
- `building` - Construcción de edificios
- `alien` - Estado y comportamiento alienígena
- `victory` - Condiciones de victoria
- `movement` - Reglas de movimiento
- `limits` - Límites del juego

**Ejemplo:**
```typescript
const config: BalanceConfig = {
  id: 'my-config',
  name: 'Mi Configuración',
  version: '1.0.0',
  description: 'Alienígena más fuerte',
  
  alien: {
    mothershipInitialHealth: 25,  // +5 respecto a default
    initialShield: 4,              // +1 respecto a default
    // ... más parámetros
  },
  
  survival: {
    foodConsumptionPerHuman: 1.2,  // +20% consumo
    starvationDeathsRatio: 0.6,    // +10% letalidad
    // ... más parámetros
  },
  
  // ... otras categorías
};
```

### 2. SimulationRunner

Ejecuta partidas completas sin UI, recolectando métricas.

**Características:**
- Ejecución masiva (cientos/miles de partidas)
- RNG seedeado para reproducibilidad
- Integración con IA alienígena
- Callback de progreso
- Timeout por partida

**Ejemplo:**
```typescript
const simConfig: SimulationConfig = {
  balanceConfig: myConfig,
  numGames: 500,
  startSeed: 12345,
  alienDifficulty: DifficultyLevel.NORMAL,
  humanStrategy: HumanStrategy.BALANCED,
  maxTurnsPerGame: 50,
  verbose: false,
  collectSnapshots: true,
};

const runner = new SimulationRunner(simConfig);

runner.onProgress((progress) => {
  console.log(`${progress.percentage}% completado`);
});

const result = await runner.run();
```

### 3. MetricsCollector

Recopila y agrega métricas de múltiples partidas.

**Métricas individuales:**
- Resultado (ganador, condición de victoria, turnos)
- Humanos (población, muertes, guettos)
- Alienígena (daño, control, ataques)
- Recursos (recolección, consumo, desperdicio)
- Construcción (edificios construidos/destruidos)
- Combate (daño total, críticos)
- Eventos especiales
- Snapshots por turno (opcional)

**Métricas agregadas:**
- Win rates y distribución
- Estadísticas de duración
- Promedios de supervivencia
- Utilización de recursos
- Diversidad de condiciones de victoria
- Estabilidad de resultados

### 4. BalanceAnalyzer

Analiza métricas y detecta problemas de balance.

**Análisis:**
- **Win Rate**: Detecta desbalance entre bandos
- **Duración**: Detecta partidas muy cortas/largas
- **Recursos**: Detecta recursos infrautilizados
- **Victorias**: Detecta condiciones dominantes
- **Estabilidad**: Detecta resultados muy aleatorios

**Salida:**
- Calificación general (A-F)
- Lista priorizada de problemas
- Recomendaciones accionables
- Ajustes sugeridos de parámetros

**Ejemplo de reporte:**
```
═══════════════════════════════════════════════════════════
  JORUMI - REPORTE DE BALANCE
═══════════════════════════════════════════════════════════

Configuración: Balance Original
Partidas analizadas: 1000
Fecha: 2025-01-04

┌─────────────────────────────────────────────────────────┐
│ CALIFICACIÓN GENERAL: GOOD                              │
│ Puntuación: 78.5/100                                    │
└─────────────────────────────────────────────────────────┘

PUNTUACIONES DETALLADAS:
  • Win Rate:     85.2/100
  • Duración:     72.0/100
  • Diversidad:   68.5/100
  • Estabilidad:  81.0/100
  • Engagement:   75.8/100

PROBLEMAS DETECTADOS (2):
─────────────────────────────────────────────────────────
1. [MEDIUM] Desbalance moderado hacia humanos
   Win rate: 56.2% humanos, 43.8% alienígena. Se recomienda ajuste.

2. [LOW] Recursos infrautilizados
   Los siguientes recursos están infrautilizados: minerales.

RECOMENDACIONES:
─────────────────────────────────────────────────────────
1. Ajustar balance de victorias (Prioridad: 10/10)
   El win rate está en 56.2%. Se recomienda ajustar...
   Impacto esperado: Mejorar win rate en ~3.1%

   Ajustes sugeridos:
   • survival.foodConsumptionPerHuman: 1.0 → 1.1
     (+10.0%)
```

### 5. AutoTuner

Sistema de optimización automática de parámetros.

**Estrategias disponibles:**
- `HILL_CLIMBING` - Escalada de colina (recomendado)
- `SIMULATED_ANNEALING` - Recocido simulado
- `RANDOM_SEARCH` - Búsqueda aleatoria
- `GRID_SEARCH` - Búsqueda exhaustiva
- `GRADIENT_DESCENT` - Descenso de gradiente (aproximado)

**Configuración:**
```typescript
const tuningConfig: TuningConfig = {
  strategy: TuningStrategy.HILL_CLIMBING,
  parametersToTune: ['alien.mothershipInitialHealth', 'survival.foodConsumptionPerHuman'],
  targetWinRate: 0.50,
  targetDurationMin: 15,
  targetDurationMax: 35,
  maxIterations: 20,
  gamesPerIteration: 100,
  convergenceThreshold: 2.0,
  stepSize: 0.1,
  verbose: true,
  saveHistory: true,
};
```

**Función de fitness:**
El AutoTuner optimiza para:
- Win rate cercano al 50%
- Duración de partida apropiada (15-35 turnos)
- Buena calificación general
- Alta estabilidad

---

## Ejemplos

Ver `examples.ts` para ejemplos completos.

### Ejemplo 1: Simulación Básica
```bash
npm run balance:example1
```

### Ejemplo 2: Análisis de Balance
```bash
npm run balance:example2
```

### Ejemplo 3: Auto-Tuning
```bash
npm run balance:example3
```

### Ejemplo 4: Comparar Configuraciones
```bash
npm run balance:example4
```

### Ejemplo 5: Flujo Completo
```bash
npm run balance:example5
```

---

## API Reference

### Funciones de utilidad

#### `createDefaultSimulationConfig(config, numGames)`
Crea una configuración de simulación por defecto.

#### `runQuickSimulation(config, numGames)`
Ejecuta una simulación rápida y retorna resultados.

#### `compareConfigs(configA, configB, numGames)`
Compara dos configuraciones ejecutando simulaciones.

#### `generateTextReport(report)`
Genera un reporte de balance en formato texto legible.

#### `generateTuningReport(tuningResult)`
Genera un reporte de tuning en formato texto.

#### `quickTune(config)`
Ejecuta un tuning rápido (10 iteraciones, 50 partidas).

---

## Métricas

### Métricas Clave

| Métrica | Descripción | Objetivo |
|---------|-------------|----------|
| **humanWinRate** | % de victorias humanas | ~50% |
| **averageTurns** | Turnos promedio por partida | 15-35 |
| **finalPopulation** | Humanos vivos al final | Variable |
| **mothershipHealth** | Vida de nave al final | Variable |
| **foodUtilization** | % de comida utilizada | >60% |
| **mineralUtilization** | % de minerales utilizados | >60% |
| **winRateStability** | Consistencia de win rate | >0.75 |

### Umbrales de Detección

Ver `BALANCE_THRESHOLDS` en `BalanceAnalyzer.ts`:

```typescript
IDEAL_WIN_RATE: 0.50
ACCEPTABLE_WIN_RATE_MIN: 0.45
ACCEPTABLE_WIN_RATE_MAX: 0.55
CRITICAL_WIN_RATE_MIN: 0.35
CRITICAL_WIN_RATE_MAX: 0.65

MIN_TURNS: 10
MAX_TURNS: 45
IDEAL_MIN_TURNS: 15
IDEAL_MAX_TURNS: 35

MIN_RESOURCE_UTILIZATION: 0.60
MIN_CONDITION_USAGE: 0.10
MAX_CONDITION_DOMINANCE: 0.70
```

---

## Añadir Nuevos Parámetros

### 1. Definir en `BalanceConfig.ts`

```typescript
export interface CombatConfig {
  // ... parámetros existentes
  newParameter: number;  // [min-max] Descripción
}
```

### 2. Agregar a `DEFAULT_BALANCE_CONFIG`

```typescript
combat: {
  // ... valores existentes
  newParameter: 5,
}
```

### 3. Agregar a `PARAMETER_RANGES`

```typescript
'combat.newParameter': { 
  min: 1, 
  max: 10, 
  step: 0.5, 
  description: 'Descripción del parámetro' 
}
```

### 4. Aplicar en el motor

Modificar `SimulationRunner.applyBalanceConfigToState()` o el motor de reglas para usar el nuevo parámetro.

### 5. Añadir a tuning (opcional)

```typescript
tuningConfig.parametersToTune = [
  // ... parámetros existentes
  'combat.newParameter',
];
```

---

## FAQ

### ¿Cuántas partidas debo simular?

- **Pruebas rápidas**: 50-100 partidas
- **Análisis estándar**: 500-1000 partidas
- **Análisis profundo**: 2000+ partidas
- **Auto-tuning**: 50-100 partidas por iteración

### ¿Qué estrategia de tuning debo usar?

- **Hill Climbing**: Rápido, bueno para ajustes finos
- **Simulated Annealing**: Más robusto, evita mínimos locales
- **Random Search**: Exploración amplia, lento
- **Grid Search**: Exhaustivo, muy lento

**Recomendación**: Empezar con Hill Climbing.

### ¿Cómo interpreto el fitness?

- **90-100**: Excelente balance
- **75-89**: Buen balance
- **60-74**: Balance aceptable
- **40-59**: Balance pobre
- **0-39**: Balance crítico

### ¿El auto-tuning siempre mejora?

No garantiza mejora absoluta. Puede:
- Converger a un mínimo local
- Necesitar más iteraciones
- Necesitar ajustar `stepSize` o estrategia

**Tip**: Ejecutar múltiples sesiones con diferentes seeds.

### ¿Puedo ejecutar en paralelo?

Actualmente no está implementado, pero la arquitectura lo soporta. Cada simulación es independiente y puede ejecutarse en paralelo.

### ¿Cómo guardo configuraciones?

```typescript
import { serializeConfig, deserializeConfig } from './balance';

// Guardar
const json = serializeConfig(myConfig);
fs.writeFileSync('config.json', json);

// Cargar
const json = fs.readFileSync('config.json', 'utf-8');
const config = deserializeConfig(json);
```

### ¿Cómo comparo con el manual original?

```typescript
import { DEFAULT_BALANCE_CONFIG } from './balance';

const comparison = await compareConfigs(
  DEFAULT_BALANCE_CONFIG,
  myCustomConfig,
  500
);
```

---

## Troubleshooting

### Error: "No valid alien actions available"

- **Causa**: El motor no puede generar acciones alienígenas válidas
- **Solución**: Revisar que el estado del juego permite acciones alienígenas

### Simulaciones muy lentas

- **Causa**: Muchas partidas o partidas muy largas
- **Solución**: 
  - Reducir `numGames`
  - Reducir `maxTurnsPerGame`
  - Desactivar `collectSnapshots`
  - Desactivar `verbose`

### Win rate siempre 100% o 0%

- **Causa**: Desbalance extremo
- **Solución**:
  - Revisar parámetros iniciales
  - Aumentar `mothershipInitialHealth` o reducir `soldierBaseAttack`

### AutoTuner no converge

- **Causa**: Función de fitness muy ruidosa o stepSize inadecuado
- **Solución**:
  - Aumentar `gamesPerIteration`
  - Reducir `stepSize`
  - Cambiar estrategia a `SIMULATED_ANNEALING`
  - Aumentar `maxIterations`

---

## Contribuir

Para añadir nuevas métricas, análisis o estrategias de tuning:

1. Añadir tipos en el archivo correspondiente
2. Implementar lógica de recolección/análisis
3. Añadir tests
4. Actualizar documentación
5. Añadir ejemplo de uso

---

## Licencia

Este sistema es parte del proyecto JORUMI.

---

## Contacto

Para preguntas o sugerencias sobre el sistema de balance, consultar la documentación del proyecto principal JORUMI.


