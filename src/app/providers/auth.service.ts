import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { auth } from 'firebase/app';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/firestore';
import { WalletUser } from 'shared/types';
import { Router } from '@angular/router';
import { AngularFireFunctions } from '@angular/fire/functions';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  firebaseUser$: Observable<firebase.User | null>;
  walletUser$: Observable<WalletUser | undefined>;
  walletUser: WalletUser | undefined;

  constructor(
    public firebaseAuth: AngularFireAuth,
    private afFunctions: AngularFireFunctions,
    private firestore: AngularFirestore,
    private router: Router) {

    this.firebaseUser$ = this.firebaseAuth.authState;

    this.walletUser$ = this.firebaseAuth.authState.pipe(
      switchMap(u => {
        if (u) {
          return firestore.doc<WalletUser>(`users/${u.uid}`).valueChanges();
        } else {
          return from([undefined]);
        }
      })
    );

    this.walletUser$.subscribe(user => {
      this.walletUser = user;

      if (user && !user.hasPin) {
        this.router.navigateByUrl('settings/set-pin');
      }
    });
  }

  createUserWithEmailAndPassword(email: string, password: string): Promise<auth.UserCredential> {
    return this.firebaseAuth.auth.createUserWithEmailAndPassword(email, password);
  }

  signInWithEmailAndPassword(email: string, password: string): Promise<any> {
    return this.firebaseAuth.auth.signInWithEmailAndPassword(email, password);
  }

  sendPasswordResetEmail(email: string): Promise<void> {
    return this.firebaseAuth.auth.sendPasswordResetEmail(email);
  }

  setPin(pin: string): Promise<boolean> {
    return this.afFunctions.httpsCallable('setUserPin')({
      pin: pin
    }).toPromise();
  }

  verifyPin(pin: string): Promise<boolean> {
    return this.afFunctions.httpsCallable('verifyUserPin')({
      pin: pin
    }).toPromise();
  }

  resetPinEmail(): Promise<any> {
    return this.afFunctions.httpsCallable('resetUserPinEmail')({ }).toPromise();
  }

  async signout(): Promise<void> {
    await this.firebaseAuth.auth.signOut();

    this.router.navigate(['/']);
  }
}
