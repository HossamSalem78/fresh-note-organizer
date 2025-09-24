const { authenticateToken } = require('./middleware/auth');
const jwtService = require('./jwt-service');
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors({
  origin: 'http://localhost:4200', // Angular dev server
  credentials: true
}));
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

// Helper function to write to database
const writeDatabase = (data) => {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing to db.json:', error);
    throw error;
  }
};

// ==================== AUTHENTICATION ENDPOINTS ====================

// Login endpoint with JWT
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }

    // Read users from db.json
    const db = readDatabase();
    const { users } = db;

    // Find user by email
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    // Check password (in real app, this would be hashed)
    if (user.password !== password) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    // Generate JWT tokens
    const tokens = jwtService.generateTokenPair(user);

    // Return success with tokens and user data
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        },
        tokens: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresIn: tokens.expiresIn
        }
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Registration endpoint with JWT
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username, email, and password are required' 
      });
    }

    // Read current data
    const db = readDatabase();

    // Check if user already exists
    const existingUser = db.users.find(u => u.email === email);
    if (existingUser) {
      return res.status(409).json({ 
        success: false, 
        message: 'User with this email already exists' 
      });
    }

    // Create new user
    const newUser = {
      id: (db.users.length + 1).toString(),
      username,
      email,
      password // In real app, this would be hashed
    };

    // Add user to database
    db.users.push(newUser);
    writeDatabase(db);

    // Generate JWT tokens
    const tokens = jwtService.generateTokenPair(newUser);

    // Return success with tokens and user data
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email
        },
        tokens: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresIn: tokens.expiresIn
        }
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// ==================== NOTES ENDPOINTS ====================

// GET /api/notes - Get user's notes
app.get('/api/notes', authenticateToken, (req, res) => {
  try {
    const db = readDatabase();
    const { notes } = db;
    
    // Filter notes by user ID
    const userNotes = notes.filter(note => note.userId === req.user.userId);

    res.json({
      success: true,
      data: userNotes
    });

  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// POST /api/notes - Create a new note
app.post('/api/notes', authenticateToken, (req, res) => {
  try {
    const { title, content, folderId } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required'
      });
    }

    const db = readDatabase();

    const newNote = {
      id: (db.notes.length + 1).toString(),
      title,
      content,
      folderId: folderId || null,
      userId: req.user.userId, // Automatically assign to authenticated user
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.notes.push(newNote);
    writeDatabase(db);

    res.status(201).json({
      success: true,
      message: 'Note created successfully',
      data: newNote
    });
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// GET /api/notes/:id - Get a specific note
app.get('/api/notes/:id', authenticateToken, (req, res) => {
  try {
    const noteId = req.params.id;
    const db = readDatabase();
    const { notes } = db;
    
    const note = notes.find(n => n.id === noteId && n.userId === req.user.userId);
    if (!note) {
      return res.status(404).json({ 
        success: false, 
        message: 'Note not found' 
      });
    }
    
    res.json({
      success: true,
      data: note
    });
  } catch (error) {
    console.error('Error fetching note:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// PUT /api/notes/:id - Update a note
app.put('/api/notes/:id', authenticateToken, (req, res) => {
  try {
    const noteId = req.params.id;
    const updatedData = req.body;
    
    const db = readDatabase();
    const noteIndex = db.notes.findIndex(note => 
      note.id === noteId && note.userId === req.user.userId
    );
    
    if (noteIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        message: 'Note not found' 
      });
    }
    
    // Update note with new data
    db.notes[noteIndex] = { 
      ...db.notes[noteIndex], 
      ...updatedData,
      updatedAt: new Date().toISOString()
    };
    
    writeDatabase(db);
    
    res.json({ 
      success: true, 
      message: 'Note updated successfully',
      data: db.notes[noteIndex] 
    });
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// DELETE /api/notes/:id - Delete a note
app.delete('/api/notes/:id', authenticateToken, (req, res) => {
  try {
    const noteId = req.params.id;
    
    const db = readDatabase();
    const noteIndex = db.notes.findIndex(note => 
      note.id === noteId && note.userId === req.user.userId
    );
    
    if (noteIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        message: 'Note not found' 
      });
    }
    
    const deletedNote = db.notes.splice(noteIndex, 1)[0];
    writeDatabase(db);
    
    res.json({ 
      success: true, 
      message: 'Note deleted successfully',
      data: deletedNote 
    });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// ==================== FOLDERS ENDPOINTS ====================

// GET /api/folders - Get user's folders
app.get('/api/folders', authenticateToken, (req, res) => {
  try {
    const db = readDatabase();
    const { folders } = db;
    
    // Filter folders by user ID
    const userFolders = folders.filter(folder => folder.userId === req.user.userId);
    
    res.json({
      success: true,
      data: userFolders
    });
  } catch (error) {
    console.error('Error fetching folders:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// POST /api/folders - Create a new folder
app.post('/api/folders', authenticateToken, (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Folder name is required'
      });
    }

    const db = readDatabase();

    const newFolder = {
      id: (db.folders.length + 1).toString(),
      name,
      userId: req.user.userId,
      createdAt: new Date().toISOString()
    };

    db.folders.push(newFolder);
    writeDatabase(db);

    res.status(201).json({
      success: true,
      message: 'Folder created successfully',
      data: newFolder
    });
  } catch (error) {
    console.error('Error creating folder:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// ==================== TEAMS ENDPOINTS ====================

// GET /api/teams - Get user's teams
app.get('/api/teams', authenticateToken, (req, res) => {
  try {
    const db = readDatabase();
    const { teams } = db;
    
    // Filter teams by user ID
    const userTeams = teams.filter(team => team.userId === req.user.userId);
    
    res.json({
      success: true,
      data: userTeams
    });
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// POST /api/teams - Create a new team
app.post('/api/teams', authenticateToken, (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Team name is required'
      });
    }

    const db = readDatabase();
    
    const newTeam = {
      id: (db.teams.length + 1).toString(),
      name,
      description: description || '',
      userId: req.user.userId,
      createdAt: new Date().toISOString()
    };
    
    db.teams.push(newTeam);
    writeDatabase(db);
    
    res.status(201).json({ 
      success: true, 
      message: 'Team created successfully',
      data: newTeam 
    });
  } catch (error) {
    console.error('Error creating team:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// PUT /api/teams/:id - Update a team
app.put('/api/teams/:id', authenticateToken, (req, res) => {
  try {
    const teamId = req.params.id;
    const updatedData = req.body;
    
    const db = readDatabase();
    const teamIndex = db.teams.findIndex(team => 
      team.id === teamId && team.userId === req.user.userId
    );
    
    if (teamIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        message: 'Team not found' 
      });
    }
    
    // Update team with new data
    db.teams[teamIndex] = { 
      ...db.teams[teamIndex], 
      ...updatedData,
      updatedAt: new Date().toISOString()
    };
    
    writeDatabase(db);
    
    res.json({ 
      success: true, 
      message: 'Team updated successfully',
      data: db.teams[teamIndex] 
    });
  } catch (error) {
    console.error('Error updating team:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// DELETE /api/teams/:id - Delete a team
app.delete('/api/teams/:id', authenticateToken, (req, res) => {
  try {
    const teamId = req.params.id;
    
    const db = readDatabase();
    const teamIndex = db.teams.findIndex(team => 
      team.id === teamId && team.userId === req.user.userId
    );
    
    if (teamIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        message: 'Team not found' 
      });
    }
    
    const deletedTeam = db.teams.splice(teamIndex, 1)[0];
    writeDatabase(db);
    
    res.json({ 
      success: true, 
      message: 'Team deleted successfully',
      data: deletedTeam 
    });
  } catch (error) {
    console.error('Error deleting team:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// ==================== LEGACY ENDPOINTS (for compatibility) ====================

// GET /api/db - Get all data (for backward compatibility)
app.get('/api/db', (req, res) => {
  try {
    const db = readDatabase();
    res.json(db);
  } catch (error) {
    console.error('Error reading db.json:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to read database' 
    });
  }
});

// PUT /api/db - Update the entire database (for backward compatibility)
app.put('/api/db', (req, res) => {
  try {
    const updatedDb = req.body;
    writeDatabase(updatedDb);
    res.json({ 
      success: true, 
      message: 'Database updated successfully' 
    });
  } catch (error) {
    console.error('Error updating database:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update database' 
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});