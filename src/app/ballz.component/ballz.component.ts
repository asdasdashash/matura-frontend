// ballz.component.ts
import { Component, HostListener, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { BalanceService } from '../balance.service';
import { BalloonService } from '../balloon.service';
import { NavbarComponent } from '../navbar.component/navbar.component';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-ballz.component',
  standalone: true,
  imports: [FormsModule, CommonModule, NavbarComponent],
  templateUrl: './ballz.component.html',
  styleUrl: './ballz.component.scss'
})
export class BallzComponent {
  multiplier: number = 1.5;
  gameStart: boolean = false;
  gameOver: boolean = true;
  betAmount: number = 10;
  potentialWinnings: number = 0;
  balloonScale: number = 1;
  currentMultiplier: number = 1; 
  balloonRedProgress: number = 0;
  gameResult: string = "Won.";
  sessionId: string = '';
  isProcessing: boolean = false;

  get userId() {
    return this.authService.getCurrentUser()?.id || '';
  }
  
  @ViewChild('balloon') balloon!: ElementRef;
  
  constructor(
    public balanceService: BalanceService,
    private balloonService: BalloonService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  @HostListener('document:keydown.enter')
handleEnter() {
  if (this.gameOver && !this.isProcessing) {
    // Start game when menu is open
    this.startGame();
  } else if (this.gameStart && !this.isProcessing && this.currentMultiplier > 1) {
    // Cash out during game
    this.cashoutFun();
  }
}
  
  get denar() {
    return this.balanceService.balance;
  }
  
  loadBalance() {
    if (!this.userId) return;
    
    this.balloonService.getBalance(this.userId).subscribe({
      next: (response) => {
        this.balanceService.balance = response.balance;
      },
      error: (error) => {
        console.error('Error loading balance:', error);
      }
    });
  }
  
  resetBallon() {
    this.balloonScale = 1;
    this.balloon.nativeElement.style.backgroundColor = '';
    this.balloon.nativeElement.style.background = 'radial-gradient(circle at 30% 30%, #ff6b6b, #ee5a5a 50%, #d63031)';
    this.balloon.nativeElement.style.transform = `scale(${this.balloonScale})`;
    this.currentMultiplier = 1;
    this.balloonRedProgress = 0;
  }
  
  moreRed() {
    // Make balloon more red/darker as it inflates
    const progress = Math.min(1, this.balloonRedProgress);
    const startColor = { r: 255, g: 107, b: 107 }; // #ff6b6b
    const endColor = { r: 139, g: 0, b: 0 }; // dark red
    
    const r = Math.round(startColor.r - (startColor.r - endColor.r) * progress);
    const g = Math.round(startColor.g - (startColor.g - endColor.g) * progress);
    const b = Math.round(startColor.b - (startColor.b - endColor.b) * progress);
    
    this.balloon.nativeElement.style.background = `radial-gradient(circle at 30% 30%, rgb(${r}, ${g}, ${b}), rgb(${r-20}, ${g-20}, ${b-20}) 50%, rgb(${r-40}, ${g-40}, ${b-40}))`;
  }
  
  ballClick() {
  if (!this.gameStart || this.isProcessing) {
    return;
  }
  
  // Add pump animation
  const pumpEl = document.querySelector('.pump');
  if (pumpEl) {
    pumpEl.classList.add('pumping');
    setTimeout(() => pumpEl.classList.remove('pumping'), 800);
  }
  
  this.isProcessing = true;
  
  // Call server-side pump
  this.balloonService.pump(this.sessionId).subscribe({
    next: (response) => {
      if (response.popped) {
        // Balloon popped - END GAME IMMEDIATELY
        this.balloon.nativeElement.style.transform = `scale(0)`;
        this.gameResult = "Lost.";
        this.gameStart = false;
        this.gameOver = false;
        this.isProcessing = false;
        
        // Force change detection to update the view immediately
        this.cdr.detectChanges();
      } else {
        // Successful pump - UPDATE IMMEDIATELY
        this.currentMultiplier = response.currentMultiplier;
        this.potentialWinnings = response.potentialWinnings;
        this.balloonScale += 0.1;
        
        // Cap balloon scale at 2.5x
        // Cap balloon scale at 2x
        this.balloonScale = Math.min(this.balloonScale, 1.8);
        
        this.balloonRedProgress = Math.min(1, this.balloonRedProgress + 0.15);
        this.balloon.nativeElement.style.transform = `scale(${this.balloonScale})`;
        this.moreRed();
        this.gameResult = "Won.";
        this.isProcessing = false;
        
        // Force change detection to update the multiplier display
        this.cdr.detectChanges();
      }
    },
    error: (error) => {
      console.error('Error pumping balloon:', error);
      alert(error.error?.error || 'An error occurred');
      this.gameStart = false;
      this.gameOver = true;
      this.isProcessing = false;
      this.cdr.detectChanges();
    }
  });
}
  
  startGame() {
    if (!this.userId) {
      alert('Please login first!');
      return;
    }
    
    if (this.betAmount > this.denar) {
      alert('Not enough money!');
      return;
    }

    if (this.betAmount < 0.01) {
      alert('Minimum bet is 0.01');
      return;
    }
    
    // Call server to start game
    this.balloonService.startGame(this.userId, this.betAmount, this.multiplier).subscribe({
      next: (response) => {
        this.sessionId = response.sessionId;
        this.potentialWinnings = response.potentialWinnings;
        this.currentMultiplier = response.currentMultiplier;
        this.balanceService.balance = response.newBalance;
        this.gameOver = false;
        this.gameStart = true;
        
        // Force change detection to close menu and start game immediately
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error starting game:', error);
        alert(error.error?.error || 'An error occurred');
      }
    });
  }
  
  tryAgain() {
    this.gameOver = true;
    this.resetBallon();
  }
  
  cashoutFun() {
    if (this.currentMultiplier <= 1 || this.isProcessing || !this.gameStart) {
      return;
    }
    
    this.isProcessing = true;
    
    this.balloonService.cashout(this.sessionId).subscribe({
      next: (response) => {
        this.balanceService.balance = response.newBalance;
        this.gameStart = false;
        this.gameOver = false;
        this.isProcessing = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error cashing out:', error);
        alert(error.error?.error || 'An error occurred');
        this.isProcessing = false;
      }
    });
  }
}