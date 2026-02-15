import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink, MatCardModule, MatButtonModule],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
/** Pagina di ingresso dell'app con collegamenti rapidi a login e registrazione. */
export class LandingComponent {}
