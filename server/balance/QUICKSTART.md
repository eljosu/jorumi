# JORUMI Balance System - Guía Rápida

## 🚀 Inicio en 5 Minutos

### 1. Ejecutar una simulación básica

```typescript
import { DEFAULT_BALANCE_CONFIG, runQuickSimulation } from './balance';

const result = await runQuickSimulation(DEFAULT_BALANCE_CONFIG, 100);

console.log(`Win rate humanos: ${(result.summary.humanWinRate * 100).toFixed(1)}%`);
console.log(`Turnos promedio: ${result.summary.avgTurns.toFixed(1)}`);
```

**Línea de comando:**
```bash
npm run balance:example1
```

---

### 2. Analizar el balance

```typescript
import { 
  DEFAULT_BALANCE_CONFIG,
  SimulationRunner,
  createDefaultSimulationConfig,
  BalanceAnalyzer,
  MetricsCollector,
  generateTextReport 
} from './balance';

// Simular
const simConfig = createDefaultSimulationConfig(DEFAULT_BALANCE_CONFIG, 500);
const runner = new SimulationRunner(simConfig);
const result = await runner.run();

// Recolectar métricas
const collector = new MetricsCollector(DEFAULT_BALANCE_CONFIG);
result.metrics.forEach(m => collector.recordGame(m));
const aggregated = collector.aggregate();

// Analizar
const analyzer = new BalanceAnalyzer(DEFAULT_BALANCE_CONFIG);
const report = analyzer.analyze(result, aggregated);

// Ver reporte
console.log(generateTextReport(report));
```

**Línea de comando:**
```bash
npm run balance:example2
```

---

### 3. Ajustar automáticamente

```typescript
import { 
  DEFAULT_BALANCE_CONFIG,
  AutoTuner,
  createDefaultTuningConfig,
  generateTuningReport 
} from './balance';

// Configurar tuning
const tuningConfig = createDefaultTuningConfig();
tuningConfig.maxIterations = 15;
tuningConfig.gamesPerIteration = 100;

// Ejecutar
const tuner = new AutoTuner(tuningConfig);
const result = await tuner.tune(DEFAULT_BALANCE_CONFIG);

// Ver reporte
console.log(generateTuningReport(result));

// Usar mejor configuración
const bestConfig = result.bestConfig;
```

**Línea de comando:**
```bash
npm run balance:example3
```

---

## 📊 Métricas Clave

| Métrica | Objetivo | Crítico Si |
|---------|----------|-----------|
| **Win Rate** | ~50% | <35% o >65% |
| **Duración** | 15-35 turnos | <10 o >45 |
| **Utilización Recursos** | >60% | <40% |
| **Estabilidad** | >0.75 | <0.50 |

---

## 🎯 Casos de Uso Comunes

### Caso 1: "Los humanos ganan demasiado"

```typescript
// Aumentar dificultad alienígena
const config = createCustomConfig('Alienígena Más Fuerte', '', {
  alien: {
    ...DEFAULT_BALANCE_CONFIG.alien,
    mothershipInitialHealth: 25,  // +5
    attackWoundedRatio: 0.6,      // +0.1
  }
});

const result = await runQuickSimulation(config, 200);
```

### Caso 2: "Las partidas son muy cortas"

```typescript
// Aumentar durabilidad
const config = createCustomConfig('Partidas Más Largas', '', {
  alien: {
    ...DEFAULT_BALANCE_CONFIG.alien,
    mothershipInitialHealth: 30,  // +10
  },
  survival: {
    ...DEFAULT_BALANCE_CONFIG.survival,
    starvationDeathsRatio: 0.3,   // -0.2 (menos letalidad)
  }
});
```

### Caso 3: "Los minerales no se usan"

```typescript
// Hacer minerales más relevantes
const config = createCustomConfig('Minerales Importantes', '', {
  building: {
    ...DEFAULT_BALANCE_CONFIG.building,
    beaconMineralCost: 5,         // +2 (más demanda)
  },
  gathering: {
    ...DEFAULT_BALANCE_CONFIG.gathering,
    minerMinerals: 3,             // +1 (más generación)
  }
});
```

---

## 🔧 Flujo de Trabajo Recomendado

```
1. Simular (500+ partidas)
   ↓
2. Analizar balance
   ↓
3. ¿Balance aceptable?
   ├─ SÍ → Terminar
   └─ NO → 4. Auto-tuning (10-20 iteraciones)
            ↓
            5. Verificar mejora (500+ partidas)
            ↓
            6. ¿Mejora significativa?
               ├─ SÍ → Adoptar nueva configuración
               └─ NO → Ajustar manualmente y repetir
```

---

## 📝 Comandos Útiles

```bash
# Ejecutar todos los ejemplos
npm run balance:examples

# Ejemplo completo (flujo completo)
npm run balance:example5

# Comparar dos configuraciones
npm run balance:example4
```

---

## 🆘 Problemas Comunes

### "Simulaciones muy lentas"
- ✅ Reducir `numGames` a 50-100 para pruebas
- ✅ Desactivar `verbose` y `collectSnapshots`
- ✅ Reducir `maxTurnsPerGame`

### "Auto-tuning no mejora"
- ✅ Aumentar `gamesPerIteration` (más muestras)
- ✅ Cambiar estrategia a `SIMULATED_ANNEALING`
- ✅ Ajustar `stepSize` (0.05 para ajustes finos, 0.2 para exploración)

### "Win rate siempre extremo"
- ✅ Revisar parámetros iniciales
- ✅ Ejecutar con diferentes seeds
- ✅ Verificar que la IA funciona correctamente

---

## 📚 Más Información

- **README.md** - Documentación completa
- **examples.ts** - Ejemplos detallados
- **BalanceConfig.ts** - Todos los parámetros disponibles
- **PARAMETER_RANGES** - Rangos válidos para cada parámetro

---

## 💡 Tips

1. **Siempre usa seeds** para reproducibilidad
2. **Empieza con pocas partidas** (50-100) para pruebas rápidas
3. **Guarda las configuraciones** que funcionen bien
4. **Compara siempre** con la configuración por defecto
5. **Itera gradualmente** - cambios pequeños y medibles
6. **Documenta los cambios** - por qué y qué mejoraron

---

¡Listo para balancear! 🎮⚖️



