import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../providers/auth.service';
import { Router } from '@angular/router';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  termsForm: FormGroup;
  termsAgreed = false;

  form: FormGroup;
  status$: Subject<string> = new Subject<string>();
  working = false;
  continue: string | undefined;

  constructor(private auth: AuthService, private router: Router) {
    this.termsForm = new FormGroup({
      term1: new FormControl(false, Validators.required),
      term2: new FormControl(false, Validators.required),
      term3: new FormControl(false, Validators.required),
      term4: new FormControl(false, Validators.required),
    });

    this.form = new FormGroup({
      email: new FormControl('', Validators.compose([Validators.required])),
      password: new FormControl('', Validators.compose([Validators.required])),
      confirmPassword: new FormControl('', Validators.compose([Validators.required]))
    });
  }

  ngOnInit() {
  }

  checkPasswordMatch(): boolean {
    return this.form.controls.password.value === this.form.controls.confirmPassword.value;
  }

  onAgree() {
    this.termsAgreed = true;
  }

  onSubmit(result: any) {
    const self = this;
    this.working = true;
    const statusStream = this.status$;
    statusStream.next('');

    this.auth.createUserWithEmailAndPassword(result.email, result.password)
    .then(_ => {
      self.working = false;
      this.router.navigate(['/dashboard']);
      console.log('successful sign-in');
    })
    .catch(err => {
      self.working = false;
      statusStream.next(`error creating account: ${err.message}`);
    });
  }
}
