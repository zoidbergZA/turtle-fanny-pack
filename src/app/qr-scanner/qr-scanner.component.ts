import { Component, OnInit, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'qr-scanner',
  templateUrl: './qr-scanner.component.html',
  styleUrls: ['./qr-scanner.component.scss']
})
export class QrScannerComponent implements OnInit, OnDestroy {

  readonly trtlPrefix = 'turtlecoin://';

  scannerEnabled = true;

  constructor(
    private location: Location,
    private router: Router) { }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.scannerEnabled = false;
  }

  scanSuccessHandler(scanData: string) {
    if (scanData.startsWith('TRTL')) {
      this.scannerEnabled = false;
      this.router.navigateByUrl(`send/${scanData}`);
    } else if (scanData.startsWith(this.trtlPrefix)) {
      const [address, queryParams] = this.getTurtlecoinQrData(scanData);

      if (address) {
        this.router.navigateByUrl(`send/${address}`, { queryParams: queryParams });
      }
    }
  }

  onCancelClick() {
    this.scannerEnabled = false;
    this.location.back();
  }

  private getTurtlecoinQrData(scanData: string): [string | undefined, any] {
    const trtlParams: any = {};

    const base      = scanData.substring(this.trtlPrefix.length);
    const segments  = base.split('?');
    const address   = segments[0];

    if (segments.length === 1) {
      return [address, trtlParams];
    }

    const queryString = base.substring(address.length + 1);
    const queryparams = new URLSearchParams(queryString);

    if (queryparams.has('name')) {
      trtlParams.name = queryparams.get('name');
    }

    if (queryparams.has('amount')) {
      trtlParams.name = queryparams.get('amount');
    }

    if (queryparams.has('paymentid')) {
      trtlParams.name = queryparams.get('paymentid');
    }

    return [address, queryparams];
  }
}
