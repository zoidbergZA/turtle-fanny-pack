import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'pin-prompt',
  templateUrl: './pin-prompt.component.html',
  styleUrls: ['./pin-prompt.component.scss']
})
export class PinPromptComponent implements OnInit {

  @Input() title: string | undefined;
  @Output() pin = new EventEmitter<string>();

  config = {
    length: 6,
    allowNumbersOnly: true,
    isPasswordInput: true
  };

  constructor() { }

  ngOnInit() {
  }

  onOtpChange(pin: string) {
    if (pin.length === 6) {
      this.pin.emit(pin);
    }
  }
}
