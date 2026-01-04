# JORUMI - Diseño del Sistema de IA Alienígena

## 📐 Modelo de Decisión

### Filosofía de Diseño

La IA alienígena de JORUMI está diseñada bajo un paradigma **basado en heurísticas ponderadas** (no machine learning), siguiendo estrictamente estos principios:

1. **Transparencia**: Cada decisión es explicable y auditable
2. **Determinismo**: Misma entrada = misma salida (opcional)
3. **Fairness**: La IA juega con las mismas reglas que los humanos
4. **Escalabilidad**: Fácil ajustar balance y comportamiento

### Arquitectura de Decisión

```
┌─────────────────────────────────────────────────────────┐
│                   AlienAIController                      │
└────────────┬────────────────────────────────┬───────────┘
             │                                │
    ┌────────▼────────┐              ┌───────▼─────────┐
    │  State Analysis │              │ Action Generator │
    │                 │              │                  │
    │ - Threat Eval   │              │ - Move           │
    │ - Opportunity   │              │ - Attack         │
    │ - Strategic Val │              │ - Control        │
    │ - Risk Assess   │              │ - Bomb           │
    │ - Victory Prog  │              │ - Scan           │
    └────────┬────────┘              └───────┬──────────┘
             │                                │
             └────────────┬───────────────────┘
                          │
                  ┌───────▼────────┐
                  │   Heuristic    │
                  │   Evaluator    │
                  │                │
                  │ Score = f(S,A) │
                  └───────┬────────┘
                          │
                  ┌───────▼────────┐
                  │   Difficulty   │
                  │   Weighting    │
                  │                │
                  │ Apply Profile  │
                  └───────┬────────┘
                          │
                  ┌───────▼────────┐
                  │    Action      │
                  │   Selection    │
                  │                │
                  │  Best Action   │
                  └────────────────┘
```

## 🧠 Sistema de Heurísticas

### Función de Evaluación Global

Para cada acción `A` en el estado `S`, calculamos:

```
Score(A, S) = Σ(Hi(A, S) × Wi)
```

Donde:
- `Hi` = Heurística i
- `Wi` = Peso de la heurística según dificultad

### Las 5 Heurísticas Fundamentales

#### 1. Threat Level (TL)

**Objetivo**: Identificar y neutralizar amenazas

**Fórmula**:
```
TL = PopThreat + ResourceThreat + BuildingThreat × ProximityMult × ControlMult

PopThreat = (population + wounded × 0.5) × 5
ResourceThreat = (metal + minerals) × 3
BuildingThreat = BEACON(40) + BUNKER(15) + HOSPITAL(10)
ProximityMult = distance < 3 ? 1.5 : 1.0
ControlMult = alienControlled ? 0.3 : 1.0
```

**Uso**: Priorizar ataques a guettos peligrosos

#### 2. Opportunity Score (OS)

**Objetivo**: Identificar blancos vulnerables

**Fórmula**:
```
OS = VulnerabilityScore + ResourceGain - DefensePenalty

VulnerabilityScore = population × 5 + wounded × 3
ResourceGain = (hasBeacon ? 30 : 0) + stealableResources
DefensePenalty = hasBunker ? 15 : 0
```

**Uso**: Aprovechar momentos de debilidad humana

#### 3. Strategic Value (SV)

**Objetivo**: Evaluar valor a largo plazo

**Fórmula**:
```
SV = ResourceValue + ControlValue + PreventionValue

ResourceValue = food × 2 + medicine × 3 + minerals × 5
ControlValue = population × 4
PreventionValue = (hasBeacon ? 50 : 0) + (hasWorkshop ? 15 : 0)
```

**Uso**: Decisiones que impactan múltiples turnos

#### 4. Risk Assessment (RA)

**Objetivo**: Evaluar peligro de una acción

**Fórmula**:
```
RA = 100 - Σ(RiskFactors)

RiskFactors:
- hasBunker: -30
- distance > 3: -20
- alienShield < 2: -30
- population > 5: -20
```

**Uso**: Evitar acciones peligrosas cuando el escudo es bajo

#### 5. Victory Progress (VP)

**Objetivo**: Medir cercanía a victoria alienígena

**Fórmula**:
```
VP = PopulationReduction + VictoryPrevention + TerritorialControl

PopulationReduction = (100 - humanVictoryProgress) + population × 2
VictoryPrevention = hasBeacon ? 40 : 0
TerritorialControl = alienControlled ? 20 : 0
```

**Uso**: Priorizar acciones que acercan a la victoria

### Ponderación por Dificultad

Las heurísticas se ponderan diferente según el perfil:

```typescript
Score_final = 
  TL × W_threat +
  OS × W_opportunity +
  SV × W_strategic +
  RA × W_risk +
  VP × W_victory

// Normalizado a escala 0-100
Score_final = Score_final / 5
```

**Matrices de Ponderación**:

| Profile | W_threat | W_opportunity | W_strategic | W_risk | W_victory |
|---------|----------|---------------|-------------|--------|-----------|
| Easy    | 0.3      | 0.5           | 0.2         | 0.6    | 0.3       |
| Normal  | 0.5      | 0.6           | 0.4         | 0.5    | 0.5       |
| Hard    | 0.7      | 0.8           | 0.7         | 0.4    | 0.8       |
| Expert  | 0.9      | 0.9           | 0.9         | 0.3    | 1.0       |

## 🎯 Objetivos Tácticos Dinámicos

### Sistema de Priorización

La IA mantiene una lista dinámica de objetivos tácticos:

```typescript
enum TacticalGoal {
  ELIMINATE_HUMANS,      // Reducir población
  CONTROL_RESOURCES,     // Robar recursos críticos
  PREVENT_BEACON,        // Impedir victoria por baliza
  DEFEND_MOTHERSHIP,     // Proteger nave nodriza
  ISOLATE_GHETTOS,       // Romper cadenas de suministro
  STEAL_RESOURCES,       // Capturar recursos valiosos
  MAINTAIN_SHIELD,       // Recuperar escudo
}
```

### Selección de Objetivo Principal

```
IF humanVictoryProgress > 70:
  PRIMARY = PREVENT_BEACON
ELIF alienShield < 2 AND humanThreat > 60:
  PRIMARY = MAINTAIN_SHIELD
ELIF mothershipUnderThreat:
  PRIMARY = DEFEND_MOTHERSHIP
ELIF highValueGhettoExists:
  PRIMARY = CONTROL_RESOURCES
ELSE:
  PRIMARY = ELIMINATE_HUMANS
```

## 🎲 Integración con Sistema de Dados

### Flujo de Decisión con Dados

```
1. Servidor lanza dados alienígenas
   ├─ Dado de Ataque: [SHIELD, CONTROL, ATTACK, DOUBLE_ATTACK]
   └─ Dado de Acción: [MOVE, SCAN, BOMB, SPECIAL]

2. IA recibe resultados de dados

3. IA genera solo acciones PERMITIDAS por dados
   ├─ Si ATTACK → generar ataques posibles
   ├─ Si CONTROL → generar controles posibles
   ├─ Si BOMB → generar bombardeos posibles
   └─ Si SHIELD → aumentar escudo (automático)

4. IA evalúa acciones permitidas

5. IA selecciona mejor acción

6. Servidor aplica acción a través del motor
```

### Importante: La IA NO Altera Dados

```typescript
// ❌ INCORRECTO
ai.rollDice() // IA no lanza dados

// ✓ CORRECTO
const diceResult = server.rollDice()
const decision = ai.decideTurn(state, diceResult)
```

## 📊 Análisis del Estado del Juego

### GameStateAnalysis

Antes de decidir, la IA analiza el estado completo:

```typescript
interface GameStateAnalysis {
  // Situación humana
  totalHumanPopulation: number
  humanResourceStrength: number    // 0-100
  humanThreatLevel: number         // 0-100
  humanVictoryProgress: number     // 0-100
  
  // Situación alienígena
  alienShieldLevel: number
  mothershipUnderThreat: boolean
  
  // Evaluación de guettos
  ghettos: GhettoThreatAssessment[]
  
  // Objetivos identificados
  primaryTarget?: GhettoId
  criticalThreats: GhettoId[]
  
  // Decisiones tácticas
  shouldRetreat: boolean
  shouldAggress: boolean
  shouldControl: boolean
  shouldBomb: boolean
}
```

### Evaluación de Cada Guetto

```typescript
interface GhettoThreatAssessment {
  ghettoId: string
  threatLevel: number           // 0-100
  strategicValue: number        // 0-100
  population: number
  resources: ResourceInventory
  hasBeacon: boolean
  hasBunker: boolean
  distanceFromAlien: number
  controlStatus: string
}
```

## 🔄 Ciclo de Decisión Completo

### Paso a Paso

```
1. ENTRADA
   ├─ GameState actual
   ├─ Resultado dado de ataque (opcional)
   └─ Resultado dado de acción (opcional)

2. ANÁLISIS
   ├─ Evaluar situación global
   ├─ Identificar amenazas críticas
   ├─ Calcular progreso de victoria humana
   └─ Determinar objetivo táctico principal

3. GENERACIÓN
   ├─ Generar todas las acciones posibles
   ├─ Filtrar solo las VÁLIDAS según reglas
   └─ Priorizar por tipo (ataque > control > bomba > move > scan)

4. EVALUACIÓN
   ├─ Para cada acción:
   │   ├─ Calcular 5 heurísticas
   │   ├─ Aplicar ponderaciones de dificultad
   │   └─ Aplicar ajuste aleatorio (según perfil)
   └─ Ordenar por puntuación

5. SELECCIÓN
   ├─ Tomar mejor acción (o subóptima si "error")
   ├─ Calcular confianza
   └─ Generar reasoning explicable

6. SALIDA
   ├─ GameAction válida
   ├─ Reasoning textual
   ├─ Breakdown de heurísticas
   ├─ Nivel de confianza
   └─ Acciones alternativas (top 5)

7. LOGGING
   ├─ Registrar decisión completa
   ├─ Timestamp y timing
   └─ Estado pre-decisión
```

### Ejemplo Concreto

```
Estado:
- Guetto A: 10 población, tiene baliza, distancia 2
- Guetto B: 5 población, sin baliza, distancia 3
- Alien shield: 3
- Human victory progress: 65%

Dados:
- Attack: ATTACK (daño 2)
- Action: MOVE

Análisis:
- Amenaza crítica: Guetto A (baliza)
- Objetivo táctico: PREVENT_BEACON

Acciones generadas:
1. ALIEN_ATTACK → Guetto A
2. ALIEN_ATTACK → Guetto B
3. MOVE_ALIEN → hacia Guetto A
4. MOVE_ALIEN → hacia Guetto B

Evaluación (dificultad HARD):

Acción 1 (Attack Ghetto A):
- TL: 87.5 (baliza + población + proximidad)
- OS: 72.3 (población alta)
- SV: 91.0 (prevenir victoria)
- RA: 65.0 (riesgo moderado)
- VP: 78.2 (alto impacto victoria)
- TOTAL: 79.8

Acción 2 (Attack Ghetto B):
- TL: 45.2
- OS: 40.1
- SV: 35.0
- RA: 80.0
- VP: 35.5
- TOTAL: 47.2

Selección:
→ ALIEN_ATTACK Ghetto A
  Confidence: 85%
  Reasoning: "Attack ghetto A: beacon detected (critical threat), high population (threat: 87)"
```

## 🎮 Perfiles de Comportamiento

### Easy - "El Torpe"

**Características**:
- Decisiones erráticas
- Ignora amenazas obvias
- No bloquea victorias humanas
- 50% aleatoriedad en decisiones

**Ejemplo de comportamiento**:
```
Situación: Baliza a punto de activarse
Easy AI: Ataca guetto lejano con baja población
Reasoning: "La decisión tuvo alto componente aleatorio"
```

### Normal - "El Competente"

**Características**:
- Balance razonable
- Responde a amenazas evidentes
- Planificación básica
- 20% aleatoriedad

**Ejemplo de comportamiento**:
```
Situación: Baliza a punto de activarse
Normal AI: Ataca el guetto con baliza
Reasoning: "Amenaza identificada, acción lógica"
```

### Hard - "El Estratega"

**Características**:
- Planificación a 2 turnos
- Bloqueo proactivo de victorias
- Alta priorización de amenazas
- 10% aleatoriedad

**Ejemplo de comportamiento**:
```
Situación: Guetto acumulando recursos para baliza
Hard AI: Bombardea el guetto ANTES de que construyan
Reasoning: "Prevención anticipada de amenaza futura"
```

### Expert - "El Implacable"

**Características**:
- Optimización matemática
- Cero errores
- Máxima presión constante
- 0% aleatoriedad

**Ejemplo de comportamiento**:
```
Situación: Múltiples guettos vulnerables
Expert AI: Ataca el que maximiza impacto matemáticamente
Reasoning: "Acción óptima según evaluación multi-factor"
```

## 🔧 Puntos de Ajuste para Balance

### 1. Ajustar Agresividad Global

```typescript
// En difficulty-profiles.ts
behaviors: {
  aggressiveness: 0.8, // ↑ Más agresivo / ↓ Más defensivo
}
```

### 2. Ajustar Importancia de Balizas

```typescript
// En heuristics.ts
if (ghetto.hasBeacon) {
  strategicValue += 50; // ↑ Más prioridad a balizas
}
```

### 3. Ajustar Umbral de Retirada

```typescript
// En heuristics.ts
const shouldRetreat = 
  alien.shieldLevel < 2 && // ↑ Más cauteloso
  humanThreatLevel > 60;   // ↓ Se retira antes
```

### 4. Ajustar Ponderaciones de Heurísticas

```typescript
// En difficulty-profiles.ts
weights: {
  threatResponse: 0.9,      // ↑ Más reactivo a amenazas
  opportunitySeizing: 0.9,  // ↑ Más oportunista
  strategicPlanning: 0.9,   // ↑ Más planificado
  riskTaking: 0.3,          // ↓ Más cauteloso
  victoryFocus: 1.0,        // ↑ Más enfocado en ganar
}
```

### 5. Ajustar Valores de Recursos

```typescript
// En heuristics.ts
value += ghetto.resources.MINERALS × 5; // ↑ Más valor a minerales
value += ghetto.population × 4;         // ↑ Más valor a población
```

## 📈 Métricas de Evaluación

### Métricas de Calidad de IA

1. **Win Rate**: % de victorias por dificultad
2. **Average Turns**: Duración promedio de partidas
3. **Decision Coherence**: Consistencia en decisiones similares
4. **Threat Response Time**: Turnos para responder a amenazas
5. **Error Rate**: Frecuencia de decisiones subóptimas

### Métricas de Balance

```typescript
interface BalanceMetrics {
  // Por dificultad
  difficulty: DifficultyLevel
  
  // Resultados
  alienWinRate: number          // Target: Easy 25%, Normal 50%, Hard 70%, Expert 85%
  averageTurns: number          // Target: Easy 18, Normal 15, Hard 12, Expert 10
  averageFinalPopulation: number // Target varía por dificultad
  
  // Comportamiento
  averageConfidence: number     // Qué tan segura está la IA
  actionDistribution: Record<ActionType, number> // Balance de acciones
  mistakeRate: number           // Frecuencia de errores
}
```

## 🧪 Testing y Validación

### Tests Críticos

1. **Determinismo**
   ```typescript
   test('Same state + same seed = same action')
   ```

2. **Validez de Acciones**
   ```typescript
   test('All AI actions are valid according to rules')
   ```

3. **Respuesta a Amenazas**
   ```typescript
   test('AI prioritizes beacon when present')
   ```

4. **Uso de Recursos**
   ```typescript
   test('AI retreats when shield is low')
   ```

5. **Balance por Dificultad**
   ```typescript
   test('Expert wins more than Easy')
   ```

## 📚 Referencias

### Inspiración de Diseño

Este sistema se inspira en:

1. **Utility AI** (The Sims, F.E.A.R.)
   - Múltiples heurísticas ponderadas
   - Selección por score máximo

2. **Goal-Oriented Action Planning**
   - Objetivos tácticos dinámicos
   - Planificación orientada a victoria

3. **Behavior Trees** (simplificados)
   - Evaluación jerárquica
   - Decisiones condicionadas al estado

### Literatura Relevante

- "Behavioral Mathematics for Game AI" (Dave Mark)
- "Game AI Pro" (Steven Rabin)
- "AI Game Programming Wisdom" (Steve Rabin)

---

**Versión**: 1.0.0  
**Fecha**: Enero 2026  
**Autor**: Sistema de IA JORUMI


