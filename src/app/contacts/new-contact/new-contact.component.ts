import { Component, OnInit } from '@angular/core';
import { Contact } from 'shared/types';
import { ContactsService } from 'src/app/providers/contacts.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-new-contact',
  templateUrl: './new-contact.component.html',
  styleUrls: ['./new-contact.component.scss']
})
export class NewContactComponent implements OnInit {

  errorMessage: string | undefined;
  contact: Contact;
  busy = false;

  constructor(private contactsService: ContactsService, private router: Router) {
    this.contact = {
      id: '',
      name: '',
      address: '',
      createdDate: 0
    };
  }

  ngOnInit() {
  }

  async createContact(contact: Contact) {
    this.contact = contact;
    this.busy = true;
    this.errorMessage = undefined;

    try {
      await this.contactsService.createContact(contact.name, contact.address, contact.email);
      this.busy = false;
      this.router.navigateByUrl('/contacts');
    } catch (error) {
      this.errorMessage = error.message;
      this.busy = false;
    }
  }
}
