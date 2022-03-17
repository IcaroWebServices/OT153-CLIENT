import { Component, OnInit } from '@angular/core';
import { link } from '@app/core/models/link.interface';
import { AuthState } from '@app/core/redux/auth/auth.reducers';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { logout, isGoogleAuth } from '@core/redux/auth/auth.actions';
import { getAuthOk } from '@core/redux/auth/auth.selectors';
import { Router } from '@angular/router';
import * as fromFirebaseAuth from "firebase/auth";
import { DialogService } from '@app/core/services/dialog.service';
import { DialogData } from '@app/core/models/dialog.inteface';
import { DialogType } from '@app/core/enums/dialog.enum';

@Component({
  selector: 'alk-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  constructor( private store: Store<AuthState>, private router: Router, private dialogService: DialogService) {
    this.authState$ = this.store.select(getAuthOk);
  }

  authState$: Observable<AuthState>;
  loggedIn: boolean = false;

  authentication$: Observable<boolean>;
  links: link[];
  linksHome: link[] = [
    { link: '/home', text: 'Inicio' },
    { link: '/nosotros', text: 'Nosotros' },
    { link: '/contacto', text: 'Contacto' },
  ];
  linksBackoffice: link[] = [
    { link: '/backoffice/organization', text: 'Organizacion' },
    { link: '/donacion', text: 'Donaciones' },
    { link: '/backoffice/actividades', text: 'Actividades' },
    { link: '/backoffice/users', text: 'Usuarios' },
    { link: '/backoffice/members', text: 'Miembros' },
    { link: '/backoffice/categorias', text: 'Usuarios' },
    { link: '/backoffice/', text: 'Dashboard' },
  ];

  linksGoogle: link[] = [
    { link: '/home', text: 'Inicio' },
    { link: '/nosotros', text: 'Nosotros' },
    { link: '/contacto', text: 'Contacto' },
    { link: '/donar', text: 'Donaciones' },
  ];


  openNavbar: boolean = false;

  ngOnInit(): void {
    this.loadLinks();
    this.authState$.subscribe( ({auth, isGoogleAuth}) =>{
      if(auth || isGoogleAuth){
        this.loggedIn = true;
      }else{
        this.loggedIn = false;
      }
    })
  }

  loadLinks(): void {
    this.authState$.subscribe( ({auth, isGoogleAuth}) => {

      if (auth && !isGoogleAuth) {
        this.links = [...this.linksHome, ...this.linksBackoffice];
      } else {
        if(isGoogleAuth){
          this.links = this.linksGoogle
        }else{
          this.links = this.linksHome;
        }
      }
    }) 
  }

  logout(){

    this.store.dispatch(logout());
    const auth = fromFirebaseAuth.getAuth();
    fromFirebaseAuth.signOut(auth).then(() => {
      let dialog: DialogData = { type: DialogType.SUCCESS, header:  'Operación Exitosa', content: 'La sesión se cerro correctamente.'};
      this.dialogService.show(dialog);
    }).catch(() => {
      let dialog: DialogData = { type: DialogType.ERROR, header:  'Error', content: 'Error al cerrar la sesión.'};
      this.dialogService.show(dialog);
    });

    this.router.navigate(['/home']);
  }
}
