import { MatSnackBar } from '@angular/material/snack-bar';
import { Injectable } from '@angular/core';

@Injectable()
export class UIService {

  constructor(private snackBar: MatSnackBar) { }

  showSnackBar(message, action, duration) {
    this.snackBar.open(message, action, { duration });
  }
}
