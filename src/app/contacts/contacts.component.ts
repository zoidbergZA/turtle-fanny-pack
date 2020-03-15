import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ContactsService } from '../providers/contacts.service';
import { Observable } from 'rxjs';
import { Contact } from 'shared/types';

@Component({
  selector: 'contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.scss']
})
export class ContactsComponent implements OnInit {

  contacts$: Observable<Contact[]>;

  constructor(private router: Router, private contactsService: ContactsService) {
    this.contacts$ = this.contactsService.getContacts$();
  }

  ngOnInit() {
  }

  onAddContactClick() {
    this.router.navigateByUrl('/contacts/new/');
  }

  onContactSelected(contact: Contact) {
    this.router.navigateByUrl(`/contacts/details/${contact.id}`);
  }
}
