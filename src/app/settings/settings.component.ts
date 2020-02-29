import { Component, OnInit } from '@angular/core';
import { AuthService } from '../providers/auth.service';
import { Observable } from 'rxjs';
import { WalletUser } from 'shared/types';

@Component({
  selector: 'settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  user$: Observable<WalletUser | undefined>;

  constructor(private authService: AuthService) {
    this.user$ = this.authService.walletUser$;
  }

  ngOnInit() {
  }
}
