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

// POST /api/folders - Add a new folder
app.post('/api/folders', (req, res) => {
  try {
    // Read current database
    const data = fs.readFileSync(DB_PATH, 'utf8');
    const db = JSON.parse(data);
    
    // Add new folder
    const newFolder = {
      ...req.body,
      id: Date.now().toString()
    };
    
    db.folders.push(newFolder);
    
    // Write back to file
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
    
    console.log('Folder added to db.json:', newFolder);
    res.json({ success: true, folder: newFolder });
  } catch (error) {
    console.error('Error adding folder:', error);
    res.status(500).json({ error: 'Failed to add folder' });
  }
});

// POST /api/teams - Add a new team
app.post('/api/teams', (req, res) => {
  try {
    // Read current database
    const data = fs.readFileSync(DB_PATH, 'utf8');
    const db = JSON.parse(data);
    
    // Add new team
    const newTeam = {
      ...req.body,
      id: Date.now().toString()
    };
    
    db.teams.push(newTeam);
    
    // Write back to file
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
    
    console.log('Team added to db.json:', newTeam);
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
    
    // Read current database
    const data = fs.readFileSync(DB_PATH, 'utf8');
    const db = JSON.parse(data);
    
    // Find and update the team
    const teamIndex = db.teams.findIndex(team => team.id === teamId);
    if (teamIndex === -1) {
      return res.status(404).json({ error: 'Team not found' });
    }
    
    // Update the team
    db.teams[teamIndex] = { ...db.teams[teamIndex], ...updatedData };
    
    // Write back to file
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
    
    console.log('Team updated in db.json:', db.teams[teamIndex]);
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
    
    // Read current database
    const data = fs.readFileSync(DB_PATH, 'utf8');
    const db = JSON.parse(data);
    
    // Find and remove the team
    const teamIndex = db.teams.findIndex(team => team.id === teamId);
    if (teamIndex === -1) {
      return res.status(404).json({ error: 'Team not found' });
    }
    
    const deletedTeam = db.teams.splice(teamIndex, 1)[0];
    
    // Write back to file
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
    
    console.log('Team deleted from db.json:', deletedTeam);
    res.json({ success: true, message: 'Team deleted successfully' });
  } catch (error) {
    console.error('Error deleting team:', error);
    res.status(500).json({ error: 'Failed to delete team' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
