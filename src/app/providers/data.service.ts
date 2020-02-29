import { Injectable } from '@angular/core';
import { AngularFireFunctions } from '@angular/fire/functions';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { Account, Transaction, PriceQuote, PreparedTransaction } from 'shared/types';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  defaultAccount: Account | undefined;

  constructor(
    private authService: AuthService,
    private firestore: AngularFirestore,
    private afFunctions: AngularFireFunctions) {

      this.getAccount$().subscribe(account => {
        this.defaultAccount = account;
      });
    }

  getAccount$(accountId?: string): Observable<Account | undefined> {
    return this.authService.walletUser$.pipe(
      switchMap(user => {
        if (user) {
          if (!accountId) {
            accountId = user.defaultAccount;
          }
          if (!accountId) {
            return from([undefined]);
          } else {
            return this.firestore.doc<Account>(`users/${user.id}/accounts/${accountId}`).valueChanges();
          }
        } else {
          return from([undefined]);
        }
      })
    );
  }

  getTransactions$(userId: string, accountId?: string, limit = 25): Observable<Transaction[]> {
    if (!accountId) {
      return this.firestore
        .collection<Transaction>(`users/${userId}/transactions`, ref => ref
          .limit(limit)
          .orderBy('timestamp', 'desc'))
        .valueChanges();
    } else {
      return this.firestore
        .collection<Transaction>(`users/${userId}/transactions`, ref => ref
          .where('accountId', '==', accountId)
          .limit(limit)
          .orderBy('timestamp', 'desc'))
        .valueChanges();
    }
  }

  getPriceInfo$(): Observable<PriceQuote | undefined> {
    return this.firestore.doc<PriceQuote>('priceQuotes/USD').valueChanges();
  }

  async refreshUserData(account: Account): Promise<any> {
    return this.afFunctions.httpsCallable('refreshAccountData')({
      accountId: account.id
    }).toPromise();
  }
}
