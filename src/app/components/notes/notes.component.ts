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
  styles:`
    .modal-content {
      max-height: calc(100vh - 80px); /* Adjust the value as needed */
      overflow-y: auto;
    }`,
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
                class="btn btn-light-primary"
              >
                Add New Note
              </button>
            </div>
          </div>
        </div>
      </nav>

      <!-- Main Content -->
      <main class="max-w-7xl mx-auto py-7 sm:px-6 lg:px-8">
        <!-- Loading State -->
        <div *ngIf="isLoading" class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
        <div *ngIf="!isLoading && notes.length === 0" class="text-center py-12">
          <p class="text-gray-500">No notes yet. Click 'Add New Note' to create one.</p>
        </div>
        <div *ngIf="!isLoading && notes.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div *ngFor="let note of sortedNotes; trackBy: trackById"
               class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <!-- Note Header -->
            <div class="relative justify-between items-start mb-4">
              <h3 class="pt-4 text-lg font-semibold text-gray-900">{{ note.title }}</h3>
              <span
                class="absolute top-0 text-xs text-gray-500 whitespace-nowrap">{{ formatDate(note.updatedAt) }}</span>
            </div>

            <!-- Note Content -->
            <div class="mb-4">
              <markdown [data]="note.summary || note.content" class="prose"></markdown>
            </div>

            <!-- Note Footer -->
            <div class="flex justify-between items-center pt-4 border-t border-gray-200">
              <span class="text-xs text-gray-500">Created {{ formatDate(note.createdAt) }}</span>
              <div class="space-x-2">
                <button (click)="editNote(note)" class="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                  Edit
                </button>
                <button (click)="deleteNote(note)" [disabled]="note.isDeleting"
                        class="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50">
                  {{ note.isDeleting ? "Deleting..." : "Delete" }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <!-- Note Modal -->
      <div *ngIf="showModal" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg shadow-xl max-w-7xl w-full m-4 modal-content"> <!-- Changed max-w-2xl to max-w-4xl -->
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">{{ currentNote._id ? "Edit Note" : "New Note" }}</h3>
          </div>

          <form class="p-6 flex space-x-4">
            <div class="flex-1 space-y-4">
              <div>
                <label for="title" class="block text-sm font-medium text-gray-700">Title</label>
                <input type="text" id="title" name="title" placeholder="Leave this empty for AI Generated title"
                       [(ngModel)]="currentNote.title"
                       class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                       required/>
              </div>

              <div>
                <label for="content" class="block text-sm font-medium text-gray-700">Content</label>
                <textarea id="content" name="content" [(ngModel)]="currentNote.content"
                          (input)="adjustTextareaHeight($event)"
                          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                          required></textarea>
              </div>
            </div>

            <div class="flex-1">
              <label class="block text-sm font-medium text-gray-700">Preview</label>
              <markdown style="height: fit-content" [data]="currentNote.content"
                        class="mt-1 block prose w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"></markdown>
            </div>
          </form>

          <div class="mt-6 flex justify-end space-x-3 px-6 pb-6">
            <button type="button" (click)="closeModal()" class="btn btn-light-secondary">Cancel</button>
            <button type="button" (click)="generateTitle()" class="btn btn-icon btn-lg btn-light-danger ">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
                   class="mr-2">
                <path
                  d="M9.6 5.613C7.91 5.466 6.98 4.874 6.484 3.7c-.179-.423-.304-.917-.384-1.5 0-.1-.1-.2-.2-.2s-.2.1-.2.2c-.08.583-.205 1.077-.384 1.5C4.821 4.874 3.891 5.466 2.2 5.613c-.1 0-.2.1-.2.2s.1.2.2.2c2.1.4 3.2 1.187 3.5 3.387 0 .1.1.2.2.2s.2-.1.2-.2c.3-2.2 1.4-2.987 3.5-3.387.1 0 .2-.1.2-.2s-.1-.2-.2-.2ZM19.469 11.865c-4-.8-5.726-2.73-6.526-6.629a.493.493 0 0 0-.474-.371.493.493 0 0 0-.475.376c-.009.006.007-.015 0 0-.8 4-2.625 5.824-6.525 6.624a.5.5 0 0 0 0 1c4 .8 5.717 2.687 6.517 6.587a.493.493 0 0 0 .483.413.493.493 0 0 0 .477-.387c-.005.01.006-.008 0 0 .8-4 2.623-5.813 6.523-6.613a.5.5 0 0 0 0-1ZM21.465 5.8c0-.084-.061-.14-.144-.156l-.056-.013c-1.168-.305-1.876-1.024-2.073-2.108a.153.153 0 0 0-.153-.153v.004c-.084 0-.14.062-.156.144l-.013.056c-.305 1.168-1.024 1.876-2.108 2.073a.153.153 0 0 0-.153.153h.004c0 .084.062.14.145.156l.055.013c1.168.305 1.876 1.024 2.073 2.108 0 .084.069.153.153.153v-.004c.084 0 .14-.062.156-.145l.014-.055c.304-1.168 1.023-1.876 2.107-2.073a.15.15 0 0 0 .15-.153ZM7.919 18.715c-1-.3-1.582-.782-1.782-1.782a.218.218 0 1 0-.436 0c-.3 1-.782 1.582-1.782 1.782a.218.218 0 0 0 0 .436c1 .3 1.582.782 1.782 1.782a.218.218 0 0 0 .436 0c.3-1 .782-1.582 1.782-1.782a.218.218 0 0 0 0-.436Z"
                  fill="currentColor"></path>
              </svg>
              Generate Title
            </button>
            <button type="submit" (click)="saveNote()" [disabled]="!currentNote.content" class="btn btn-light-primary">
              Save
            </button>
          </div>
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
      type === "success" ? "bg-green-600" : "bg-red-600"
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

  adjustTextareaHeight(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }

  generateTitle(): void {
    if (!this.currentNote.content) return;

    this.notesService.generateTitle(this.currentNote.content).subscribe({
      next: (title) => {
        this.currentNote.title = title;
        this.showNotification("Title generated successfully", "success");
      },
      error: (error) => {
        console.error("Error generating title:", error);
        this.showNotification("Failed to generate title", "error");
      },
    });

  }
}
