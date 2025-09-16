import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Output } from '@angular/core';

import { NoteService } from '../../services/note.service';
import { FolderFormComponent } from './folder-form/folder-form.component';
import { ModalComponent } from '../modal/modal.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-folders',
  imports: [CommonModule, FolderFormComponent, ModalComponent, FormsModule],
  templateUrl: './folders.component.html',
  styleUrl: './folders.component.css'
})

export class FoldersComponent {
  
  private noteService = inject(NoteService);

  @Output() folderSelected = new EventEmitter<string>();

  selectedFolder='';
  showFolderForm = false;

  get folders() {
    return this.noteService.getFolders();
  }

  onFolderClick(folderId:string){
    this.selectedFolder = folderId;
    this.folderSelected.emit(this.selectedFolder);
  }
  
  createNewFolder() {
    this.showFolderForm = true;
  }

  onFolderCreate(folderName:string){
    this.noteService.addFolder({
      name:folderName,
      userId:'user1'
    });
    this.showFolderForm = false;
  }

  onFolderFormClose(){
    this.showFolderForm = false;
  }
}
