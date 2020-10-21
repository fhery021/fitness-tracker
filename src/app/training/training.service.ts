import { UIService } from './../shared/ui.service';
import { Subscription } from 'rxjs/Subscription';
import { AngularFirestore } from 'angularfire2/firestore';
import { Injectable } from '@angular/core';
import { Exercise } from './exercise.model';
import { map } from 'rxjs/operators/map';
import { Store } from '@ngrx/store';
import * as UI from '../shared/ui.actions';
import * as Training from './training.actions';
import * as fromTraining from './training.reducer';
import { take } from 'rxjs/operators';


@Injectable()
export class TrainingService {
  private AVAILABLE_EXERCISES_PATH = 'availableExercises';
  private FINISHED_EXERCISES_PATH = 'finishedExercises';

  private firebaseSubscriptions: Subscription[] = [];

  constructor(
    private db: AngularFirestore,
    private uiService: UIService,
    private store: Store<fromTraining.State>
  ) { }

  private documentToDomainObject = _ => {
    const object = _.payload.doc.data();
    object.id = _.payload.doc.id;
    return object;
  }

  fetchAvailableExercises() {
    this.store.dispatch(new UI.StartLoading());
    this.firebaseSubscriptions.push(
      this.db
        .collection(this.AVAILABLE_EXERCISES_PATH)
        .snapshotChanges()
        .pipe(
          map(actions => actions.map(this.documentToDomainObject))
        ).subscribe({
          next: (exercises: Exercise[]) => {
            this.store.dispatch(new UI.StopLoading());
            this.store.dispatch(new Training.SetAvailableExercises(exercises));
          },
          error: (err: any) => {
            this.store.dispatch(new UI.StopLoading());
            console.error(err);
            this.uiService.showSnackBar('Fetching Exercises failed, please try again later', null, 3000);
          }
        })
    );
  }

  startExercise(selectedId: string) {
    this.store.dispatch(new Training.StartTraining(selectedId));
  }

  completeExercise() {
    this.store.select(fromTraining.getActiveTraining)
      .subscribe(ex => {
        this.addDataToDatabase({
          ...ex,
          date: new Date(),
          state: 'completed'
        });
        this.store.dispatch(new Training.StopTraining());
      });
  }

  cancelExercise(progress: number) {
    this.store.select(fromTraining.getActiveTraining)
      .pipe(take(1))
      .subscribe(ex => {
        this.addDataToDatabase({
          ...ex,
          duration: ex.duration * (progress / 100),
          caloriesBurned: ex.caloriesBurned * (progress / 100),
          date: new Date(),
          state: 'cancelled'
        });
        this.store.dispatch(new Training.StopTraining());
      });
  }

  fetchCompletedOrCancelledExercises() {
    this.store.dispatch(new UI.StartLoading());
    this.firebaseSubscriptions.push(
      this.db.collection(this.FINISHED_EXERCISES_PATH)
        .valueChanges()
        .subscribe({
          next: (exercises: Exercise[]) => {
            this.store.dispatch(new Training.SetFinishedExercises(exercises));
            this.store.dispatch(new UI.StopLoading());
          },
          error: (err: any) => {
            this.store.dispatch(new UI.StopLoading());
            console.error(err);
            this.uiService.showSnackBar('Fetching Completed Exercises failed, please try again later', null, 3000);
            // this.finishedExercisesChanged.next(null);
          }
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
