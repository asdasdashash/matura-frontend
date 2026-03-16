import { Component, ViewChildren, QueryList, ElementRef, ChangeDetectorRef, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BalanceService } from '../balance.service';
import { MinesService } from '../mines.service';
import { BalloonService } from '../balloon.service';
import { NavbarComponent } from "../navbar.component/navbar.component";
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-mines',
  standalone: true,
  imports: [FormsModule, NavbarComponent],
  templateUrl: './mines.component.html',
  styleUrls: ['./mines.component.scss']
})
export class MinesComponent {
  @ViewChildren('cell') cells!: QueryList<ElementRef>;
  
  get userId() {
    return this.authService.getCurrentUser()?.id || '';
  }
  sessionId: string = '';
  betAmount: number = 10;
  mineMenuOpen = true;
  cashoutWindow = false;
  gameLocked = true;
  stevecMin: number = 0;
  minePositions: Set<number> = new Set();
  mineNum: number = 5;
  currentMultiplier: number = 1.0;
  showLostMessage: boolean = false;
  isProcessing: boolean = false;
  gameOver: boolean = true;
  gameResult: string = "Won.";

  constructor(
  public balanceService: BalanceService,
  private minesService: MinesService,
  private balloonService: BalloonService,
  private authService: AuthService, // <--- ADD THIS
  private cdr: ChangeDetectorRef
) {
  // You don't need loadBalance() here if your 
  // BalanceService handles it like in the Card Game.
}


@HostListener('document:keydown.enter')
handleEnter() {
  if (this.mineMenuOpen && !this.isProcessing) {
    this.confirmMines();
  }
}

  get denar() {
    return this.balanceService.balance;
  }

  loadBalance() {
    this.balloonService.getBalance(this.userId).subscribe({
      next: (response: any) => {
        this.balanceService.balance = response.balance;
      },
      error: (error: any) => {
        console.error('Error loading balance:', error);
      }
    });
  }

  getPotentialWinnings(): number {
  return Math.round(this.betAmount * this.currentMultiplier * 100) / 100;
}
  showMines() {
  for (let i = 1; i <= 25; i++) {
    const cellArray = this.cells.toArray();
    const cell = cellArray[i - 1].nativeElement;
    if (this.minePositions.has(i)) {
      cell.textContent = '💥';
    } else if (!cell.textContent) {
      cell.textContent = '💎';
    }
  }
}

  confirmMines() {
  // 1. Basic Validations
  if (this.mineNum > 24 || this.mineNum < 1) {
    alert('Mine count must be between 1 and 24');
    return;
  }
  
  if (this.betAmount > this.denar) {
    alert('Not enough money!');
    return;
  }

  if (!this.userId) {
    alert('Please log in to play');
    return;
  }

  if (this.betAmount < 0.01) {
    alert('Minimum bet is 0.01');
    return;
  }

  this.isProcessing = true;

  // 2. Call server to start game with the REAL userId
  this.minesService.startGame(this.userId, this.betAmount, this.mineNum).subscribe({
    next: (response: any) => {
      // Set the session received from backend
      this.sessionId = response.sessionId;
      this.currentMultiplier = response.currentMultiplier;
      
      // Update the shared balance service with the balance after the bet
      this.balanceService.balance = response.newBalance;
      
      // Reset UI state for a new round
      this.minePositions.clear();
      this.mineMenuOpen = false;
      this.cashoutWindow = true;
      this.gameLocked = false;
      this.showLostMessage = false;
      this.gameOver = true;
      this.stevecMin = 0;
      
      // Clear the grid colors AND content from the previous game
      this.cells.forEach(c => {
        const el = c.nativeElement;
        el.style.backgroundColor = "";
        el.textContent = "";
        el.className = "";  // Clear all classes
      });
      
      this.isProcessing = false;
      this.cdr.detectChanges();
    },
    error: (error: any) => {
      console.error('Error starting mines game:', error);
      alert(error.error?.error || 'Failed to connect to server');
      this.isProcessing = false;
    }
  });
}

  checkForMine(id: number) {
  const cellArray = this.cells.toArray();
  const cell = cellArray[id - 1].nativeElement;
  
  if (this.gameLocked || this.isProcessing) return;
  if (cell.style.backgroundColor) return;

  this.isProcessing = true;
  
  // Add click animation
  cell.classList.add('clicking');

  this.minesService.revealCell(this.sessionId, id).subscribe({
    next: (response: any) => {
      // Remove click animation
      cell.classList.remove('clicking');
      
      if (response.isMine) {
        cell.classList.add('mine-explode');
        
        // Delay explosion emoji to sync with animation
        setTimeout(() => {
          cell.textContent = '💥';
          cell.classList.add('explosion-appear');
          this.cdr.detectChanges();
        }, 100);
        
        this.stevecMin = 0;
        
        response.minePositions.forEach((pos: number) => {
          this.minePositions.add(pos);
        });
        
        this.cashoutWindow = false;
        this.gameLocked = true;
        this.showLostMessage = true;
        this.gameResult = "Lost.";
        
        // Delay showing ALL mines AND game over screen at the same time
        setTimeout(() => {
          this.showMines();
          this.gameOver = false;
          this.isProcessing = false;
          this.cdr.detectChanges();
        }, 800);
      } 
      else {
     // shrink the tile first
        cell.classList.add('clicking');

        setTimeout(() => {
        cell.classList.remove('clicking');

        // hide the tile background
        cell.classList.add('cell-hidden');

        // show diamond
        cell.textContent = '💎';
        cell.classList.add('diamond-appear');

        this.cdr.detectChanges();
        }, 250);

  this.stevecMin = response.safeCellsRevealed; 
  this.currentMultiplier = response.currentMultiplier; 
  this.isProcessing = false;
}
      
      this.cdr.detectChanges();
    },
    error: (error: any) => {
      console.error('Error revealing cell:', error);
      cell.classList.remove('clicking');
      this.isProcessing = false;
    }
  });
}

  tryAgain() {
    this.gameOver = true;
    this.mineMenuOpen = true;
    this.minePositions.clear();
    this.stevecMin = 0;
    this.currentMultiplier = 1.0;
    this.showLostMessage = false;
  
    // Clear grid
    this.cells.forEach(c => {
      const el = c.nativeElement;
      el.style.backgroundColor = "";
      el.textContent = "";
      el.className = "";
  });
  
  this.cdr.detectChanges();
}

  cashoutFun() {
  if (this.stevecMin === 0 || this.isProcessing) return;

  this.isProcessing = true;

  // Call server to cashout
  this.minesService.cashout(this.sessionId).subscribe({
    next: (response: any) => {
      this.balanceService.balance = response.newBalance;
      this.gameResult = "Won.";
      
      // Show all mines
      response.minePositions.forEach((pos: number) => {
        this.minePositions.add(pos);
      });
      this.showMines();
      
      this.gameLocked = true;
      this.cashoutWindow = false;
      this.showLostMessage = false;
      this.gameOver = false;
      this.isProcessing = false;
      this.cdr.detectChanges();
    },
    error: (error: any) => {
      console.error('Error cashing out:', error);
      alert(error.error?.error || 'An error occurred');
      this.isProcessing = false;
    }
  });
}
}
