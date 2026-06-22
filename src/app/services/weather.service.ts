import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WeatherService {
  constructor(private http: HttpClient) {}

  checkWeather(location: string){
    return this.http.get('current.json', { params : { q: location} }).pipe(
      map((response) => {
        return response;
      }),
      catchError((error) => {
        return of(error.error);
      }),
    );
  }
}
