import { Component, ChangeDetectionStrategy } from '@angular/core';
import {RouterOutlet} from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [
    RouterOutlet
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'departure-monitor';
}
