/**
 * JORUMI Balance System - Ejemplos de Uso
 * 
 * Ejemplos completos de cómo usar el sistema de balance.
 */

import {
  DEFAULT_BALANCE_CONFIG,
  createCustomConfig,
  SimulationRunner,
  createDefaultSimulationConfig,
  BalanceAnalyzer,
  MetricsCollector,
  AutoTuner,
  createDefaultTuningConfig,
  TuningStrategy,
  generateTextReport,
  generateTuningReport,
  compareConfigs,
} from './index';

// ============================================================================
// EJEMPLO 1: SIMULACIÓN BÁSICA
// ============================================================================

/**
 * Ejecuta una simulación simple con la configuración por defecto
 */
export async function example1_BasicSimulation() {
  console.log('=== EJEMPLO 1: Simulación Básica ===\n');
  
  // Usar configuración por defecto
  const config = DEFAULT_BALANCE_CONFIG;
  
  // Crear configuración de simulación
  const simConfig = createDefaultSimulationConfig(config, 100);
  simConfig.verbose = true;
  
  // Ejecutar simulación
  const runner = new SimulationRunner(simConfig);
  
  runner.onProgress((progress) => {
    console.log(`Progreso: ${progress.percentage.toFixed(1)}% (${progress.completed}/${progress.total})`);
  });
  
  const result = await runner.run();
  
  // Mostrar resultados
  console.log('\n--- Resultados ---');
  console.log(`Partidas completadas: ${result.completedGames}`);
  console.log(`Win rate humanos: ${(result.summary.humanWinRate * 100).toFixed(1)}%`);
  console.log(`Turnos promedio: ${result.summary.avgTurns.toFixed(1)}`);
  console.log(`Humanos finales (promedio): ${result.summary.avgFinalHumans.toFixed(1)}`);
  
  return result;
}

// ============================================================================
// EJEMPLO 2: ANÁLISIS DE BALANCE
// ============================================================================

/**
 * Ejecuta una simulación y analiza el balance
 */
export async function example2_BalanceAnalysis() {
  console.log('=== EJEMPLO 2: Análisis de Balance ===\n');
  
  const config = DEFAULT_BALANCE_CONFIG;
  
  // Simular
  const simConfig = createDefaultSimulationConfig(config, 200);
  const runner = new SimulationRunner(simConfig);
  const result = await runner.run();
  
  // Recolectar métricas agregadas
  const collector = new MetricsCollector(config);
  result.metrics.forEach(m => collector.recordGame(m));
  const aggregated = collector.aggregate();
  
  // Analizar
  const analyzer = new BalanceAnalyzer(config);
  const report = analyzer.analyze(result, aggregated);
  
  // Mostrar reporte
  const textReport = generateTextReport(report);
  console.log(textReport);
  
  // Mostrar problemas críticos
  const criticalIssues = report.issues.filter(i => i.severity === 'CRITICAL');
  if (criticalIssues.length > 0) {
    console.log('⚠️  PROBLEMAS CRÍTICOS DETECTADOS:');
    criticalIssues.forEach(issue => {
      console.log(`   - ${issue.title}`);
      console.log(`     ${issue.description}`);
    });
  }
  
  // Mostrar recomendaciones principales
  if (report.recommendations.length > 0) {
    console.log('\n💡 RECOMENDACIONES PRINCIPALES:');
    report.recommendations.slice(0, 3).forEach((rec, i) => {
      console.log(`   ${i + 1}. ${rec.title} (Prioridad: ${rec.priority}/10)`);
      console.log(`      ${rec.description}`);
    });
  }
  
  return report;
}

// ============================================================================
// EJEMPLO 3: AUTO-TUNING
// ============================================================================

/**
 * Ejecuta auto-tuning para mejorar el balance
 */
export async function example3_AutoTuning() {
  console.log('=== EJEMPLO 3: Auto-Tuning ===\n');
  
  const initialConfig = DEFAULT_BALANCE_CONFIG;
  
  // Configurar tuning
  const tuningConfig = createDefaultTuningConfig();
  tuningConfig.strategy = TuningStrategy.HILL_CLIMBING;
  tuningConfig.maxIterations = 15;
  tuningConfig.gamesPerIteration = 80;
  tuningConfig.parametersToTune = [
    'alien.mothershipInitialHealth',
    'alien.initialShield',
    'survival.foodConsumptionPerHuman',
    'gathering.peasantFood',
  ];
  tuningConfig.verbose = true;
  
  // Ejecutar tuning
  const tuner = new AutoTuner(tuningConfig);
  const tuningResult = await tuner.tune(initialConfig);
  
  // Mostrar reporte
  const report = generateTuningReport(tuningResult);
  console.log(report);
  
  // Guardar mejor configuración
  console.log('Mejor configuración encontrada:');
  console.log(JSON.stringify(tuningResult.bestConfig, null, 2));
  
  return tuningResult;
}

// ============================================================================
// EJEMPLO 4: COMPARACIÓN DE CONFIGURACIONES
// ============================================================================

/**
 * Compara dos configuraciones diferentes
 */
export async function example4_CompareConfigs() {
  console.log('=== EJEMPLO 4: Comparación de Configuraciones ===\n');
  
  // Configuración A: Default
  const configA = DEFAULT_BALANCE_CONFIG;
  
  // Configuración B: Alienígena más fuerte
  const configB = createCustomConfig(
    'Alienígena Fuerte',
    'Configuración con alienígena más poderoso',
    {
      alien: {
        ...DEFAULT_BALANCE_CONFIG.alien,
        mothershipInitialHealth: 25,  // +5
        initialShield: 4,              // +1
      },
    }
  );
  
  // Comparar
  console.log('Comparando configuraciones...');
  const comparison = await compareConfigs(configA, configB, 100);
  
  console.log('\n--- RESULTADOS DE COMPARACIÓN ---');
  console.log(`\nConfiguración A: ${configA.name}`);
  console.log(`  Win rate humanos: ${(comparison.configA.summary.humanWinRate * 100).toFixed(1)}%`);
  console.log(`  Turnos promedio: ${comparison.configA.summary.avgTurns.toFixed(1)}`);
  
  console.log(`\nConfiguración B: ${configB.name}`);
  console.log(`  Win rate humanos: ${(comparison.configB.summary.humanWinRate * 100).toFixed(1)}%`);
  console.log(`  Turnos promedio: ${comparison.configB.summary.avgTurns.toFixed(1)}`);
  
  console.log(`\n💡 ${comparison.comparison.recommendation}`);
  
  return comparison;
}

// ============================================================================
// EJEMPLO 5: FLUJO COMPLETO
// ============================================================================

/**
 * Flujo completo: Simular → Analizar → Ajustar → Verificar
 */
export async function example5_CompleteWorkflow() {
  console.log('=== EJEMPLO 5: Flujo Completo ===\n');
  
  // PASO 1: Simulación inicial
  console.log('PASO 1: Simulando configuración inicial...');
  const initialConfig = DEFAULT_BALANCE_CONFIG;
  const initialResult = await runSimulation(initialConfig, 150);
  
  console.log(`  ✓ Win rate: ${(initialResult.summary.humanWinRate * 100).toFixed(1)}%`);
  
  // PASO 2: Análisis
  console.log('\nPASO 2: Analizando balance...');
  const initialReport = await analyzeConfig(initialConfig, initialResult);
  
  console.log(`  ✓ Calificación: ${initialReport.overallGrade}`);
  console.log(`  ✓ Puntuación: ${initialReport.overallScore.total.toFixed(1)}/100`);
  console.log(`  ✓ Problemas detectados: ${initialReport.issues.length}`);
  
  // PASO 3: Auto-tuning (si es necesario)
  if (initialReport.overallScore.total < 75) {
    console.log('\nPASO 3: Ejecutando auto-tuning...');
    
    const tuningConfig = createDefaultTuningConfig();
    tuningConfig.maxIterations = 10;
    tuningConfig.gamesPerIteration = 100;
    
    const tuner = new AutoTuner(tuningConfig);
    const tuningResult = await tuner.tune(initialConfig);
    
    console.log(`  ✓ Mejora: ${tuningResult.improvementPercentage >= 0 ? '+' : ''}${tuningResult.improvementPercentage.toFixed(1)}%`);
    console.log(`  ✓ Fitness final: ${tuningResult.bestFitness.toFixed(2)}`);
    
    // PASO 4: Verificar nueva configuración
    console.log('\nPASO 4: Verificando configuración mejorada...');
    const improvedResult = await runSimulation(tuningResult.bestConfig, 150);
    const improvedReport = await analyzeConfig(tuningResult.bestConfig, improvedResult);
    
    console.log(`  ✓ Nueva calificación: ${improvedReport.overallGrade}`);
    console.log(`  ✓ Nueva puntuación: ${improvedReport.overallScore.total.toFixed(1)}/100`);
    
    // Comparación final
    console.log('\n--- COMPARACIÓN FINAL ---');
    console.log(`Configuración inicial: ${initialReport.overallScore.total.toFixed(1)} pts`);
    console.log(`Configuración mejorada: ${improvedReport.overallScore.total.toFixed(1)} pts`);
    console.log(`Mejora: ${(improvedReport.overallScore.total - initialReport.overallScore.total).toFixed(1)} pts`);
    
    return {
      initial: { config: initialConfig, report: initialReport },
      improved: { config: tuningResult.bestConfig, report: improvedReport },
      tuningResult,
    };
  } else {
    console.log('\n✓ La configuración inicial ya está bien balanceada.');
    
    return {
      initial: { config: initialConfig, report: initialReport },
    };
  }
}

// ============================================================================
// FUNCIONES AUXILIARES
// ============================================================================

async function runSimulation(config: any, numGames: number) {
  const simConfig = createDefaultSimulationConfig(config, numGames);
  simConfig.verbose = false;
  const runner = new SimulationRunner(simConfig);
  return await runner.run();
}

async function analyzeConfig(config: any, result: any) {
  const collector = new MetricsCollector(config);
  result.metrics.forEach((m: any) => collector.recordGame(m));
  const aggregated = collector.aggregate();
  
  const analyzer = new BalanceAnalyzer(config);
  return analyzer.analyze(result, aggregated);
}

// ============================================================================
// EJECUTAR EJEMPLOS
// ============================================================================

/**
 * Ejecuta todos los ejemplos
 */
export async function runAllExamples() {
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║  JORUMI - EJEMPLOS DEL SISTEMA DE BALANCE                ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');
  
  try {
    // Descomentar los ejemplos que quieras ejecutar
    
    // await example1_BasicSimulation();
    // await example2_BalanceAnalysis();
    // await example3_AutoTuning();
    // await example4_CompareConfigs();
    await example5_CompleteWorkflow();
    
    console.log('\n✓ Todos los ejemplos completados exitosamente.');
  } catch (error) {
    console.error('\n✗ Error ejecutando ejemplos:', error);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  runAllExamples()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}



