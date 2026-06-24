import { Component, signal } from '@angular/core';
import { WeatherService } from '../services/weather.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import confetti from "@hiseb/confetti";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main',
  templateUrl: './main.html',
  styleUrl: './main.scss',
  imports: [ReactiveFormsModule, CommonModule],
})
export class Main {
  protected form = new FormGroup({
    location: new FormControl(null, Validators.required)
  })
  protected willItRain?: boolean;

  isSpinning = signal(false);
  totalRotation = signal(0);
  animationDurationSec = 3;

  constructor(private weatherService: WeatherService) { }

  protected checkWeather() {
    const location = this.form.get('location')?.value;
    if (!!location)
      this.weatherService.checkWeather(location)
        .subscribe(response => {
          if (response.error) {
            this.form.get('location')?.setErrors({ 'Invalid location': true });
          } else {
            this.willItRain = Boolean(response.current.will_it_rain);
            this.spinTheWheel();
          }
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
      if (!this.willItRain) {
        confetti({
          position: { x: 0, y: 0 },
          count: 200,
          size: 1,
          velocity: 200,
          fade: false
        });
        confetti({
          position: { x: window.innerWidth, y: 0 },
          count: 200,
          size: 1,
          velocity: 200,
          fade: false
        });
      }
    }, durationMs);
  }
}
