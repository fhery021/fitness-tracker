import { UIService } from './../../shared/ui.service';
import { Subscription } from 'rxjs/Subscription';
import { TrainingService } from './../training.service';
import { Exercise } from './../exercise.model';
import { AfterViewInit, Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-past-trainings',
  templateUrl: './past-trainings.component.html',
  styleUrls: ['./past-trainings.component.css']
})
export class PastTrainingsComponent implements OnInit, AfterViewInit, OnDestroy {

  displayedColumns = ['date', 'name', 'duration', 'caloriesBurned', 'state'];
  dataSource = new MatTableDataSource<Exercise>();
  private exerciseChangedSubsription: Subscription;

  isLoading = true;
  private loadingSubscription: Subscription;

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    private trainingService: TrainingService,
    private uiService: UIService
  ) { }

  ngOnInit(): void {
    this.loadingSubscription = this.uiService.loadingStateChanged.subscribe(isLoading => this.isLoading = isLoading);
    this.exerciseChangedSubsription = this.trainingService
      .finishedExercisesChanged
      .subscribe({
        next: (exercise: Exercise[]) => this.dataSource.data = exercise
      });
    this.trainingService.fetchCompletedOrCancelledExercises();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  doFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  ngOnDestroy(): void {
    if (this.exerciseChangedSubsription) {
      this.exerciseChangedSubsription.unsubscribe();
    }
    if (this.loadingSubscription) {
      this.loadingSubscription.unsubscribe();
    }
  }
}
