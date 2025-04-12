import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
export interface Forecast {
  id?: number;
  product: number;
  planner: string;
  brand: string;
  year: number;
  month: number;
  apo_value: number;
  current_value: number;
  comment?: string;
  is_completed: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ForecastService {
  private apiUrl = `${environment.apiUrl}/forecast-entries/`; // 🔥 from env

  constructor(private http: HttpClient) {}

  getForecasts(): Observable<Forecast[]> {
    return this.http.get<Forecast[]>(this.apiUrl);
  }

  getForecastById(id: number): Observable<Forecast> {
    return this.http.get<Forecast>(`${this.apiUrl}${id}/`);
  }

  createForecast(forecast: Forecast): Observable<Forecast> {
    return this.http.post<Forecast>(this.apiUrl, forecast);
  }

  updateForecast(id: number, forecast: Forecast): Observable<Forecast> {
    return this.http.put<Forecast>(`${this.apiUrl}${id}/`, forecast);
  }

  deleteForecast(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}${id}/`);
  }
}
