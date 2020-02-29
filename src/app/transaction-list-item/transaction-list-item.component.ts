import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Transaction } from 'shared/types';
import { SubscriptionLike } from 'rxjs';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'transaction-list-item',
  templateUrl: './transaction-list-item.component.html',
  styleUrls: ['./transaction-list-item.component.scss']
})
export class TransactionListItemComponent implements OnInit, OnDestroy {

  @Input() transaction: Transaction | undefined;

  isCompact = false;
  breakpointSub: SubscriptionLike;

  constructor(private breakpointObserver: BreakpointObserver) {
    this.breakpointSub = breakpointObserver.observe([Breakpoints.Small, Breakpoints.XSmall]).subscribe(state => {
      this.isCompact = state.matches;
    });
  }

  ngOnInit() {
  }

  ngOnDestroy(): void {
    this.breakpointSub.unsubscribe();
  }
}
