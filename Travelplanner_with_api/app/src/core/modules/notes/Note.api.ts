import { Note, NoteBody } from "./Note.types";
import { API } from "@core/network/api";

const getNotes = () => {
  return API.get<Note[]>("/notes");
};

const getNoteById = (id: string) => {
  return API.get<Note>(`/notes/${id}`);
};

const createNote = (trip: NoteBody) => {
  return API.post<Note>("/notes", trip);
};

const updateNote = (id: string, trip: NoteBody) => {
  return API.patch<Note>(`/notes/${id}`, trip);
};

const deleteNote = (id: string) => {
  return API.delete(`/notes/${id}`);
};

export { getNotes, getNoteById, createNote, updateNote, deleteNote };
