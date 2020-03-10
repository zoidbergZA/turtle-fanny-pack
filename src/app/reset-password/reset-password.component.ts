import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../providers/auth.service';
import { Router } from '@angular/router';
import { AnalyticsService } from '../providers/analytics.service';

@Component({
  selector: 'reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {

  form: FormGroup;
  working = false;
  sent = false;
  address: string | undefined;
  errorMessage: string | undefined;

  constructor(
    private auth: AuthService,
    private router: Router,
    private analytics: AnalyticsService) {

    this.form = new FormGroup({
      email: new FormControl('', Validators.compose([
        Validators.required
      ]))
    });
  }

  ngOnInit() {
  }

  onSubmit(result: any) {
    this.working      = true;
    this.sent         = false;
    this.errorMessage = undefined;

    this.auth.sendPasswordResetEmail(result.email)
    .then(_ => {
      this.errorMessage = undefined;
      this.sent         = true;
      this.address      = result.email;

      this.analytics.logEvent('resetPassword');
    })
    .catch(error => {
      this.errorMessage = error.message;
    })
    .finally(() => this.working = false);
  }

  onHomeClick() {
    this.router.navigateByUrl('/');
  }
}
