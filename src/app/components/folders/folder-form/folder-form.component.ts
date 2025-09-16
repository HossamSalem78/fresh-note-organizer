import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-folder-form',
  imports: [CommonModule, FormsModule],
  templateUrl: './folder-form.component.html',
  styleUrl: './folder-form.component.css'
})

export class FolderFormComponent {
  @Output() createFolder = new EventEmitter<string>();
  @Output() cancel = new EventEmitter<void>();

  folderName='';

  onCreate(){
    this.createFolder.emit(this.folderName.trim());
    this.folderName = '';
  }

  onCancel(){
    this.cancel.emit();
    this.folderName = '';
  }

}
