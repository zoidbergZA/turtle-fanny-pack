import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../providers/auth.service';
import { Router } from '@angular/router';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent implements OnInit {

  form: FormGroup;
  working = false;
  errorMessage: string | undefined;

  constructor(private router: Router, private auth: AuthService) {
    this.form = new FormGroup({
      email: new FormControl('', Validators.compose([
        Validators.required
      ])),
      password: new FormControl('', Validators.compose([
        Validators.required
      ]))
    });
  }

  ngOnInit() {
  }

  onSubmit(result: any) {
    this.working = true;
    this.errorMessage = undefined;

    this.auth.signInWithEmailAndPassword(result.email, result.password)
    .then(_ => {
      this.errorMessage = undefined;
      this.router.navigate(['/dashboard']);
    })
    .catch(error => {
      this.errorMessage = error.message;
    })
    .finally(() => this.working = false);
  }

  lostPasswordClick() {
    this.router.navigateByUrl('/resetpassword');
  }

  registerClick() {
    this.router.navigate(['/register']);
  }
}
