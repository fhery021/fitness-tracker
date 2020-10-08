import { TrainingService } from './training.service';
import { Subscription } from 'rxjs/Subscription';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-training',
  templateUrl: './training.component.html',
  styleUrls: ['./training.component.css']
})
export class TrainingComponent implements OnInit {
  ongoinTraining = false;
  exerciseSubsription: Subscription;

  constructor(private trainingService: TrainingService) { }

  ngOnInit(): void {
    this.exerciseSubsription = this.trainingService.exerciseChanged.subscribe(exercise => {
      this.ongoinTraining = exercise ? true : false;
    });
  }

}
