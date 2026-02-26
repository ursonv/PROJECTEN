import { Router } from "express";
import {
  createNote,
  deleteNote,
  getNoteDetail,
  getNotes,
  updateNote,
} from "./Note.controller";

const router: Router = Router();

router.get("/notes", getNotes);
router.get("/notes/:id", getNoteDetail);
router.post("/notes", createNote);
router.patch("/notes/:id", updateNote);
router.delete("/notes/:id", deleteNote);

export default router;
