import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { NotesService, AuthService } from "../../services";
import { Note } from "../../models/note.model";
import { Subscription } from "rxjs";
import { MarkdownComponent} from "ngx-markdown";

@Component({
  selector: "app-notes",
  standalone: true,
  imports: [CommonModule, FormsModule, MarkdownComponent],
  providers: [NotesService, AuthService],
  template: `
    <div class="min-h-screen bg-gray-100">
      <!-- Navigation Bar -->
      <nav class="bg-white shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            <div class="flex items-center">
              <h1 class="text-xl font-semibold text-gray-900">My Notes</h1>
            </div>
            <div class="flex items-center">
              <button
                (click)="openNewNoteModal()"
                class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Add New Note
              </button>
            </div>
          </div>
        </div>
      </nav>

      <!-- Main Content -->
      <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <!-- Loading State -->
        <div *ngIf="isLoading" class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
        <div *ngIf="!isLoading && notes.length === 0" class="text-center py-12">
          <p class="text-gray-500">No notes yet. Click 'Add New Note' to create one.</p>
        </div>
        <div *ngIf="!isLoading && notes.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div *ngFor="let note of sortedNotes; trackBy: trackById" class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <!-- Note Header -->
            <div class="flex justify-between items-start mb-4">
              <h3 class="text-lg font-semibold text-gray-900">{{ note.title }}</h3>
              <span class="text-xs text-gray-500">{{ formatDate(note.updatedAt) }}</span>
            </div>

            <!-- Note Content -->
            <div class="mb-4" >
              <markdown [data]="note.summary || note.content" class="prose"></markdown>
            </div>

            <!-- Note Footer -->
            <div class="flex justify-between items-center pt-4 border-t border-gray-200">
              <span class="text-xs text-gray-500">Created {{ formatDate(note.createdAt) }}</span>
              <div class="space-x-2">
                <button (click)="editNote(note)" class="text-indigo-600 hover:text-indigo-800 text-sm font-medium">Edit</button>
                <button (click)="deleteNote(note)" [disabled]="note.isDeleting" class="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50">
                  {{ note.isDeleting ? "Deleting..." : "Delete" }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <!-- Note Modal -->
      <div *ngIf="showModal" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full m-4">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">{{ currentNote._id ? "Edit Note" : "New Note" }}</h3>
          </div>

          <form class="p-6">
            <div class="space-y-4">
              <div>
                <label for="title" class="block text-sm font-medium text-gray-700">Title</label>
                <input type="text" id="title" name="title" placeholder="Leave this empty for AI Generated title" [(ngModel)]="currentNote.title" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border" required />
              </div>

              <div>
                <label for="content" class="block text-sm font-medium text-gray-700">Content</label>
                <textarea id="content" name="content" rows="6" [(ngModel)]="currentNote.content" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border" required></textarea>
                <markdown clipboard style="height: fit-content" [data]="currentNote.content" class="mt-1 block prose w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"></markdown>
              </div>
            </div>

            <div class="mt-6 flex justify-end space-x-3">
              <button type="button" (click)="closeModal()" class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
              <button type="submit" (click)="saveNote()" [disabled]="!currentNote.content" class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">Save</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
})
export class NotesComponent implements OnInit, OnDestroy {
  private authSubscription?: Subscription;
  notes: Note[] = [];
  showModal = false;
  isLoading = false;
  currentNote: Partial<Note> = { title: "", content: "" };

  constructor(
    private notesService: NotesService,
  ) {}
  ngOnInit(): void {
    this.loadNotes();
  }
  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  get sortedNotes(): Note[] {
    return [...this.notes].sort((a, b) => {
      return (
        new Date(b.updatedAt || b.createdAt).getTime() -
        new Date(a.updatedAt || a.createdAt).getTime()
      );
    });
  }
  saveNote(): void {
    if (!this.currentNote.content) return;

    const operation = this.currentNote._id
      ? this.notesService.updateNote(this.currentNote._id, this.currentNote)
      : this.notesService.createNote(this.currentNote);

    operation.subscribe({
      next: (savedNote) => {
        if (this.currentNote._id) {
          // Update existing note
          this.notes = this.notes.map((note) =>
            note._id === savedNote._id ? savedNote : note,
          );
        } else {
          // Add new note
          this.notes = [...this.notes, savedNote];
        }
        this.showNotification("Note saved successfully", "success");
        this.closeModal();
      },
      error: (error) => {
        console.error("Error saving note:", error);
        this.showNotification("Failed to save note", "error");
      },
    });
  }

  loadNotes(): void {
    this.isLoading = true;
    this.notesService.getNotes().subscribe({
      next: (notes) => {
        this.notes = notes;
        this.isLoading = false;
      },
      error: (error) => {
        console.error("Error loading notes:", error);
        this.showNotification("Failed to load notes", "error");
        this.isLoading = false;
      },
    });
  }

  openNewNoteModal(): void {
    this.currentNote = { title: "", content: "" };
    this.showModal = true;
  }

  editNote(note: Note): void {
    this.currentNote = { ...note };
    this.showModal = true;
  }
  deleteNote(note: Note): void {
    if (!note._id) {
      return;
    }

    if (confirm("Are you sure you want to delete this note?")) {
      // Set deleting state
      const noteIndex = this.notes.findIndex((n) => n._id === note._id);
      if (noteIndex !== -1) {
        const updatedNotes = [...this.notes];
        updatedNotes[noteIndex] = { ...note, isDeleting: true };
        this.notes = updatedNotes;
      }

      // Send delete request
      this.notesService.deleteNote(note._id).subscribe({
        next: () => {
          // Remove note from array on success
          this.notes = this.notes.filter((n) => n._id !== note._id);
          this.showNotification("Note deleted successfully", "success");
        },
        error: (error) => {
          console.error("Delete failed:", error);
          // Reset deleting state on error
          const updatedNotes = [...this.notes];
          if (noteIndex !== -1) {
            updatedNotes[noteIndex] = { ...note, isDeleting: false };
            this.notes = updatedNotes;
          }
          this.showNotification("Failed to delete note", "error");
        },
      });
    }
  }

  closeModal(): void {
    this.showModal = false;
    this.currentNote = { title: "", content: "" };
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return "";

    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 7) {
      return d.toLocaleDateString();
    } else if (days > 0) {
      return `${days} day${days > 1 ? "s" : ""} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    } else {
      return "Just now";
    }
  }

  private showNotification(message: string, type: "success" | "error"): void {
    const notification = document.createElement("div");
    notification.className = `fixed bottom-4 right-4 p-4 rounded-md ${
      type === "success" ? "bg-green-500" : "bg-red-500"
    } text-white z-50`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  trackById(index: number, note: Note): string {
    return note._id || '';
  }
}
