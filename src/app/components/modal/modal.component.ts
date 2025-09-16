import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-modal',
  imports: [CommonModule],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css'
})

export class ModalComponent {
  @Input() isOpen = false;
  @Input() title = '';
  @Output() close = new EventEmitter<void>();

  onBackdropClick(event:Event){
    if(event.target === event.currentTarget){
      this.close.emit();
    }
  }

  onClose(){
    this.close.emit();
  }

}
