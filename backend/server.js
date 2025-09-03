const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Path to the db.json file
const DB_PATH = path.join(__dirname, '../src/assets/db.json');

// GET /api/db - Get all data
app.get('/api/db', (req, res) => {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf8');
    const db = JSON.parse(data);
    res.json(db);
  } catch (error) {
    console.error('Error reading db.json:', error);
    res.status(500).json({ error: 'Failed to read database' });
  }
});

// POST /api/notes - Add a new note
app.post('/api/notes', (req, res) => {
  try {
    // Read current database
    const data = fs.readFileSync(DB_PATH, 'utf8');
    const db = JSON.parse(data);
    
    // Add new note
    const newNote = {
      ...req.body,
      id: Date.now().toString(),
      userId: 'user1'
    };
    
    db.notes.push(newNote);
    
    // Write back to file
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
    
    console.log('Note added to db.json:', newNote);
    res.json({ success: true, note: newNote });
  } catch (error) {
    console.error('Error adding note:', error);
    res.status(500).json({ error: 'Failed to add note' });
  }
});

// PUT /api/notes/:id - Update a note
app.put('/api/notes/:id', (req, res) => {
  try {
    const noteId = req.params.id;
    const updatedData = req.body;
    
    // Read current database
    const data = fs.readFileSync(DB_PATH, 'utf8');
    const db = JSON.parse(data);
    
    // Find and update the note
    const noteIndex = db.notes.findIndex(note => note.id === noteId);
    if (noteIndex === -1) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    // Update the note
    db.notes[noteIndex] = { ...db.notes[noteIndex], ...updatedData };
    
    // Write back to file
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
    
    console.log('Note updated in db.json:', db.notes[noteIndex]);
    res.json({ success: true, note: db.notes[noteIndex] });
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({ error: 'Failed to update note' });
  }
});

// DELETE /api/notes/:id - Delete a note
app.delete('/api/notes/:id', (req, res) => {
  try {
    const noteId = req.params.id;
    
    // Read current database
    const data = fs.readFileSync(DB_PATH, 'utf8');
    const db = JSON.parse(data);
    
    // Find and remove the note
    const noteIndex = db.notes.findIndex(note => note.id === noteId);
    if (noteIndex === -1) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    const deletedNote = db.notes.splice(noteIndex, 1)[0];
    
    // Write back to file
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
    
    console.log('Note deleted from db.json:', deletedNote);
    res.json({ success: true, message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
