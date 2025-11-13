import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { levenshteinDistance } from './utils/string-distance.utils';

interface MatrixCell {
  value: number;
  operation: 'match' | 'substitution' | 'insertion' | 'deletion' | 'init';
  isOptimalPath?: boolean;
  fromCell?: { i: number; j: number };
}

interface CalculationStep {
  i: number;
  j: number;
  charA: string;
  charB: string;
  match: boolean;
  substitutionCost: number;
  insertionCost: number;
  deletionCost: number;
  selectedOperation: string;
  finalValue: number;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  
  stringA: string = 'kitten';
  stringB: string = 'sitting';
  
  matrix: MatrixCell[][] = [];
  calculationSteps: CalculationStep[] = [];
  currentStep: number = -1;
  isAnimating: boolean = false;
  
  // Fuzzy matching properties
  fuzzyThreshold: number = 0.3; // Default threshold (30%)
  isMatch: boolean = false;
  similarityPercentage: number = 0;
  
  // Make Math available in template
  Math = Math;
  
  // Preset examples for educational purposes
  presetExamples = [
    { a: 'kitten', b: 'sitting', description: 'Ejemplo clásico' },
    { a: 'casa', b: 'caso', description: 'Cambio simple' },
    { a: 'gato', b: 'pato', description: 'Una sustitución' },
    { a: 'abc', b: 'def', description: 'Todas sustituciones' },
    { a: 'hello', b: 'hola', description: 'Palabras similares' },
    { a: '', b: 'test', description: 'Cadena vacía' }
  ];

  // Preset threshold scenarios
  thresholdPresets = [
    { value: 0.15, name: 'Muy Estricto', description: 'Corrector ortográfico médico', color: '#e74c3c' },
    { value: 0.25, name: 'Estricto', description: 'Corrector ortográfico general', color: '#f39c12' },
    { value: 0.4, name: 'Moderado', description: 'Motor de búsqueda', color: '#f1c40f' },
    { value: 0.6, name: 'Relajado', description: 'Búsqueda difusa', color: '#2ecc71' },
    { value: 0.8, name: 'Muy Relajado', description: 'Coincidencia de nombres', color: '#27ae60' }
  ];

  ngOnInit() {
    this.calculateMatrix();
    this.updateFuzzyMatch();
  }

  /**
   * Calculates the complete Levenshtein distance matrix with detailed steps
   */
  calculateMatrix(): void {
    this.calculationSteps = [];
    const a = this.stringA.toLowerCase();
    const b = this.stringB.toLowerCase();
    
    // Initialize matrix with proper dimensions
    this.matrix = Array(b.length + 1).fill(null).map(() => 
      Array(a.length + 1).fill(null).map(() => ({ 
        value: 0, 
        operation: 'init' as const 
      }))
    );

    // Initialize first row and column
    for (let i = 0; i <= b.length; i++) {
      this.matrix[i][0] = { 
        value: i, 
        operation: i === 0 ? 'init' : 'deletion',
        fromCell: i > 0 ? { i: i-1, j: 0 } : undefined
      };
    }
    
    for (let j = 0; j <= a.length; j++) {
      this.matrix[0][j] = { 
        value: j, 
        operation: j === 0 ? 'init' : 'insertion',
        fromCell: j > 0 ? { i: 0, j: j-1 } : undefined
      };
    }

    // Fill the matrix and record steps
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        const charA = a[j - 1];
        const charB = b[i - 1];
        const isMatch = charA === charB;
        
        // Calculate costs for each operation
        const substitutionCost = this.matrix[i - 1][j - 1].value + (isMatch ? 0 : 1);
        const insertionCost = this.matrix[i][j - 1].value + 1;
        const deletionCost = this.matrix[i - 1][j].value + 1;
        
        // Find minimum cost and operation
        const minCost = Math.min(substitutionCost, insertionCost, deletionCost);
        let operation: MatrixCell['operation'];
        let fromCell: { i: number; j: number };
        
        if (minCost === substitutionCost) {
          operation = isMatch ? 'match' : 'substitution';
          fromCell = { i: i - 1, j: j - 1 };
        } else if (minCost === insertionCost) {
          operation = 'insertion';
          fromCell = { i: i, j: j - 1 };
        } else {
          operation = 'deletion';
          fromCell = { i: i - 1, j: j };
        }
        
        this.matrix[i][j] = {
          value: minCost,
          operation: operation,
          fromCell: fromCell
        };

        // Record calculation step for educational purposes
        this.calculationSteps.push({
          i: i,
          j: j,
          charA: charA,
          charB: charB,
          match: isMatch,
          substitutionCost: substitutionCost,
          insertionCost: insertionCost,
          deletionCost: deletionCost,
          selectedOperation: this.getOperationName(operation),
          finalValue: minCost
        });
      }
    }

    this.markOptimalPath();
    this.updateFuzzyMatch();
  }

  /**
   * Updates the fuzzy matching result based on current threshold
   */
  updateFuzzyMatch(): void {
    const distance = this.getFinalDistance();
    const maxLength = Math.max(this.stringA.length, this.stringB.length);
    
    if (maxLength === 0) {
      this.similarityPercentage = 100;
      this.isMatch = true;
      return;
    }
    
    const normalizedDistance = distance / maxLength;
    this.similarityPercentage = Math.round((1 - normalizedDistance) * 100);
    this.isMatch = normalizedDistance <= this.fuzzyThreshold;
  }

  /**
   * Handles threshold slider changes
   */
  onThresholdChange(): void {
    this.updateFuzzyMatch();
  }

  /**
   * Sets a preset threshold value
   */
  setPresetThreshold(threshold: number): void {
    this.fuzzyThreshold = threshold;
    this.updateFuzzyMatch();
  }

  /**
   * Gets the normalized distance (0.0 to 1.0)
   */
  getNormalizedDistance(): number {
    const distance = this.getFinalDistance();
    const maxLength = Math.max(this.stringA.length, this.stringB.length);
    return maxLength > 0 ? distance / maxLength : 0;
  }

  /**
   * Gets the threshold as a percentage string
   */
  getThresholdPercentage(): string {
    return Math.round(this.fuzzyThreshold * 100) + '%';
  }

  /**
   * Gets a description of what the current threshold means
   */
  getThresholdDescription(): string {
    if (this.fuzzyThreshold <= 0.2) {
      return 'Muy estricto - Solo coincidencias casi exactas';
    } else if (this.fuzzyThreshold <= 0.35) {
      return 'Estricto - Ideal para correctores ortográficos';
    } else if (this.fuzzyThreshold <= 0.5) {
      return 'Moderado - Bueno para motores de búsqueda';
    } else if (this.fuzzyThreshold <= 0.7) {
      return 'Relajado - Búsqueda difusa general';
    } else {
      return 'Muy relajado - Coincidencias muy amplias';
    }
  }

  /**
   * Gets the maximum length of the two strings
   */
  getMaxLength(): number {
    return Math.max(this.stringA.length, this.stringB.length);
  }

  /**
   * Checks if a preset is currently active
   */
  isPresetActive(presetValue: number): boolean {
    return Math.abs(this.fuzzyThreshold - presetValue) < 0.01;
  }

  /**
   * Marks the optimal path through the matrix (backtracking)
   */
  private markOptimalPath(): void {
    if (this.matrix.length === 0) return;
    
    let i = this.matrix.length - 1;
    let j = this.matrix[0].length - 1;
    
    while (i > 0 || j > 0) {
      this.matrix[i][j].isOptimalPath = true;
      const fromCell = this.matrix[i][j].fromCell;
      
      if (fromCell) {
        i = fromCell.i;
        j = fromCell.j;
      } else {
        break;
      }
    }
    
    // Mark the starting cell
    if (this.matrix[0] && this.matrix[0][0]) {
      this.matrix[0][0].isOptimalPath = true;
    }
  }

  /**
   * Converts operation enum to readable Spanish name
   */
  getOperationName(operation: MatrixCell['operation']): string {
    const operations = {
      'match': 'Coincidencia',
      'substitution': 'Sustitución',
      'insertion': 'Inserción',
      'deletion': 'Eliminación',
      'init': 'Inicialización'
    };
    return operations[operation] || operation;
  }

  /**
   * Gets the final distance result
   */
  getFinalDistance(): number {
    if (this.matrix.length === 0 || this.matrix[0].length === 0) return 0;
    return this.matrix[this.matrix.length - 1][this.matrix[0].length - 1].value;
  }

  /**
   * Handles input changes and recalculates matrix
   */
  onInputChange(): void {
    if (this.isAnimating) return;
    this.calculateMatrix();
    this.currentStep = -1;
  }

  /**
   * Loads a preset example
   */
  loadPresetExample(example: any): void {
    this.stringA = example.a;
    this.stringB = example.b;
    this.onInputChange();
  }

  /**
   * Animation controls for step-by-step demonstration
   */
  startStepByStepAnimation(): void {
    this.isAnimating = true;
    this.currentStep = 0;
  }

  nextStep(): void {
    if (this.currentStep < this.calculationSteps.length - 1) {
      this.currentStep++;
    } else {
      this.stopAnimation();
    }
  }

  previousStep(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  stopAnimation(): void {
    this.isAnimating = false;
    this.currentStep = -1;
  }

  /**
   * Gets CSS classes for matrix cells
   */
  getCellClasses(i: number, j: number): string {
    const cell = this.matrix[i][j];
    let classes = ['matrix-cell'];
    
    if (cell.isOptimalPath) {
      classes.push('optimal-path');
    }
    
    classes.push(`operation-${cell.operation}`);
    
    // Highlight current step during animation
    if (this.isAnimating && this.currentStep >= 0) {
      const currentStepData = this.calculationSteps[this.currentStep];
      if (currentStepData && currentStepData.i === i && currentStepData.j === j) {
        classes.push('current-step');
      }
    }
    
    return classes.join(' ');
  }

  /**
   * Gets the current step data for display
   */
  getCurrentStepData(): CalculationStep | null {
    if (this.isAnimating && this.currentStep >= 0 && this.currentStep < this.calculationSteps.length) {
      return this.calculationSteps[this.currentStep];
    }
    return null;
  }

  /**
   * Clears both input strings
   */
  clearInputs(): void {
    this.stringA = '';
    this.stringB = '';
    this.onInputChange();
  }

  /**
   * Swaps the two input strings
   */
  swapStrings(): void {
    const temp = this.stringA;
    this.stringA = this.stringB;
    this.stringB = temp;
    this.onInputChange();
  }
}
