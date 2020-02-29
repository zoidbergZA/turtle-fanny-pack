import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { Transaction } from 'shared/types';
import { DataService } from '../providers/data.service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'transaction-history',
  templateUrl: './transaction-history.component.html',
  styleUrls: ['./transaction-history.component.scss']
})
export class TransactionHistoryComponent implements OnInit {

  @Input() userId: string | undefined;
  @Input() accountId: string | undefined;

  transactions$: Observable<Transaction[]> | undefined;
  txDayTracker = -1;

  constructor(private dataService: DataService) { }

  ngOnInit() {
    if (!this.userId) {
      console.error('missing userId input.');
      return;
    }

    if (this.accountId) {
      this.transactions$ = this.dataService.getTransactions$(this.userId, this.accountId);
    } else {
      this.transactions$ = this.dataService.getTransactions$(this.userId);
    }
  }

  isNewTransactionDay(txPrevious: Transaction, txCurrent: Transaction): boolean {
    return new Date(txPrevious.timestamp).getDay() !== new Date(txCurrent.timestamp).getDay();
  }
}
