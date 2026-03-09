import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

interface StartResponse {
  sessionId: string;
  currentBalance: number;
}

interface ClickResponse {
  success: boolean;
  earnedAmount: number;
  totalClicks: number;
}

interface CashoutResponse {
  success: boolean;
  earnedAmount: number;
  newBalance: number;
}

@Injectable({
  providedIn: 'root'
})
export class ClickerService {
  private apiUrl = `${environment.apiUrl}/clicker`;
  
  constructor(private http: HttpClient) {}
  
  startSession(userId: string): Observable<StartResponse> {
    return this.http.post<StartResponse>(`${this.apiUrl}/start`, { userId });
  }
  
  registerClick(sessionId: string): Observable<ClickResponse> {
    return this.http.post<ClickResponse>(`${this.apiUrl}/click`, { sessionId });
  }
  
  cashout(sessionId: string): Observable<CashoutResponse> {
    return this.http.post<CashoutResponse>(`${this.apiUrl}/cashout`, { sessionId });
  }
}