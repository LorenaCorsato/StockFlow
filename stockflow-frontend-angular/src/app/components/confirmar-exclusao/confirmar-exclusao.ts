import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Produto } from '../../models/produto';

/**
 * Modal central de confirmação de exclusão.
 * Overlay + ESC cancelam (travados durante a exclusão).
 */
@Component({
  selector: 'app-confirmar-exclusao',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirmar-exclusao.html',
  styleUrl: './confirmar-exclusao.css',
})
export class ConfirmarExclusao {
  @Input() aberto = false;
  @Input() produto: Produto | null = null;
  @Input() excluindo = false;

  @Output() cancelar = new EventEmitter<void>();
  @Output() confirmar = new EventEmitter<void>();

  aoCancelar(): void {
    if (this.excluindo) return;
    this.cancelar.emit();
  }

  aoTeclar(event: KeyboardEvent): void {
    if (event.key === 'Escape') this.aoCancelar();
  }
}
