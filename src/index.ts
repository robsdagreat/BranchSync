import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { resolvers } from './resolvers/index.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const prisma = new PrismaClient({
    datasources: {
      db: {
        url: `postgresql://robs:database@localhost:5432/branch_sync?schema=public`
      }
    }
  })

const start = async() =>{
    const app = express();

    app.use(cors());
    app.use(express.json());

    const typeDefs = await readFile(
        join(__dirname, './schema.graphql'),
        'utf-8'
    );

    const server = new ApolloServer ({
        typeDefs,
        resolvers,
        context: {prisma}
    });

    await server.start();
    server.applyMiddleware({app});

    const PORT = process.env.PORT || 4000;

    app.listen(PORT, ()=>{
        console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`)
    });
}

start()
.catch((error)=>{
    console.error('Error starting server:', error);
    process.exit(1);
})
