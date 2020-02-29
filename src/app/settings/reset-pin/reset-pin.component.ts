import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/providers/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'reset-pin',
  templateUrl: './reset-pin.component.html',
  styleUrls: ['./reset-pin.component.scss']
})
export class ResetPinComponent implements OnInit {

  errorMessage: string | undefined;
  working = false;
  sent = false;
  email: string | undefined;

  constructor(
    private router: Router,
    private authService: AuthService) {

    if (this.authService.walletUser) {
      this.email = this.authService.walletUser.email;
    }
  }

  ngOnInit() {
  }

  async resetClick() {
    this.working = true;
    this.errorMessage = undefined;

    try {
      await this.authService.resetPinEmail();
      this.sent = true;
    } catch (error) {
      this.errorMessage = error;
    } finally {
      this.working = false;
    }
  }

  homeClick() {
    this.router.navigateByUrl('/');
  }
}
