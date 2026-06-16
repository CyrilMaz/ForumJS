import Database from 'better-sqlite3';

const db = new Database('./data/database.db');

function startdb() {
    db.exec(`
        CREATE TABLE IF NOT EXISTS Users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email NVARCHAR(255) NOT NULL UNIQUE,
            username VARCHAR(100) NOT NULL,
            password TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS Categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR(100) NOT NULL
        );

        CREATE TABLE IF NOT EXISTS Posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            category_id INTEGER NOT NULL,
            title VARCHAR(100) NOT NULL,
            content TEXT NOT NULL,
            date TEXT DEFAULT (datetime('now')) NOT NULL,
            FOREIGN KEY(user_id) REFERENCES Users(id),
            FOREIGN KEY(category_id) REFERENCES Categories(id)
        );

        CREATE TABLE IF NOT EXISTS Post_likes (
            user_id INTEGER NOT NULL,
            post_id INTEGER NOT NULL,
            value INTEGER NOT NULL,                         -- 1=like, 0=dislike,
            PRIMARY KEY(user_id, post_id),
            FOREIGN KEY(user_id) REFERENCES Users(id),
            FOREIGN KEY(post_id) REFERENCES Posts(id)
        );

        CREATE TABLE IF NOT EXISTS Comments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            post_id INTEGER NOT NULL,
            content TEXT NOT NULL,
            date TEXT DEFAULT (datetime('now')) NOT NULL,
            FOREIGN KEY(user_id) REFERENCES Users(id),
            FOREIGN KEY(post_id) REFERENCES Posts(id)
        );

        CREATE TABLE IF NOT EXISTS Comments_likes (
            user_id INTEGER NOT NULL,
            comment_id INTEGER NOT NULL,
            value INTEGER NOT NULL,                         -- 1=like, 0=dislike
            PRIMARY KEY(user_id, comment_id),
            FOREIGN KEY(user_id) REFERENCES Users(id),
            FOREIGN KEY(comment_id) REFERENCES Comments(id)
        );
        
        INSERT OR IGNORE INTO Users (id, email, username, password) VALUES (1, 'test@test.com', 'testuser', 'password');
        
        INSERT OR IGNORE INTO Categories (id, name) VALUES (1, 'Général');
        INSERT OR IGNORE INTO Categories (id, name) VALUES (2, 'Technologie');
        INSERT OR IGNORE INTO Categories (id, name) VALUES (3, 'Questions');
        INSERT OR IGNORE INTO Categories (id, name) VALUES (4, 'Blabla');

    `);
}

startdb()


export default db;