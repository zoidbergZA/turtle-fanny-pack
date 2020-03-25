import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'working-spinner',
  templateUrl: './working-spinner.component.html',
  styleUrls: ['./working-spinner.component.scss']
})
export class WorkingSpinnerComponent implements OnInit {

  @Input() title: string | undefined;

  constructor() { }

  ngOnInit() {
  }
}
