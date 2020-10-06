import { StopTrainingComponent } from './stop-training.component';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-current-training',
  templateUrl: './current-training.component.html',
  styleUrls: ['./current-training.component.css']
})
export class CurrentTrainingComponent implements OnInit {

  progress = 0;
  timer: number;

  constructor(private dialog: MatDialog) { }

  ngOnInit(): void {
    this.timer = setInterval (() => {
      this.progress++;
      if (this.progress >= 100) {
        clearInterval(this.timer);
      }
    }, 100);
  }

  onStop() {
    clearInterval(this.timer);
    this.dialog.open(StopTrainingComponent);
  }
}
