import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from './providers/auth.service';
import { tap } from 'rxjs/operators';
import { SubscriptionLike } from 'rxjs';
import { WalletUser } from 'shared/types';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnDestroy {

  title = 'Turtle fanny pack';
  initialized = false;
  user: WalletUser | undefined;
  userSubscription: SubscriptionLike;

  constructor(public authService: AuthService) {
    this.userSubscription = this.authService.walletUser$.pipe(
      tap(_ => this.initialized = true)
    ).subscribe(user => this.user = user);
  }

  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
  }
}
