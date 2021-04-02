import database from '../src/database';

const db = new database({url: 'localhost'});

const start = async () => {
    
    await db.connect();

}

start();