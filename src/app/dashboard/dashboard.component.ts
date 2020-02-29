import { Component, OnInit, OnDestroy } from '@angular/core';
import { DataService } from '../providers/data.service';
import { SubscriptionLike } from 'rxjs';
import { Account } from 'shared/types';
import { AuthService } from '../providers/auth.service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  constructor(
    public authService: AuthService,
    private dataService: DataService) { }

  account: Account | undefined;
  subscription: SubscriptionLike | undefined;

  ngOnInit() {
    this.subscription = this.dataService.getAccount$().subscribe(account => {
      this.account = account;

      if (account) {
        this.dataService.refreshUserData(account);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
