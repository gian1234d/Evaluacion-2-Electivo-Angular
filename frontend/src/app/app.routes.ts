import { Routes } from '@angular/router';
import { TicketList } from './tickets/ticket-list';
import { TicketForm } from './tickets/ticket-form';
export const routes: Routes = [
  { path: '', redirectTo: 'tickets', pathMatch: 'full' },
  { path: 'tickets', component: TicketList },
  { path: 'tickets/nuevo', component: TicketForm },
  { path: 'tickets/:id/editar', component: TicketForm },
  { path: '**', redirectTo: 'tickets' },
];
