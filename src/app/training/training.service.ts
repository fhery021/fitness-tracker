import { Exercise } from './exercise.model';
export class TrainingService {

  private availableExercises: Exercise[] = [
    { id: 'crunches', name: 'Crunches', duration: 30, caloriesBurned: 8 },
    { id: 'touch-toes', name: 'Touch Toes', duration: 180, caloriesBurned: 15 },
    { id: 'side-lunges', name: 'Side Lunges', duration: 120, caloriesBurned: 18 },
    { id: 'burpees', name: 'Burpees', duration: 60, caloriesBurned: 80 }
  ];

  private runningExercise: Exercise;

  getAvailableExercises() {
    return this.availableExercises.slice();
  }

  startExercise(selectedId: string) {
    this.runningExercise = this.availableExercises.find(ex => ex.id === selectedId);
  }
}
