import { Component, OnInit } from '@angular/core';
import { Observable, from } from 'rxjs';
import { Contact } from 'shared/types';
import { ContactsService } from 'src/app/providers/contacts.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-edit-contact',
  templateUrl: './edit-contact.component.html',
  styleUrls: ['./edit-contact.component.scss']
})
export class EditContactComponent implements OnInit {

  contact$: Observable<Contact | undefined> | undefined;
  errorMessage: string | undefined;
  busy = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private contactsService: ContactsService) { }

  ngOnInit() {
    this.contact$ = this.route.paramMap.pipe(
      switchMap((params: ParamMap) => {
        const id = params.get('contactId');

        if (id) {
          return this.contactsService.getContact$(id);
        } else {
          return from([]);
        }
      })
    );
  }

  async saveContact(contact: Contact) {
    this.busy = true;
    this.errorMessage = undefined;

    try {
      await this.contactsService.updateContact(contact);

      this.router.navigateByUrl('/contacts');
    } catch (error) {
      this.errorMessage = error;
    } finally {
      this.busy = false;
    }
  }
}
