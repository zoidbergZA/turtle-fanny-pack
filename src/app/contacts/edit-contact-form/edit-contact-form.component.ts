import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Contact } from 'shared/types';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'edit-contact-form',
  templateUrl: './edit-contact-form.component.html',
  styleUrls: ['./edit-contact-form.component.scss']
})
export class EditContactFormComponent implements OnInit {

  @Input() contact: Contact | undefined;
  @Output() done = new EventEmitter<Contact>();

  form: FormGroup;
  working = false;
  errorMessage: string | undefined;

  constructor() {
    this.form = new FormGroup({
      name: new FormControl('', Validators.compose([
        Validators.required
      ])),
      address: new FormControl('', Validators.compose([
        Validators.required
      ])),
      email: new FormControl('')
    });
  }

  ngOnInit() {
    if (this.contact) {
      this.form.controls.name.setValue(this.contact.name);
      this.form.controls.address.setValue(this.contact.address);

      if (this.contact.email) {
        this.form.controls.email.setValue(this.contact.email);
      }
    }
  }

  onSubmit(result: any) {
    if (!this.contact) {
      return;
    }

    this.contact.name = result.name;
    this.contact.address = result.address;
    this.contact.email = result.email;

    this.done.emit(this.contact);
  }
}
