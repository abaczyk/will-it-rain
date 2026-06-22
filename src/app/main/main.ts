import { Component } from '@angular/core';
import { WeatherService } from '../services/weather.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-main',
  templateUrl: './main.html',
  styleUrl: './main.scss',
  imports: [FormsModule]
})
export class Main {
  protected location: string = '';
  protected willItRain?: boolean;

  constructor(private weatherService: WeatherService) { }

  protected checkWeather() {
    this.weatherService.checkWeather(this.location)
      .subscribe(response => {
        this.willItRain = Boolean(response.current.will_it_rain)
      })
  }
}
