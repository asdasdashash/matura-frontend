import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

interface StartGameResponse {
  sessionId: string;
  currentMultiplier: number;
  newBalance: number;
}

interface RevealResponse {
  isMine: boolean;
  gameOver: boolean;
  minePositions?: number[];
  currentMultiplier: number;
  potentialWinnings: number;
  safeCellsRevealed?: number;
}

interface CashoutResponse {
  success: boolean;
  winnings: number;
  minePositions: number[];
  newBalance: number;
}

@Injectable({
  providedIn: 'root'
})
export class MinesService {
  private apiUrl = environment.apiUrl;
  
  constructor(private http: HttpClient) {}
  
  startGame(userId: string, betAmount: number, mineNum: number): Observable<StartGameResponse> {
    return this.http.post<StartGameResponse>(`${this.apiUrl}/mines/start`, {
      userId,
      betAmount,
      mineNum
    });
  }
  
  revealCell(sessionId: string, cellId: number): Observable<RevealResponse> {
    return this.http.post<RevealResponse>(`${this.apiUrl}/mines/reveal`, {
      sessionId,
      cellId
    });
  }
  
  cashout(sessionId: string): Observable<CashoutResponse> {
    return this.http.post<CashoutResponse>(`${this.apiUrl}/mines/cashout`, {
      sessionId
    });
  }
}