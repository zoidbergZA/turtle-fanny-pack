import { Injectable } from '@angular/core';
import { AngularFireFunctions } from '@angular/fire/functions';
import { PreparedTransaction, Transaction } from 'shared/types';

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  constructor(private afFunctions: AngularFireFunctions) { }

  async prepareSend(fromAccount: string, amountAtomic: number, address: string): Promise<PreparedTransaction> {
    return this.afFunctions.httpsCallable('accountPrepareSend')({
      accountId: fromAccount,
      amount: amountAtomic,
      address: address
    }).toPromise();
  }

  async send(preparedTxId: string, pin: string): Promise<Transaction> {
    return this.afFunctions.httpsCallable('accountSend')({
      preparedTxId: preparedTxId,
      pin: pin
    }).toPromise();
  }
}
