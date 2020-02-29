import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { DataService } from '../providers/data.service';
import { SubscriptionLike } from 'rxjs';
import { PriceQuote, PriceTrend, Account } from 'shared/types';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'account-summary',
  templateUrl: './account-summary.component.html',
  styleUrls: ['./account-summary.component.scss']
})
export class AccountSummaryComponent implements OnInit, OnDestroy {

  @Input() account: Account | undefined;

  price: PriceQuote | undefined;
  priceSub: SubscriptionLike | undefined;

  trend1h: PriceTrend = 'flat';
  trend24h: PriceTrend = 'flat';
  trend7d: PriceTrend = 'flat';

  constructor(private dataService: DataService) { }

  ngOnInit() {
    this.priceSub = this.dataService.getPriceInfo$().subscribe(quote => {
      this.price = quote;

      if (quote) {
        this.trend1h  = this.getTrend(quote.percent_change_1h);
        this.trend24h = this.getTrend(quote.percent_change_24h);
        this.trend7d  = this.getTrend(quote.percent_change_7d);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.priceSub) {
      this.priceSub.unsubscribe();
    }
  }

  getTrend(changePercent: number): PriceTrend {
    if (changePercent > 0) {
      return 'up';
    }
    if (changePercent < 0) {
      return 'down';
    }

    return 'flat';
  }
}
