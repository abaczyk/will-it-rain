import { Component, signal } from '@angular/core';
import { WeatherService } from '../services/weather.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-main',
  templateUrl: './main.html',
  styleUrl: './main.scss',
  imports: [FormsModule],
})
export class Main {
  protected location: string = '';
  protected willItRain?: boolean;

  isSpinning = signal(false);
  totalRotation = signal(0);
  animationDurationSec = 3;

  constructor(private weatherService: WeatherService) { }

  protected checkWeather() {
    if (!!this.location)
      this.weatherService.checkWeather(this.location)
        .subscribe(response => {
          this.willItRain = Boolean(response.current.will_it_rain);
          this.spinTheWheel();
        })

  }

  spinTheWheel() {
    const YES_CENTER = 180;
    const NO_CENTER = 360;

    this.totalRotation.update(prev => {
      const center = this.willItRain ? YES_CENTER : NO_CENTER;

      const currentMod = prev % 360;
      const centerDiff = (center - currentMod + 360) % 360;
      const newCenterValue = prev + 5 * 360 + centerDiff;

      return newCenterValue;
    });

    this.isSpinning.set(true);

    const durationMs = this.animationDurationSec * 1000
    setTimeout(() => {
      this.isSpinning.set(false);
    }, durationMs);
  }
}
