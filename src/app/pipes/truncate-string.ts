import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncateString',
  pure: true
})
export class TruncateString implements PipeTransform {

  transform(value: string, args?: any): string {
    return `${value.substr(0, 10)}........${value.substr(value.length - 10, value.length)}`;
  }
}
