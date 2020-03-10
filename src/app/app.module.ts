import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { MaterialModule } from './modules/material.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MainNavComponent } from './main-nav/main-nav.component';
import { LayoutModule } from '@angular/cdk/layout';
import { AuthService } from './providers/auth.service';
import { CurrencyMaskModule } from 'ng2-currency-mask';
import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireAnalyticsModule, ScreenTrackingService } from '@angular/fire/analytics';
import { environment } from 'src/environments/environment';
import { HomeComponent } from './home/home.component';
import { RegisterComponent } from './register/register.component';
import { SignInComponent } from './sign-in/sign-in.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DataService } from './providers/data.service';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AngularFireAuthGuard } from '@angular/fire/auth-guard';
import { AngularFireFunctionsModule } from '@angular/fire/functions';
import { TransactionHistoryComponent } from './transaction-history/transaction-history.component';
import { AccountSummaryComponent } from './account-summary/account-summary.component';
import { TruncateString } from './pipes/truncate-string';
import { TurtleAmountPipe } from './pipes/trtl-amount';
import { TransactionListItemComponent } from './transaction-list-item/transaction-list-item.component';
import { ReceiveComponent } from './receive/receive.component';
import { CopyStringBoxComponent } from './copy-string-box/copy-string-box.component';
import { ClipboardModule } from 'ngx-clipboard';
import { SendComponent } from './send/send.component';
import { AccountService } from './providers/account.service';
import { CurrencyMaskConfig, CURRENCY_MASK_CONFIG } from 'ng2-currency-mask/src/currency-mask.config';
import { ContactsComponent } from './contacts/contacts.component';
import { ContactsService } from './providers/contacts.service';
import { NewContactComponent } from './contacts/new-contact/new-contact.component';
import { EditContactComponent } from './contacts/edit-contact/edit-contact.component';
import { ContactDetailsComponent } from './contacts/contact-details/contact-details.component';
import { ContactListItemComponent } from './contacts/contact-list-item/contact-list-item.component';
import { EditContactFormComponent } from './contacts/edit-contact-form/edit-contact-form.component';
import { PinPromptComponent } from './pin-prompt/pin-prompt.component';
import { SetPinComponent } from './settings/set-pin/set-pin.component';
import { NgOtpInputModule } from 'ng-otp-input';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { QrScannerComponent } from './qr-scanner/qr-scanner.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { SettingsComponent } from './settings/settings.component';
import { ResetPinComponent } from './settings/reset-pin/reset-pin.component';
import { WorkingSpinnerComponent } from './working-spinner/working-spinner.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { TransactionDetailsComponent } from './transaction-details/transaction-details.component';
import { AnalyticsService } from './providers/analytics.service';

export const CustomCurrencyMaskConfig: CurrencyMaskConfig = {
  align: 'left',
  allowNegative: false,
  decimal: '.',
  precision: 2,
  prefix: '',
  suffix: '',
  thousands: ','
};

@NgModule({
  declarations: [
    AppComponent,
    MainNavComponent,
    HomeComponent,
    RegisterComponent,
    SignInComponent,
    DashboardComponent,
    TransactionHistoryComponent,
    AccountSummaryComponent,
    TruncateString,
    TurtleAmountPipe,
    TransactionListItemComponent,
    ReceiveComponent,
    CopyStringBoxComponent,
    SendComponent,
    ContactsComponent,
    NewContactComponent,
    EditContactComponent,
    ContactDetailsComponent,
    ContactListItemComponent,
    EditContactFormComponent,
    PinPromptComponent,
    SetPinComponent,
    QrScannerComponent,
    ResetPasswordComponent,
    SettingsComponent,
    ResetPinComponent,
    WorkingSpinnerComponent,
    TransactionDetailsComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAnalyticsModule,
    AngularFireFunctionsModule,
    AngularFireAuthModule,
    AngularFirestoreModule.enablePersistence(),
    MaterialModule,
    LayoutModule,
    ClipboardModule,
    CurrencyMaskModule,
    NgOtpInputModule,
    ZXingScannerModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })
  ],
  providers: [
    AngularFireAuthGuard,
    ScreenTrackingService,
    // UserTrackingService,
    AuthService,
    DataService,
    AccountService,
    ContactsService,
    AnalyticsService,
    { provide: CURRENCY_MASK_CONFIG, useValue: CustomCurrencyMaskConfig }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
