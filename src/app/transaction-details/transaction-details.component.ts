import { Component, OnInit } from '@angular/core';
import { Transaction } from 'shared/types';
import { DataService } from '../providers/data.service';

@Component({
  selector: 'transaction-details',
  templateUrl: './transaction-details.component.html',
  styleUrls: ['./transaction-details.component.scss']
})
export class TransactionDetailsComponent implements OnInit {

  transaction: Transaction | undefined;

  constructor(private dataService: DataService) { }

  ngOnInit() {
    this.transaction = this.dataService.selectedTransaction;
  }
}
