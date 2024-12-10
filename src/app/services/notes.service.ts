import { Injectable, OnDestroy } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, Observable, throwError, Subscription } from "rxjs";
import { tap, catchError } from "rxjs/operators";
import { Note } from "../models/note.model";
import { AuthService } from "./auth.service";

@Injectable({
  providedIn: "root",
})
export class NotesService implements OnDestroy {
  private apiUrl = "http://localhost:3000/notes";
  private notesSubject = new BehaviorSubject<Note[]>([]);
  notes$ = this.notesSubject.asObservable();
  private authSubscription: Subscription;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {
    this.authSubscription = this.authService.logout$.subscribe(() => {
      this.clearNotes();
    });
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  clearNotes(): void {
    this.notesSubject.next([]);
  }

  deleteNote(id: string): Observable<any> {
    console.log("NotesService: Deleting note with ID:", id);

    return this.http
      .delete(`${this.apiUrl}/${id}`, {
        headers: this.authService.getAuthHeaders(),
      })
      .pipe(
        tap(() => {
          console.log("Delete request successful");
        }),
        catchError((error) => {
          console.error("Delete request failed:", error);
          return throwError(() => error);
        }),
      );
  }

  loadNotes(): void {
    this.clearNotes(); // Clear existing notes before loading new ones
    this.http
      .get<Note[]>(this.apiUrl, {
        headers: this.authService.getAuthHeaders(),
      })
      .pipe(
        catchError((error) => {
          console.error("Error loading notes:", error);
          return throwError(() => error);
        }),
      )
      .subscribe((notes) => {
        console.log("Notes loaded:", notes);
        this.notesSubject.next(notes);
      });
  }

  getNotes(): Observable<Note[]> {
    return this.http
      .get<Note[]>(this.apiUrl, {
        headers: this.authService.getAuthHeaders(),
      })
      .pipe(
        tap((notes) => {
          this.notesSubject.next(notes);
        }),
        catchError((error) => {
          console.error("Error loading notes:", error);
          return throwError(() => error);
        }),
      );
  }

  createNote(note: Partial<Note>): Observable<Note> {
    return this.http
      .post<Note>(this.apiUrl, note, {
        headers: this.authService.getAuthHeaders(),
      })
      .pipe(
        tap((newNote) => {
          const currentNotes = this.notesSubject.value;
          this.notesSubject.next([...currentNotes, newNote]);
        }),
        catchError((error) => {
          console.error("Error creating note:", error);
          return throwError(() => error);
        }),
      );
  }

  updateNote(id: string, note: Partial<Note>): Observable<Note> {
    return this.http
      .put<Note>(`${this.apiUrl}/${id}`, note, {
        headers: this.authService.getAuthHeaders(),
      })
      .pipe(
        tap((updatedNote) => {
          const currentNotes = this.notesSubject.value;
          const updatedNotes = currentNotes.map((n) =>
            n._id === id ? updatedNote : n,
          );
          this.notesSubject.next(updatedNotes);
        }),
        catchError((error) => {
          console.error("Error updating note:", error);
          return throwError(() => error);
        }),
      );
  }

  generateTitle(content: string): Observable<string> {
    return this.http
      .post<string>(`${this.apiUrl}/generate-title`, { content }, {
        headers: this.authService.getAuthHeaders(),
      })
      .pipe(
        catchError((error) => {
          console.error("Error generating title:", error);
          return throwError(() => error);
        }),
      );
  }
}
