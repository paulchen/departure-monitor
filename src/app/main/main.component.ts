import {Component} from '@angular/core';
import {SearchComponent} from '../search/search.component';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  imports: [
    SearchComponent
  ],
  styleUrls: ['./main.component.css']
})
export class MainComponent {
}
