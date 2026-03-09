import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class BalanceService {
  balance: number = 0;
  
  constructor(
    private authService: AuthService,
    private http: HttpClient
  ) {
    // Subscribe to user changes and update balance
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        // Use the balance from the user object
        this.balance = user.balance;
      } else {
        this.balance = 0;
      }
    });
  }
  
  private fetchBalance(userId: string) {
    this.http.get<{ balance: number }>(`http://localhost:3000/api/balance/${userId}`)
      .subscribe({
        next: (response) => {
          this.balance = response.balance;
          
          // Update the user object in localStorage
          const currentUser = this.authService.getCurrentUser();
          if (currentUser) {
            currentUser.balance = response.balance;
            localStorage.setItem('user', JSON.stringify(currentUser));
          }
        },
        error: (error) => {
          console.error('Error fetching balance:', error);
        }
      });
  }
  
  // Call this to refresh balance from database
  refreshBalance() {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.fetchBalance(user.id);
    }
  }
  
  setBalance(amount: number) {
    this.balance = amount;
    
    // Also update in localStorage and the auth service
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      currentUser.balance = amount;
      localStorage.setItem('user', JSON.stringify(currentUser));
      // Force update the current user subject
      this.authService['currentUserSubject'].next(currentUser);
    }
  }
  
  addBalance(amount: number) {
    this.balance += amount;
  }
  
  subtractBalance(amount: number) {
    this.balance -= amount;
  }
}