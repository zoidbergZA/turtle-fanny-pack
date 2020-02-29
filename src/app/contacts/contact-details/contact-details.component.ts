import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { Observable, from } from 'rxjs';
import { Contact } from 'shared/types';
import { ContactsService } from 'src/app/providers/contacts.service';

@Component({
  selector: 'contact-details',
  templateUrl: './contact-details.component.html',
  styleUrls: ['./contact-details.component.scss']
})
export class ContactDetailsComponent implements OnInit {

  contact$: Observable<Contact | undefined> | undefined;

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

  editClick(id: string) {
    this.router.navigateByUrl(`contacts/edit/${id}`);
  }

  sendClick(address: string) {
    this.router.navigateByUrl(`send/${address}`);
  }
}
