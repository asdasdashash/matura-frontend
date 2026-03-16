import { Component, HostListener } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: '<router-outlet></router-outlet>',
  styles: ['']  // Changed from styleUrls
})
export class App {
  title = 'matura';

  constructor(private router: Router) {}

  @HostListener('document:keydown.escape')  // Removed ['$event']
  handleEscape() {  // Removed event parameter
    // Go to homepage when ESC is pressed
    this.router.navigate(['/']);
  }
}