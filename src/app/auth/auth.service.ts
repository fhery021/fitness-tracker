import { MatSnackBar } from '@angular/material/snack-bar';
import { TrainingService } from './../training/training.service';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from 'angularfire2/auth';
import { Subject } from 'rxjs/Subject';
import { AuthData } from './auth-data.model';

@Injectable()
export class AuthService {
  authChange = new Subject<boolean>();
  private isAuthenticated = false;

  constructor(
    private router: Router,
    private angularFireAuth: AngularFireAuth,
    private trainingService: TrainingService,
    private snackBar: MatSnackBar
  ) { }

  initAuthListener() {
    this.angularFireAuth.authState.subscribe(user => {
      if (user) {
        this.isAuthenticated = true;
        this.authChange.next(true);
        this.router.navigate(['/training']);
      } else {
        this.trainingService.cancelSubscriptions();
        this.isAuthenticated = false;
        this.authChange.next(false);
        this.router.navigate(['/login']);
      }
    });
  }

  registerUser(authData: AuthData) {
    this.angularFireAuth.auth.createUserWithEmailAndPassword(
      authData.email,
      authData.password
    ).catch(error => {
      this.snackBar.open(error.message, null, {
        duration: 3000
      });
    });
  }

  logIn(authData: AuthData) {
    this.angularFireAuth.auth.signInWithEmailAndPassword(
      authData.email,
      authData.password
    ).catch(error => {
      this.snackBar.open(error.message, null, {
        duration: 3000
      });
    });
  }

  logOut() {
    this.angularFireAuth.auth.signOut();
  }

  isAuth() {
    return this.isAuthenticated;
  }
}
