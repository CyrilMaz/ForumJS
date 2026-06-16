import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import postsRouter from './routes/posts.js';
import authRouter from './routes/auth.js';

const app = express();

app.use(cors());          // autorise React (5173) à appeler Express (3000)
app.use(express.json());  // lit le body JSON des requêtes POST/PUT

app.use('/api/posts', postsRouter);
app.use('/api/auth', authRouter)

app.use((req, res) => {
    res.status(404).json({ message: 'Route non trouvée' });
});

app.use((err, req, res, next) => {
    console.error(err)
    res.status(500).json({ message: 'Erreur interne du serveur' });
});

app.listen(3000, () => console.log('Serveur sur http://localhost:3000'));