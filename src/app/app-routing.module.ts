import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AngularFireAuthGuard, redirectUnauthorizedTo, redirectLoggedInTo } from '@angular/fire/auth-guard';
import { HomeComponent } from './home/home.component';
import { RegisterComponent } from './register/register.component';
import { SignInComponent } from './sign-in/sign-in.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ReceiveComponent } from './receive/receive.component';
import { SendComponent } from './send/send.component';
import { ContactsComponent } from './contacts/contacts.component';
import { NewContactComponent } from './contacts/new-contact/new-contact.component';
import { EditContactComponent } from './contacts/edit-contact/edit-contact.component';
import { ContactDetailsComponent } from './contacts/contact-details/contact-details.component';
import { SetPinComponent } from './settings/set-pin/set-pin.component';
import { QrScannerComponent } from './qr-scanner/qr-scanner.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { SettingsComponent } from './settings/settings.component';
import { ResetPinComponent } from './settings/reset-pin/reset-pin.component';
import { TransactionDetailsComponent } from './transaction-details/transaction-details.component';
import { GeneralInfoComponent } from './general-info/general-info.component';
import { SetPinGuard } from './guards/set-pin-guard';

const redirectUnauthorizedToSignIn  = () => redirectUnauthorizedTo(['/signin']);
const redirectLoggedInToDashboard   = () => redirectLoggedInTo(['/dashboard']);

const routes: Routes = [
  {
    path:         'home',
    component:    HomeComponent,
    canActivate:  [AngularFireAuthGuard],
    data:         { authGuardPipe: redirectLoggedInToDashboard }
  },
  {
    path:         'register',
    component:    RegisterComponent,
    canActivate:  [AngularFireAuthGuard],
    data:         { authGuardPipe: redirectLoggedInToDashboard }
  },
  {
    path:         'signin',
    component:    SignInComponent,
    canActivate:  [AngularFireAuthGuard],
    data:         { authGuardPipe: redirectLoggedInToDashboard }
  },
  {
    path:         'settings/set-pin',
    component:    SetPinComponent,
    canActivate:  [AngularFireAuthGuard],
    data:         { authGuardPipe: redirectUnauthorizedToSignIn }
  },
  {
    path:         'settings/reset-pin',
    component:    ResetPinComponent,
    canActivate:  [AngularFireAuthGuard],
    data:         { authGuardPipe: redirectUnauthorizedToSignIn }
  },
  {
    path:         'resetpassword',
    component:    ResetPasswordComponent,
    canActivate:  [SetPinGuard]
  },
  {
    path:         'dashboard',
    component:    DashboardComponent,
    canActivate:  [AngularFireAuthGuard],
    data:         { authGuardPipe: redirectUnauthorizedToSignIn }
  },
  {
    path:         'info',
    component:    GeneralInfoComponent,
    canActivate:  [SetPinGuard]
  },
  {
    path:         'receive',
    component:    ReceiveComponent,
    canActivate:  [SetPinGuard]
  },
  {
    path:         'send/:address',
    component:    SendComponent,
    canActivate:  [SetPinGuard]
  },
  {
    path:         'scanner',
    component:    QrScannerComponent,
    canActivate:  [SetPinGuard]
  },
  {
    path:         'transaction-details',
    component:    TransactionDetailsComponent,
    canActivate:  [SetPinGuard]
  },
  {
    path:         'settings',
    component:    SettingsComponent,
    canActivate:  [SetPinGuard]
  },
  {
    path:         'contacts',
    component:    ContactsComponent,
    canActivate:  [SetPinGuard]
  },
  {
    path:         'contacts/new/:address',
    component:    NewContactComponent,
    canActivate:  [SetPinGuard]
  },
  {
    path:         'contacts/edit/:contactId',
    component:    EditContactComponent,
    canActivate:  [SetPinGuard]
  },
  {
    path:         'contacts/details/:contactId',
    component:    ContactDetailsComponent,
    canActivate:  [SetPinGuard]
  },
  {
    path:         '**',
    redirectTo:   '/home',
    pathMatch:    'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
