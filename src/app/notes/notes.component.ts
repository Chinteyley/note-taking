import { Component } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotesService } from '../notes.service';
import { AuthService } from '../auth.service';
import { Note } from '../note.model';

@Component({
  selector: 'app-notes',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-100">
      <nav class="bg-white shadow">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            <div class="flex-shrink-0 flex items-center">
              <h1 class="text-xl font-bold text-gray-900">Notes App</h1>
            </div>
            <div class="flex items-center">
              <button (click)="logout()"
                      class="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div class="flex space-x-4">
          <!-- Sidebar -->
          <div class="w-64 bg-white shadow rounded-lg p-4">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-lg font-medium text-gray-900">My Notes</h2>
              <button (click)="createNewNote()"
                      class="inline-flex items-center p-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                New Note
              </button>
            </div>
            <div class="space-y-2">
              @for (note of notes; track note.id) {
                <div
                  class="p-2 rounded cursor-pointer transition-colors duration-150"
                  [class.bg-indigo-100]="selectedNote?.id === note.id"
                  [class.hover:bg-gray-100]="selectedNote?.id !== note.id"
                  (click)="selectNote(note)">
                  <h3 class="text-sm font-medium text-gray-900 truncate">{{note.title}}</h3>
                </div>
              }
            </div>
          </div>

          <!-- Note Editor -->
          @if (selectedNote) {
            <div class="flex-1 bg-white shadow rounded-lg p-4">
              <input [(ngModel)]="selectedNote.title"
                     class="w-full text-xl font-semibold mb-4 p-2 border-b border-gray-200 focus:outline-none focus:border-indigo-500"
                     placeholder="Note Title">
              <textarea [(ngModel)]="selectedNote.content"
                        class="w-full h-64 p-2 border rounded focus:outline-none focus:border-indigo-500"
                        placeholder="Note content..."></textarea>
              <div class="mt-4 flex justify-end">
                <button (click)="saveNote()"
                        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  Save Note
                </button>
              </div>
            </div>
          }
          @else {
            <div class="flex-1 bg-white shadow rounded-lg p-4 flex items-center justify-center text-gray-500">
              Select a note or create a new one
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class NotesComponent {
  selectedNote: Note | null = null;

  constructor(
    private notesService: NotesService,
    private authService: AuthService
  ) {}

  get notes() {
    return this.notesService.notes;
  }

  selectNote(note: Note): void {
    this.selectedNote = { ...note };
  }

  createNewNote(): void {
    this.selectedNote = {
      id: 0,
      title: '',
      content: ''
    };
  }

  saveNote(): void {
    if (this.selectedNote) {
      if (this.selectedNote.id === 0) {
        this.notesService.addNote(this.selectedNote.title, this.selectedNote.content);
      } else {
        this.notesService.updateNote(this.selectedNote);
      }
    }
  }

  logout(): void {
    this.authService.logout();
  }
}
