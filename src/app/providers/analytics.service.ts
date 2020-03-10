import { Injectable } from '@angular/core';
import { AngularFireAnalytics } from '@angular/fire/analytics';

export type AnalyticsEventName = 'preparedTx' | 'sentTx';

@Injectable({
  providedIn: 'root'
})

export class AnalyticsService {

  constructor(private analytics: AngularFireAnalytics) { }

  logEvent(eventName: AnalyticsEventName, eventParams?: any) {
    this.analytics.logEvent(eventName, eventParams);
  }
}
