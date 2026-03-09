import { Component } from '@angular/core';
import { BalanceService } from '../balance.service';
import { AuthService } from '../auth.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, CommonModule],
  standalone: true,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  dropdownOpen = false;  // ADD THIS

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
  
  get currentUser() {
    return this.authService.getCurrentUser();
  }
  
  toggleDropdown() {  // ADD THIS
    this.dropdownOpen = !this.dropdownOpen;
  }
  
  logout() {
    this.dropdownOpen = false;  // ADD THIS
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}