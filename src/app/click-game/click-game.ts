import { HostListener, Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../navbar.component/navbar.component';
import { BalanceService } from '../balance.service';
import { ClickerService } from '../clicker.service';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-click-game',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: './click-game.html',
  styleUrls: ['./click-game.scss']
})
export class ClickGameComponent implements OnInit {
  sessionId: string = '';
  totalClicks: number = 0;
  totalEarned: number = 0;
  isPlaying: boolean = false;
  isProcessing: boolean = false;
  clickAnimation: boolean = false;
  lastClickTime: number = 0;
  cooldownRemaining: number = 0;
  
  get userId() {
    return this.authService.getCurrentUser()?.id || '';
  }
  
  constructor(
    public balanceService: BalanceService,
    private clickerService: ClickerService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}
  
  ngOnInit() {
    if (!this.userId) {
      alert('Please login first!');
      this.router.navigate(['/login']);
      return;
    }
    this.startSession();
  }

  @HostListener('document:keydown.enter')
handleEnterClick() {
  if (this.isPlaying && !this.isProcessing) {
    this.cashout()
  }
}


  
  startSession() {
    this.clickerService.startSession(this.userId).subscribe({
      next: (response) => {
        this.sessionId = response.sessionId;
        this.isPlaying = true;
        this.totalClicks = 0;
        this.totalEarned = 0;
      },
      error: (error) => {
        console.error('Error starting session:', error);
        alert('Failed to start game');
      }
    });
  }
  
  onCoinClick() {
  const now = Date.now();
  const timeSinceLastClick = now - this.lastClickTime;
  
  // Check if 0.5 seconds (500ms) has passed
  //if (timeSinceLastClick < 500 && this.lastClickTime > 0) {
    //this.cooldownRemaining = Math.ceil((500 - timeSinceLastClick) / 1000);
   // return;
  //}
  
  if (!this.isPlaying || this.isProcessing) return;
  
  this.isProcessing = true;
  this.lastClickTime = now;
  this.cooldownRemaining = 0;
  
  // Trigger animation
  this.clickAnimation = true;
  
  this.clickerService.registerClick(this.sessionId).subscribe({
    next: (response) => {
      this.totalClicks = response.totalClicks;
      this.totalEarned += response.earnedAmount;
      this.isProcessing = false;
      this.cdr.detectChanges();
      
      // Reset animation after it completes
      setTimeout(() => {
        this.clickAnimation = false;
        this.cdr.detectChanges();
      }, 300);
    },
    error: (error) => {
      console.error('Error registering click:', error);
      this.isProcessing = false;
      this.clickAnimation = false;
    }
  });
}
  
  cashout() {
    if (this.totalEarned === 0) {
      alert('You need to click at least once!');
      return;
    }
    
    this.clickerService.cashout(this.sessionId).subscribe({
      next: (response) => {
        this.balanceService.balance = response.newBalance;
        alert(`You earned ${response.earnedAmount} coins!`);
        this.isPlaying = false;
        this.router.navigate(['/']);
      },
      error: (error) => {
        console.error('Error cashing out:', error);
        alert('Failed to cashout');
      }
    });
  }
}