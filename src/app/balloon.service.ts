import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';  // ADD THIS

interface StartGameResponse {
  sessionId: string;
  currentMultiplier: number;
  potentialWinnings: number;
  newBalance: number;
}

interface PumpResponse {
  success: boolean;
  popped: boolean;
  currentMultiplier: number;
  potentialWinnings: number;
}

interface CashoutResponse {
  success: boolean;
  winnings: number;
  newBalance: number;
}

interface BalanceResponse {
  balance: number;
}

@Injectable({
  providedIn: 'root'
})
export class BalloonService {
  private apiUrl = environment.apiUrl;  // CHANGE THIS LINE
  
  constructor(private http: HttpClient) {}
  
  startGame(userId: string, betAmount: number, multiplier: number): Observable<StartGameResponse> {
    return this.http.post<StartGameResponse>(`${this.apiUrl}/balloon/start`, {
      userId,
      betAmount,
      multiplier
    });
  }
  
  pump(sessionId: string): Observable<PumpResponse> {
    return this.http.post<PumpResponse>(`${this.apiUrl}/balloon/pump`, {
      sessionId
    });
  }
  
  cashout(sessionId: string): Observable<CashoutResponse> {
    return this.http.post<CashoutResponse>(`${this.apiUrl}/balloon/cashout`, {
      sessionId
    });
  }
  
  getBalance(userId: string): Observable<BalanceResponse> {
    return this.http.get<BalanceResponse>(`${this.apiUrl.replace('/api', '')}/api/balance/${userId}`);
  }
}