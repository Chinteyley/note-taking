import { Injectable, signal } from '@angular/core';
import { Note } from './note.model';

@Injectable({
  providedIn: 'root'
})
export class NotesService {
  private notesSignal = signal<Note[]>([
    { id: 1, title: 'Sample Note', content: 'This is a sample notes.' }
  ]);

  get notes() {
    return this.notesSignal();
  }

  addNote(title: string, content: string): void {
    const newNote: Note = {
      id: this.notes.length + 1,
      title,
      content
    };
    this.notesSignal.update(notes => [...notes, newNote]);
  }

  updateNote(updatedNote: Note): void {
    this.notesSignal.update(notes =>
      notes.map(note => note.id === updatedNote.id ? updatedNote : note)
    );
  }
}
