import { UIService } from './../../shared/ui.service';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs';
import { NgForm } from '@angular/forms';
import { Exercise } from './../exercise.model';
import { TrainingService } from './../training.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { AngularFirestore, DocumentChangeAction } from 'angularfire2/firestore';
import { map } from 'rxjs/operators/map';
import { isNgTemplate } from '@angular/compiler';


@Component({
  selector: 'app-new-training',
  templateUrl: './new-training.component.html',
  styleUrls: ['./new-training.component.css']
})
export class NewTrainingComponent implements OnInit, OnDestroy {
  exercices: Exercise[];
  exercisesSubscription: Subscription;

  isLoading = true;
  private loadingSubscription: Subscription;

  constructor(
    private trainingService: TrainingService,
    private uiService: UIService
  ) { }

  ngOnInit(): void {
    this.exercisesSubscription = this.trainingService.exercisesChanged.subscribe(exercises => this.exercices = exercises);
    this.loadingSubscription = this.uiService.loadingStateChanged.subscribe(isLoading => this.isLoading = isLoading);
    this.fetchExercises();
  }

  fetchExercises() {
    this.trainingService.fetchAvailableExercises();
  }

  onStartTraining(form: NgForm) {
    this.trainingService.startExercise(form.value.exercise);
  }

  ngOnDestroy(): void {
    if (this.exercisesSubscription) {
      this.exercisesSubscription.unsubscribe();
    }
    if (this.loadingSubscription) {
      this.loadingSubscription.unsubscribe();
    }
  }
}
