import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ToastTipo = 'sucesso' | 'erro';

/** Toast inferior central, controlado pelo App (visibilidade + auto-hide). */
@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.html',
  styleUrl: './toast.css',
})
export class Toast {
  @Input() visivel = false;
  @Input() mensagem = '';
  @Input() tipo: ToastTipo = 'sucesso';

  @Output() fechar = new EventEmitter<void>();
}
