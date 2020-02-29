import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Contact } from 'shared/types';

@Component({
  selector: 'contact-list-item',
  templateUrl: './contact-list-item.component.html',
  styleUrls: ['./contact-list-item.component.scss']
})
export class ContactListItemComponent implements OnInit {

  @Input() contact: Contact | undefined;
  @Output() selected = new EventEmitter<Contact>();

  constructor() { }

  ngOnInit() {
  }

  onClick() {
    if (this.contact)
    {
      this.selected.emit(this.contact);
    }
  }
}
