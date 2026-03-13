import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BalanceService } from '../balance.service';
import { AuthService } from '../auth.service';
import { NavbarComponent } from '../navbar.component/navbar.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NavbarComponent, CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  leaderboard: any[] = [];

  constructor(
    public balanceService: BalanceService,
    public authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef  // ADD THIS
  ) {
    this.loadLeaderboard();
  }

  ngOnInit() {
    console.log('HomeComponent initialized');
    this.loadLeaderboard();
  }

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

  loadLeaderboard() {
    console.log('Loading leaderboard...');
    this.balanceService.getLeaderboard().subscribe({
      next: (response: any) => {
        console.log('Leaderboard loaded:', response);
        this.leaderboard = response.leaderboard;
        this.cdr.detectChanges();  // ADD THIS - Force Angular to update the view
      },
      error: (error: any) => {
        console.error('Error loading leaderboard:', error);
      }
    });
  }
}