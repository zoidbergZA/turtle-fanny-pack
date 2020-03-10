import { Component, OnInit } from '@angular/core';
import { Contact } from 'shared/types';
import { ContactsService } from 'src/app/providers/contacts.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-new-contact',
  templateUrl: './new-contact.component.html',
  styleUrls: ['./new-contact.component.scss']
})
export class NewContactComponent implements OnInit {

  errorMessage: string | undefined;
  contact: Contact;
  busy = false;

  constructor(
    private route: ActivatedRoute,
    private contactsService: ContactsService,
    private router: Router) {

      this.contact = {
      id: '',
      name: '',
      address: '',
      createdDate: 0
    };
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const address = params.get('address');

      if (address) {
        this.contact.address = address;
      }
    });
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
