import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TicketInput, TicketService } from './ticket.service';
@Component({ imports: [ReactiveFormsModule, RouterLink], templateUrl: './ticket-form.html' })
export class TicketForm {
  private api = inject(TicketService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private idParam = inject(ActivatedRoute).snapshot.paramMap.get('id');
  id = this.idParam === null ? null : Number(this.idParam);
  cargando = signal(false);
  guardando = signal(false);
  error = signal('');
  falloCarga = signal(false);
  form = this.fb.nonNullable.group({
    asunto: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(200)]],
    solicitante: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(150)]],
    descripcion: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(10000)]],
    categoria: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(100)]],
    prioridad: ['media' as TicketInput['prioridad'], Validators.required],
    estado: ['pendiente' as TicketInput['estado'], Validators.required],
  });
  constructor() {
    if (this.id !== null) {
      if (!Number.isInteger(this.id) || this.id <= 0) {
        this.falloCarga.set(true); this.error.set('El identificador del ticket no es válido.'); return;
      }
      this.cargando.set(true);
      this.api.obtener(this.id).subscribe({
        next: ticket => { this.form.patchValue(ticket); this.cargando.set(false); },
        error: error => { this.error.set(error.status === 404 ? 'El ticket no existe.' : 'No se pudo cargar el ticket.'); this.falloCarga.set(true); this.cargando.set(false); },
      });
    }
  }
  invalido(campo: keyof TicketInput) { const control = this.form.controls[campo]; return control.touched && control.invalid; }
  guardar() {
    if (this.guardando() || this.cargando() || this.falloCarga()) return;
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.guardando.set(true); this.error.set('');
    const datos = this.form.getRawValue();
    datos.asunto = datos.asunto.trim(); datos.solicitante = datos.solicitante.trim();
    datos.descripcion = datos.descripcion.trim(); datos.categoria = datos.categoria.trim();
    const solicitud = this.id === null ? this.api.crear(datos) : this.api.actualizar(this.id, datos);
    solicitud.subscribe({
      next: () => { void this.router.navigate(['/tickets']); },
      error: error => { this.error.set(error.status === 400 ? 'Revisa los datos ingresados.' : 'No se pudo guardar el ticket. Intenta nuevamente.'); this.guardando.set(false); },
    });
  }
}
