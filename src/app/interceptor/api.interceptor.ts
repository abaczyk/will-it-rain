import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../environments/environment';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const apiReq = req.clone({ url: `https://api.weatherapi.com/v1/${req.url}` ,  params: req.params.set('key', environment.api_key)});
  return next(apiReq);
};