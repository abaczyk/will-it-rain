import { ChangeDetectorRef, Component, signal, TemplateRef, ViewChild } from '@angular/core';
import { WeatherService } from '../services/weather.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import confetti from "@hiseb/confetti";
import { CommonModule } from '@angular/common';
import { GoogleMapsModule } from '@angular/google-maps';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { take } from 'rxjs';
declare let google: any;

@Component({
  selector: 'app-main',
  templateUrl: './main.html',
  styleUrl: './main.scss',
  imports: [ReactiveFormsModule, CommonModule, GoogleMapsModule,],
})
export class Main {
  @ViewChild('noLocationPermissionsTemplate') private noLocationPermissionsTemplate!: TemplateRef<any>;

  protected form = new FormGroup({
    location: new FormControl(null, Validators.required)
  })
  protected willItRain?: boolean;

  protected isSpinning = signal(false);
  protected totalRotation = signal(0);
  protected animationDurationSec = 3;

  protected disabledLocation: boolean = false;

  protected modalRef?: BsModalRef;

  constructor(private weatherService: WeatherService,
    protected modalService: BsModalService,
    private cdr: ChangeDetectorRef) { }

  protected checkWeather() {
    const location = this.form.get('location')?.value
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

  getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          if (typeof google !== 'undefined' && google.maps) {
            let geocoder = new google.maps.Geocoder();
            let latlng = new google.maps.LatLng(latitude, longitude);
            geocoder.geocode(
              { location: latlng },
              (results: any, status: any) => {
                if (status === google.maps.GeocoderStatus.OK) {
                  let result = results?.[0];
                  let addressComponents = result?.address_components;
                  if (result) {
                    const city = addressComponents[2].short_name.replace(
                      ' ',
                      '+'
                    );
                    this.form.get('location')?.setValue(city);
                    this.checkWeather();
                  } else {

                  }
                }
              }
            );
          } else {
            this.handleNoLocationPermissions();
          }
        }, (error: GeolocationPositionError) => {
          const message = Boolean(error.PERMISSION_DENIED) ? undefined : error.message;
          this.handleNoLocationPermissions(message);
        })
    } else {
      this.handleNoLocationPermissions();
    }
  }

  handleNoLocationPermissions(errorMessage?: string) {
    this.disabledLocation = true;
    const initialState = !!errorMessage ? { errorMessage } : {}
    this.openModal(this.noLocationPermissionsTemplate, initialState);
    this.cdr.detectChanges();
  }

  openModal(template: TemplateRef<any>, initialState: any = {}) {
    const showModal = () => this.modalRef = this.modalService.show(template, { initialState });
    if (this.modalService.getModalsCount()) {
      this.modalRef?.onHidden?.pipe(take(1)).subscribe(() =>
        showModal()
      );
      this.modalRef?.hide();
    } else {
      showModal();
    }
  }
}

