import { Component, ChangeDetectorRef, ViewChild, ElementRef, HostListener } from '@angular/core';
import { BalanceService } from '../balance.service';
import { CardgameService } from '../cardgame.service';
import { BalloonService } from '../balloon.service';
import { AuthService } from '../auth.service';
import { CommonModule } from '@angular/common';
import { Card } from '../models/card.interface';
import { NavbarComponent } from '../navbar.component/navbar.component';
import { FormsModule } from '@angular/forms';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-card.game.component',
  imports: [NavbarComponent, CommonModule, FormsModule],
  templateUrl: './card.game.component.html',
  styleUrl: './card.game.component.scss',
})
export class CardGameComponent {
  get userId() {
    return this.authService.getCurrentUser()?.id || '';
  }
  private pendingBalanceUpdate: number = 0;
  sessionId: string = '';
  cardsApiUrl = environment.production 
  ? 'https://api.tinzer.si'
  : 'http://localhost:3000';

  betAmount: number = 15;
  potentialWinnings: number = 0;
  gameStart: boolean = false;
  gameOver: boolean = true;
  betComplete: boolean = false;
  gameResult: string = "";
  clickedCount: number = 0;
  plCardValue: number = 0;
  opCardValue: number = 0;
  currentPlayerScore: number = 0;
  currentdealerScore: number = 0;
  plWon: number = 0;
  drawnCards: Card[] = [];
  isProcessing: boolean = false;

  @ViewChild('balloon') balloon!: ElementRef;

  

  constructor(
  public balanceService: BalanceService,
  private cardgameService: CardgameService,
  private balloonService: BalloonService,
  private authService: AuthService,
  private cdr: ChangeDetectorRef
  
) {
  console.log('CardGame Constructor - Initial balance:', this.balanceService.balance);
  console.log('CardGame Constructor - Current user:', this.authService.getCurrentUser());
  
  this.balanceService.refreshBalance();
  
  // Check balance after a short delay
  setTimeout(() => {
    console.log('After refreshBalance - Balance:', this.balanceService.balance);
  }, 500);
}
@HostListener('document:keydown.enter')
handleEnter() {
  if (!this.betComplete && !this.isProcessing) {
    // Placing bet
    this.completeBet();
  } else if (this.betComplete && !this.gameStart && !this.isProcessing) {
    // Revealing cards
    this.revealCards();
  }
}
  get denar() {
    return this.balanceService.balance;
  }

  resetGame() {
    this.gameStart = false;
    this.betComplete = false;
    this.gameOver = true;
    this.clickedCount = 0;
    this.plCardValue = 0;
    this.opCardValue = 0;
    this.currentPlayerScore = 0;
    this.currentdealerScore = 0;
    this.plWon = 0;
    this.drawnCards = [];
    this.cdr.detectChanges();
  }

  cardClick(card: Card, index: number) {
    if (!this.betComplete || this.isProcessing) return;

    if (card.clicked == false || card.clicked == undefined) {
      if (this.clickedCount == 3) {
        return;
      }
      this.clickedCount++;
      card.clicked = true;
    } else {
      card.clicked = false;
      this.clickedCount--;
    }
  }

  completeBet() {
    if (this.betAmount > this.denar) {
      alert("Not enough money!");
      return;
    }

    if (this.betAmount < 0.01) {
      alert('Minimum bet is 0.01');
      return;
    }

    this.isProcessing = true;

    this.cardgameService.startGame(this.userId, this.betAmount).subscribe({
      next: (response: any) => {
        this.sessionId = response.sessionId;
        this.drawnCards = response.cards;
        
        // Update balance using setBalance
        this.balanceService.setBalance(response.newBalance);
        
        this.betComplete = true;
        this.isProcessing = false;
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Error starting game:', error);
        alert(error.error?.error || 'An error occurred');
        this.isProcessing = false;
      }
    });
  }

  revealCards() {
  if (this.clickedCount < 3) {
    alert("Selected less than 3 cards");
    return;
  }

  this.isProcessing = true;

  const selectedIndices: number[] = [];
  this.drawnCards.forEach((card, index) => {
    if (card.clicked) {
      selectedIndices.push(index);
    }
  });

  this.cardgameService.revealCards(this.sessionId, selectedIndices).subscribe({
    next: (response: any) => {
      let playerIndex = 0;
      let dealerIndex = 0;
      
      this.drawnCards = response.cards.map((card: Card, index: number) => {
        const isPlayer = selectedIndices.includes(index);
        return {
          ...card,
          isPlayerCard: isPlayer,
          playerCardIndex: isPlayer ? playerIndex++ : undefined,
          dealerCardIndex: !isPlayer ? dealerIndex++ : undefined,
          revealed: !isPlayer  // Auto-reveal dealer cards
        };
      });
      
      this.gameResult = response.gameResult;
      // Use server's calculated values (already includes golden 2x)
      this.plCardValue = response.plCardValue;
      this.opCardValue = response.opCardValue;
      this.potentialWinnings = response.winAmount;
      
      // STORE the final balance but DON'T update yet
      this.pendingBalanceUpdate = response.newBalance;
      
      // Set scores directly from server
      this.currentPlayerScore = 0;
      this.currentdealerScore = response.opCardValue;
      
      this.cdr.detectChanges();
      
      setTimeout(() => {
        this.gameStart = true;
        this.isProcessing = false;
        this.cdr.detectChanges();
      }, 1000);
    },
    error: (error: any) => {
      console.error('Error revealing cards:', error);
      alert(error.error?.error || 'An error occurred');
      this.isProcessing = false;
    }
  });
}

flipPlayerCard(card: Card) {
  if (!this.gameStart || !card.isPlayerCard || card.revealed) return;
  
  card.revealed = true;
  // Add actual card value (golden cards count as 2x)
  const cardValue = card.isGolden ? card.cardValue * 2 : card.cardValue;
  this.currentPlayerScore += cardValue;
  this.cdr.detectChanges();
  
  const allRevealed = this.drawnCards
    .filter(c => c.isPlayerCard)
    .every(c => c.revealed);
  
  if (allRevealed) {
    // NOW update the balance after all cards are flipped
    setTimeout(() => {
      this.balanceService.setBalance(this.pendingBalanceUpdate);
      this.gameOver = false;
      this.cdr.detectChanges();
    }, 500);
  }
}
}
