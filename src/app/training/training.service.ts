import { UIService } from './../shared/ui.service';
import { Subscription } from 'rxjs/Subscription';
import { AngularFirestore } from 'angularfire2/firestore';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Exercise } from './exercise.model';
import { map } from 'rxjs/operators/map';

@Injectable()
export class TrainingService {
  exerciseChanged = new Subject<Exercise>();
  exercisesChanged = new Subject<Exercise[]>();
  finishedExercisesChanged = new Subject<Exercise[]>();

  private AVAILABLE_EXERCISES_PATH = 'availableExercises';
  private FINISHED_EXERCISES_PATH = 'finishedExercises';

  private availableExercises: Exercise[] = [];
  private runningExercise: Exercise;

  private firebaseSubscriptions: Subscription[] = [];

  constructor(
    private db: AngularFirestore,
    private uiService: UIService
  ) { }

  private documentToDomainObject = _ => {
    const object = _.payload.doc.data();
    object.id = _.payload.doc.id;
    return object;
  }

  fetchAvailableExercises() {
    this.uiService.loadingStateChanged.next(true);
    this.firebaseSubscriptions.push(
      this.db
        .collection(this.AVAILABLE_EXERCISES_PATH)
        .snapshotChanges()
        .pipe(
          map(actions => actions.map(this.documentToDomainObject))
        ).subscribe({
          next: (exercises: Exercise[]) => {
            this.availableExercises = exercises;
            this.exercisesChanged.next(this.availableExercises.slice());
            this.uiService.loadingStateChanged.next(false);
          },
          error: (err: any) => {
            this.uiService.loadingStateChanged.next(false);
          }
        })
    );

    return this.availableExercises.slice();
  }

  startExercise(selectedId: string) {
    // HOW-TO:  select a single document, then update it
    // this.db.doc(this.AVAILABLE_EXERCISES_PATH + '/' + selectedId).update({ lastSelected: new Date() });

    this.runningExercise = this.availableExercises.find(ex => ex.id === selectedId);
    this.exerciseChanged.next({ ...this.runningExercise });
  }

  completeExercise() {
    this.addDataToDatabase({
      ...this.runningExercise,
      date: new Date(),
      state: 'completed'
    });
    this.runningExercise = null;
    this.exerciseChanged.next(null);
  }

  cancelExercise(progress: number) {
    this.addDataToDatabase({
      ...this.runningExercise,
      duration: this.runningExercise.duration * (progress / 100),
      caloriesBurned: this.runningExercise.caloriesBurned * (progress / 100),
      date: new Date(),
      state: 'cancelled'
    });
    this.runningExercise = null;
    this.exerciseChanged.next(null);
  }

  getRunningExercise() {
    return { ...this.runningExercise };
  }

  fetchCompletedOrCancelledExercises() {
    this.uiService.loadingStateChanged.next(true);
    this.firebaseSubscriptions.push(
      this.db.collection(this.FINISHED_EXERCISES_PATH)
        .valueChanges()
        .subscribe({
          next: (exercises: Exercise[]) => {
            this.finishedExercisesChanged.next(exercises);
            this.uiService.loadingStateChanged.next(false);
          },
          error: _ => this.uiService.loadingStateChanged.next(false)
        })
    );
  }

  private addDataToDatabase(exercise: Exercise) {
    this.db.collection(this.FINISHED_EXERCISES_PATH).add(exercise);
  }

  cancelSubscriptions() {
    this.firebaseSubscriptions.forEach(sub => sub.unsubscribe);
  }
}
