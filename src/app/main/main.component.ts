import {Component, ChangeDetectionStrategy} from '@angular/core';
import {SearchComponent} from '../search/search.component';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  imports: [
    SearchComponent
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./main.component.css']
})
export class MainComponent {
}
