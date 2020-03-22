import { Component, OnInit, OnDestroy } from '@angular/core';
import { DataService } from '../providers/data.service';
import { SubscriptionLike } from 'rxjs';
import { Account } from 'shared/types';
import { AuthService } from '../providers/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  constructor(
    public authService: AuthService,
    private dataService: DataService,
    private router: Router) { }

  account: Account | undefined;
  userSubscription: SubscriptionLike | undefined;
  accountSubscription: SubscriptionLike | undefined;

  ngOnInit() {
    this.userSubscription = this.authService.walletUser$.subscribe(user => {
      if (user && !user.hasPin) {
        this.router.navigateByUrl('settings/set-pin');
      }
    });

    this.accountSubscription = this.dataService.getAccount$().subscribe(account => {
      this.account = account;

      if (account) {
        this.dataService.refreshUserData(account);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }

    if (this.accountSubscription) {
      this.accountSubscription.unsubscribe();
    }
  }
}
