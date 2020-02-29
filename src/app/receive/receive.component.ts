import { Component, OnInit } from '@angular/core';
import { DataService } from '../providers/data.service';
import { Observable } from 'rxjs';
import { Account } from 'shared/types';

@Component({
  selector: 'app-receive',
  templateUrl: './receive.component.html',
  styleUrls: ['./receive.component.scss']
})
export class ReceiveComponent implements OnInit {

  account$ = this.dataService.getAccount$();

  constructor(private dataService: DataService) { }

  ngOnInit() {
  }
}
