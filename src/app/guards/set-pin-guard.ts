import { Injectable } from '@angular/core';
import { AuthService } from '../providers/auth.service';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SetPinGuard {

  constructor(private authService: AuthService, private router: Router) {
  }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const user = this.authService.walletUser;

    if (!user) {
      this.router.navigate(['/']);
      return false;
    }

    if (!user.hasPin) {
      this.router.navigateByUrl('settings/set-pin');
      return false;
    }

    return true;
  }
}
