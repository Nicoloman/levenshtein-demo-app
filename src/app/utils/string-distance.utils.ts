/**
 * Utility functions for string distance calculations
 */

/**
 * Calcula la distancia de Levenshtein entre dos cadenas
 * Se utiliza para calcular typos y diferencias entre strings.
 * @param a - Primera cadena
 * @param b - Segunda cadena
 * @returns - Número de operaciones mínimas para transformar a en b
 */
export function levenshteinDistance(a: string, b: string): number {
  const matrix = [];
  
  // Inicializar primera columna
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  
  // Inicializar primera fila
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  
  // Llenar la matriz
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  
  return matrix[b.length][a.length];
}

/**
 * Calcula la distancia de Levenshtein con información detallada del proceso
 * Útil para propósitos educativos y de debugging
 * @param a - Primera cadena
 * @param b - Segunda cadena
 * @returns Objeto con la distancia y la matriz completa
 */
export function levenshteinDistanceWithMatrix(a: string, b: string): {
  distance: number;
  matrix: number[][];
  operations: string[][];
} {
  const matrix: number[][] = [];
  const operations: string[][] = [];
  
  // Inicializar matrices
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [];
    operations[i] = [];
  }
  
  // Inicializar primera columna
  for (let i = 0; i <= b.length; i++) {
    matrix[i][0] = i;
    operations[i][0] = i === 0 ? 'init' : 'deletion';
  }
  
  // Inicializar primera fila
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
    operations[0][j] = j === 0 ? 'init' : 'insertion';
  }
  
  // Llenar las matrices
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      const charA = a.charAt(j - 1);
      const charB = b.charAt(i - 1);
      const isMatch = charA === charB;
      
      const substitutionCost = matrix[i - 1][j - 1] + (isMatch ? 0 : 1);
      const insertionCost = matrix[i][j - 1] + 1;
      const deletionCost = matrix[i - 1][j] + 1;
      
      const minCost = Math.min(substitutionCost, insertionCost, deletionCost);
      matrix[i][j] = minCost;
      
      if (minCost === substitutionCost) {
        operations[i][j] = isMatch ? 'match' : 'substitution';
      } else if (minCost === insertionCost) {
        operations[i][j] = 'insertion';
      } else {
        operations[i][j] = 'deletion';
      }
    }
  }
  
  return {
    distance: matrix[b.length][a.length],
    matrix,
    operations
  };
}
