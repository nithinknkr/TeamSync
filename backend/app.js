// Add this to your existing app.js file where you define your routes

const taskRouter = require('./routes/taskRoutes');

// Add this to your middleware section
app.use('/api/v1/tasks', taskRouter);