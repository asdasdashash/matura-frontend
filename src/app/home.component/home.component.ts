import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BalanceService } from '../balance.service';
import { AuthService } from '../auth.service';
import { NavbarComponent } from '../navbar.component/navbar.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ NavbarComponent, CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  constructor(
    public balanceService: BalanceService,
    public authService: AuthService,
    private router: Router
  ) {}
  
  get denar() {
    return this.balanceService.balance;
  }
  
  get isLoggedIn() {
    return this.authService.isLoggedIn();
  }
  
  navigateToGame(route: string) {
    if (!this.isLoggedIn) {
      alert('Please login to play games!');
      this.router.navigate(['/login']);
      return;
    }
    this.router.navigate([route]);
  }
}