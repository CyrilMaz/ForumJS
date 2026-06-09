import Database from 'better-sqlite3';

const db = new Database('./data/database.db');

function startdb() {
    db.exec(`
        CREATE IF NOT EXISTS TABLE Users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            mail NVARCHAR(255) NOT NULL UNIQUE,
            username VARVHAR(100) NOT NULL,
            password TEXT NOT NULL
        )

        CREATE IF NOT EXISTS TABLE Categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARC6HAR(100) NOT NULL
        )

        CREATE IF NOT EXISTS TABLE Posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            category_id INTEGER NOT NULL,
            content TEXT NOT NULL,
            date TEXT DEFAULT datetime('now') NOT NULL,
            FOREIGN KEY(user_id) REFERENCES Users(id)
            FOREIGN KEY(category_id) REFERENCES Categories(id)
        )

        CREATE IF NOT EXISTS TABLE Post_likes (
            user_id INTEGER NOT NULL,
            post_id INTEGER NOT NULL,
            value INTEGER NOT NULL,                         -- 1=like, 0=dislike,
            PRIMARY KEY(user_id, post_id),
            FOREIGN KEY(user_id) REFERENCES Users(id),
            FOREIGN KEY(post_id) REFERENCES Posts(id),
        )

        CREATE IF NOT EXISTS TABLE Comments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            post_id INTEGER NOT NULL,
            content TEXT NOT NULL,
            date TEXT DEFAULT datetime('now') NOT NULL,
            PRIMARY KEY(user_id, post_id),
            FOREIGN KEY(user_id) REFERENCES Users(id),
            FOREIGN KEY(post_id) REFERENCES Posts(id)
        )

        CREATE IF NOT EXISTS TABLE Comments_likes (
            user_id INTEGER NOT NULL,
            comment_id INTEGER NOT NULL,
            value INTEGER NOT NULL,                         -- 1=like, 0=dislike
            PRIMARY KEY(user_id, comment_id),
            FOREIGN KEY(user_id) REFERENCES Users(id),
            FOREIGN KEY(comment_id) REFERENCES Comments(id)
        )
    `);
 }

 export default db;