const express = require('express');
const mysql = require('mysql');
const app = express();
const port = 3000;

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'kanban_app'
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
  } else {
    console.log('Connected to MySQL');
  }
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  db.query('SELECT * FROM tasks ORDER BY status', (err, results) => {
    if (err) {
      console.error('Error fetching tasks:', err);
      res.render('index', { tasks: [] });
    } else {
      res.render('index', { tasks: results });
    }
  });
});

app.post('/add', (req, res) => {
  const { title, description } = req.body;
  db.query('INSERT INTO tasks (title, description, status) VALUES (?, ?, ?)', [title, description, 'To Do'], (err) => {
    if (err) {
      console.error('Error adding task:', err);
      res.status(500).json({ error: 'Error adding task' });
    } else {
      res.redirect("/");
    }
  });
});
app.get('/add',(req,res)=>{
  res.render('add');
});

app.get('/actions', (req, res) => {
  db.query('SELECT * FROM tasks ORDER BY status', (err, results) => {
    if (err) {
      console.error('Error fetching tasks:', err);
      res.render('actions', { tasks: [] });
    } else {
      res.render('actions', { tasks: results });
    }
  });
});


app.get('/edit/:id', (req, res) => {
    const taskId = req.params.id;
    db.query('SELECT * FROM tasks WHERE id = ?', [taskId], (err, results) => {
      if (err) {
        console.error('Error fetching task:', err);
        res.redirect('/');
      } else {
        res.render('edit', { task: results[0] });
      }
    });
  });
  
  app.post('/edit/:id', (req, res) => {
    const taskId = req.params.id;
    const { title, description } = req.body;
    db.query('UPDATE tasks SET title = ?, description = ? WHERE id = ?', [title, description, taskId], (err) => {
      if (err) {
        console.error('Error updating task:', err);
      }
      res.redirect('/');
    });
  });

  app.post('/updateTaskStatus', (req, res) => {
    const { taskId, newStatus } = req.body;
    db.query('UPDATE tasks SET status = ? WHERE id = ?', [newStatus, taskId], (err) => {
      if (err) {
        console.error('Error updating task status:', err);
        res.status(500).json({ error: 'Error updating task status' });
      } else {
        res.json({ message: 'Task status updated successfully' });
      }
    });
  });
app.get('/delete/:id', (req, res) => {
    const taskId = req.params.id;
    db.query('DELETE FROM tasks WHERE id = ?', [taskId], (err) => {
      if (err) {
        console.error('Error deleting task:', err);
      }
      res.redirect('/actions');
    });
  });    

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
