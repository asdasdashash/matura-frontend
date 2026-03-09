import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';  // ADD THIS

interface StartGameResponse {
  sessionId: string;
  cards: any[];
  newBalance: number;
}

interface RevealResponse {
  gameResult: string;
  winAmount: number;
  plCardValue: number;
  opCardValue: number;
  cards: any[];
  newBalance: number;
}

@Injectable({
  providedIn: 'root'
})
export class CardgameService {
  private apiUrl = environment.apiUrl;  // CHANGE THIS LINE
  
  constructor(private http: HttpClient) {}
  
  startGame(userId: string, betAmount: number): Observable<StartGameResponse> {
    return this.http.post<StartGameResponse>(`${this.apiUrl}/cardgame/start`, {
      userId,
      betAmount
    });
  }
  
  revealCards(sessionId: string, selectedIndices: number[]): Observable<RevealResponse> {
    return this.http.post<RevealResponse>(`${this.apiUrl}/cardgame/reveal`, {
      sessionId,
      selectedIndices
    });
  }
}