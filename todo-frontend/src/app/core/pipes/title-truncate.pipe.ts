import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'titleTruncate',
  standalone: true
})
export class TitleTruncatePipe implements PipeTransform {
  transform(value: string, maxLength: number = 50): { displayText: string, isTruncated: boolean, fullText: string } {
    if (!value) return { displayText: '', isTruncated: false, fullText: '' };
    
    if (value.length <= maxLength) {
      return { displayText: value, isTruncated: false, fullText: value };
    }
    
    const truncated = value.substr(0, maxLength);
    const lastSpaceIndex = truncated.lastIndexOf(' ');
    
    let displayText: string;
    
    if (lastSpaceIndex > 0 && lastSpaceIndex > maxLength * 0.7) {
      displayText = truncated.substr(0, lastSpaceIndex) + '...';
    } else {
      displayText = truncated + '...';
    }
    
    return { displayText, isTruncated: true, fullText: value };
  }
}