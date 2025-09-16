import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { NoteService } from '../../services/note.service';
import { ModalComponent } from "../modal/modal.component";
import { FolderFormComponent } from "../folders/folder-form/folder-form.component";


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterModule, RouterLinkActive, ModalComponent, FolderFormComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  

  
}