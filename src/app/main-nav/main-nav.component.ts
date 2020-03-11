import { Component, ViewChild } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map, shareReplay, filter } from 'rxjs/operators';
import { AuthService } from '../providers/auth.service';
import { Router, NavigationEnd, NavigationStart } from '@angular/router';
import { MatSidenav } from '@angular/material/sidenav';

@Component({
  selector: 'main-nav',
  templateUrl: './main-nav.component.html',
  styleUrls: ['./main-nav.component.scss']
})
export class MainNavComponent {

  readonly dashboardRoute = '/dashboard';

  @ViewChild('drawer', { static: false }) public sidenav: MatSidenav | undefined;

  isDashboard = false;
  isHandset = false;

  constructor(
    public authService: AuthService,
    private router: Router,
    private breakpointObserver: BreakpointObserver) {

    // TODO: cleanup subscription
    this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    ).subscribe(isHandset => {
      this.isHandset = isHandset;
    });

    this.checkIsDashboard(router.url);

    router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(event => {
      this.checkIsDashboard((event as NavigationEnd).url);
    });
  }

  dashboardClick() {
    this.router.navigateByUrl(this.dashboardRoute);
  }

  contactsClick() {
    if (this.sidenav && this.isHandset) {
      this.sidenav.close();
    }

    this.router.navigateByUrl('/contacts');
  }

  settingsClick() {
    if (this.sidenav && this.isHandset) {
      this.sidenav.close();
    }

    this.router.navigateByUrl('/settings');
  }

  infoClick() {
    if (this.sidenav && this.isHandset) {
      this.sidenav.close();
    }

    this.router.navigateByUrl('/info');
  }

  sendClick() {
    this.router.navigateByUrl('/send/');
  }

  receiveClick() {
    this.router.navigateByUrl('/receive');
  }

  signOutClick() {
    this.authService.signout();
  }

  private checkIsDashboard(route: string) {
    this.isDashboard = route === this.dashboardRoute;
  }
}
