require('dotenv').config();
const express = require('express');
const cors = require('cors');

const userRoutes = require('./routes/users');
const articleRoutes = require('./routes/articles');
const tagRoutes = require('./routes/tags');
const vocabularyRoutes = require('./routes/vocabularies');
const quizRoutes = require('./routes/quiz');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/vocabularies', vocabularyRoutes);
app.use('/api/quiz', quizRoutes);

app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'LearnUp API is running.'
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});