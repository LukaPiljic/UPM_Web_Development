import { Component } from '@angular/core';


// decorator/annotation has to be
@Component({
  selector: 'app-home', // this defines the <app-home> tag
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})

// it is empty, because the Home Page is static, does not have any buttons that run code
// just displays HTML text/imgs
export class HomeComponent {}
