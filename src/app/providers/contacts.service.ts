import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { switchMap } from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/firestore';
import { Contact } from 'shared/types';
import { from, Observable } from 'rxjs';
import { AngularFireFunctions } from '@angular/fire/functions';

@Injectable({
  providedIn: 'root'
})
export class ContactsService {

  constructor(
    private authService: AuthService,
    private firestore: AngularFirestore,
    private afFunctions: AngularFireFunctions) { }

  getContacts$(): Observable<Contact[]> {
    return this.authService.walletUser$.pipe(
      switchMap(user => {
        if (user) {
          return this.firestore.collection<Contact>(`users/${user.id}/contacts`).valueChanges();
        } else {
          return from([]);
        }
      })
    );
  }

  getContact$(contactId: string): Observable<Contact | undefined> {
    return this.authService.walletUser$.pipe(
      switchMap(user => {
        if (user) {
          return this.firestore.doc<Contact>(`users/${user.id}/contacts/${contactId}`).valueChanges();
        } else {
          return from([]);
        }
      })
    );
  }

  async createContact(name: string, address: string, email?: string): Promise<Contact> {
    return this.afFunctions.httpsCallable('addContact')({
      name: name,
      address: address,
      email: email
    }).toPromise();
  }

  async updateContact(contact: Contact): Promise<Contact> {
    return this.afFunctions.httpsCallable('updateContact')({
      contact: contact
    }).toPromise();
  }
}
