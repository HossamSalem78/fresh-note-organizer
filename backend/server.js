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

// Helper function to read the database
const readDatabase = () => {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading db.json:', error);
    process.exit(1);
  }
};

// Add this middleware to check note ownership
const checkNoteOwnership = (req, res, next) => {
  const noteId = req.params.id;
  const userId = req.body.userId || req.query.userId; // You'll need to pass userId
  
  // Check if user owns the note
  const db = readDatabase();
  const note = db.notes.find(n => n.id === noteId);
  
  if (!note || note.userId !== userId) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  next();
};

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

// PUT /api/db - Update the entire database
app.put('/api/db', (req, res) => {
  try {
    const updatedDb = req.body;
    fs.writeFileSync(DB_PATH, JSON.stringify(updatedDb, null, 2));
    res.json({ success: true, message: 'Database updated successfully' });
  } catch (error) {
    console.error('Error updating database:', error);
    res.status(500).json({ error: 'Failed to update database' });
  }
});

// POST /api/notes - Add a new note
app.post('/api/notes', (req, res) => {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf8');
    const db = JSON.parse(data);
    
    const newNote = {
      ...req.body,
      id: Date.now().toString()
    };
    
    db.notes.push(newNote);
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
    
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
    
    const data = fs.readFileSync(DB_PATH, 'utf8');
    const db = JSON.parse(data);
    
    const noteIndex = db.notes.findIndex(note => note.id === noteId);
    if (noteIndex === -1) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    db.notes[noteIndex] = { ...db.notes[noteIndex], ...updatedData };
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
    
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
    
    const data = fs.readFileSync(DB_PATH, 'utf8');
    const db = JSON.parse(data);
    
    const noteIndex = db.notes.findIndex(note => note.id === noteId);
    if (noteIndex === -1) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    const deletedNote = db.notes.splice(noteIndex, 1)[0];
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
    
    res.json({ success: true, note: deletedNote });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

// Apply to note routes
app.get('/api/notes/:id', checkNoteOwnership, (req, res) => {
  try {
    const noteId = req.params.id;
    const data = fs.readFileSync(DB_PATH, 'utf8');
    const db = JSON.parse(data);
    const note = db.notes.find(n => n.id === noteId);
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.json(note);
  } catch (error) {
    console.error('Error reading note:', error);
    res.status(500).json({ error: 'Failed to read note' });
  }
});

app.put('/api/notes/:id', checkNoteOwnership, (req, res) => {
  try {
    const noteId = req.params.id;
    const updatedData = req.body;
    
    const data = fs.readFileSync(DB_PATH, 'utf8');
    const db = JSON.parse(data);
    
    const noteIndex = db.notes.findIndex(note => note.id === noteId);
    if (noteIndex === -1) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    db.notes[noteIndex] = { ...db.notes[noteIndex], ...updatedData };
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
    
    res.json({ success: true, note: db.notes[noteIndex] });
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({ error: 'Failed to update note' });
  }
});

app.delete('/api/notes/:id', (req, res) => {
  try {
    const noteId = req.params.id;
    
    const data = fs.readFileSync(DB_PATH, 'utf8');
    const db = JSON.parse(data);
    
    const noteIndex = db.notes.findIndex(note => note.id === noteId);
    if (noteIndex === -1) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    const deletedNote = db.notes.splice(noteIndex, 1)[0];
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
    
    res.json({ success: true, note: deletedNote });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

// POST /api/folders - Add a new folder
app.post('/api/folders', (req, res) => {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf8');
    const db = JSON.parse(data);
    
    const newFolder = {
      ...req.body,
      id: Date.now().toString()
    };
    
    db.folders.push(newFolder);
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
    
    res.json({ success: true, folder: newFolder });
  } catch (error) {
    console.error('Error adding folder:', error);
    res.status(500).json({ error: 'Failed to add folder' });
  }
});

// POST /api/teams - Add a new team
app.post('/api/teams', (req, res) => {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf8');
    const db = JSON.parse(data);
    
    const newTeam = {
      ...req.body,
      id: Date.now().toString()
    };
    
    db.teams.push(newTeam);
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
    
    res.json({ success: true, team: newTeam });
  } catch (error) {
    console.error('Error adding team:', error);
    res.status(500).json({ error: 'Failed to add team' });
  }
});

// PUT /api/teams/:id - Update a team
app.put('/api/teams/:id', (req, res) => {
  try {
    const teamId = req.params.id;
    const updatedData = req.body;
    
    const data = fs.readFileSync(DB_PATH, 'utf8');
    const db = JSON.parse(data);
    
    const teamIndex = db.teams.findIndex(team => team.id === teamId);
    if (teamIndex === -1) {
      return res.status(404).json({ error: 'Team not found' });
    }
    
    db.teams[teamIndex] = { ...db.teams[teamIndex], ...updatedData };
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
    
    res.json({ success: true, team: db.teams[teamIndex] });
  } catch (error) {
    console.error('Error updating team:', error);
    res.status(500).json({ error: 'Failed to update team' });
  }
});

// DELETE /api/teams/:id - Delete a team
app.delete('/api/teams/:id', (req, res) => {
  try {
    const teamId = req.params.id;
    
    const data = fs.readFileSync(DB_PATH, 'utf8');
    const db = JSON.parse(data);
    
    const teamIndex = db.teams.findIndex(team => team.id === teamId);
    if (teamIndex === -1) {
      return res.status(404).json({ error: 'Team not found' });
    }
    
    const deletedTeam = db.teams.splice(teamIndex, 1)[0];
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
    
    res.json({ success: true, team: deletedTeam });
  } catch (error) {
    console.error('Error deleting team:', error);
    res.status(500).json({ error: 'Failed to delete team' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
