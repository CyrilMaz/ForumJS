import Database from 'better-sqlite3';

const db = new Database('./database/data.db');

function createdb() {
    db.exec(`
        CREATE TABLE IF NOT EXISTS Users(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            mail NVARCHAR(100) NOT NULL UNIQUE,
            username VARCHAR(100) NOT NULL UNIQUE,
            password TEXT NOT NULL
        )

        CREATE TABLE IF NOT EXISTS Categories(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR(100) NOT NULL
        )

        CREATE TABLE IF NOT EXISTS Posts(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            content INTEGER NOT NULL,

            FOREIGN KEY (user_id) REFERENCES Users(id)
        )

        CREATE TABLE IF NOT EXISTS post_categories(
            post_id INTEGER NOT NULL,
            category_id INTEGER NOT NULL,

            PRIMARY KEY (post_id, category_id),

            FOREIGN KEY (post_id) REFERENCES Posts(id),
            FOREIGN KEY (category_id) REFERENCES Categories(id)
        )

        CREATE TABLE IF NOT EXISTS Post_likes(
            user_id INTEGER NOT NULL,
            post_id INTEGER NOT NULL,

            PRIMARY KEY (user_id, post_id),

            FOREIGN KEY (user_id) REFERENCES Users(id),
            FOREIGN KEY (post_id) REFERENCES Posts(id)
        )

        CREATE TABLE IF NOT EXISTS Post_dislikes(
            user_id INTEGER NOT NULL,
            post_id INTEGER NOT NULL,

            PRIMARY KEY (user_id, post_id),

            FOREIGN KEY (user_id) REFERENCES Users(id),
            ROREIGN KEY (post_id) REFERENCES Posts(id)
        )

        CREATE TABLE IF NOT EXISTS Comments(
            id INTEGER PRIMARY KEY,
            user_id INTEGER NOT NULL,
            post_id INTEGER NOT NULL,
            content TEXT NOT NULL,

            FOREIGN KEY (user_id) REFERENCES Users(id),
            FOREIGN KEY (post_id) REFERENCES Posts(id)
        )

        CREATE TABLE IF NOT EXISTS Comment_likes(
            user_id INTEGER NOT NULL,
            comment_id INTEGER NOT NULL,

            PRIMAR KEY (user_id, comment_id),

            FOREIGN KEY (user_id) REFERENCES Users(id),
            FOREIGN KEY (comment_id) REFERENCES Comments(id)
        )

        CREATE TABLE IF NOT EXISTS Comment_dislikes(
            user_id INTEGER NOT NULL,
            comment_id INTEGER NOT NULL,

            PRIMARY KEY (user_id, comment_id),

            FOREIGN KEY (user_id) REFERENCES Users(id),
            FOREIGN KEY (comment_id) REFERENCES Comments(id)
        )
    `);
}

export default createdb;