import { Component, OnInit, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'qr-scanner',
  templateUrl: './qr-scanner.component.html',
  styleUrls: ['./qr-scanner.component.scss']
})
export class QrScannerComponent implements OnInit, OnDestroy {

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
    }
  }

  onCancelClick() {
    this.scannerEnabled = false;
    this.location.back();
  }
}
