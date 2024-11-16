let db;

// 初期化
async function init() {
    const SQL = await initSqlJs({
        locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
    });

    // ローカルストレージからデータベースを読み込みまたは新規作成
    if (localStorage.getItem("commentsDB")) {
        const binaryArray = new Uint8Array(atob(localStorage.getItem("commentsDB")).split("").map(char => char.charCodeAt(0)));
        db = new SQL.Database(binaryArray);
    } else {
        db = new SQL.Database();
        db.run(`CREATE TABLE IF NOT EXISTS comments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            message TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );`);
    }

    // イベントリスナーを設定
    document.getElementById("comment-form").addEventListener("submit", addComment);

    // 既存のコメントを表示
    renderComments();
}

// コメントの追加
function addComment(event) {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const message = document.getElementById("message").value.trim();

    if (username && message) {
        db.run("INSERT INTO comments (username, message) VALUES (?, ?)", [username, message]);
        saveDatabase(); // データベースをローカルストレージに保存
        renderComments();
        document.getElementById("comment-form").reset();
    }
}

// コメントを表示
function renderComments() {
    const commentsContainer = document.getElementById("comments");
    commentsContainer.innerHTML = "";

    const results = db.exec("SELECT * FROM comments ORDER BY created_at DESC");

    if (results.length > 0) {
        const rows = results[0].values;
        rows.forEach(([id, username, message, createdAt]) => {
            const commentDiv = document.createElement("div");
            commentDiv.className = "comment";
            commentDiv.innerHTML = `
                <p class="name">${username}</p>
                <p>${message}</p>
                <a href="">削除</a>
                <small>${new Date(createdAt).toLocaleString()}</small>
            `;
            commentsContainer.appendChild(commentDiv);
            
        });
    }
}
   // コメントを表示する関数
   function UsernameComments(date) {
    const commentsContainer = document.getElementById("comments");
    commentsContainer.innerHTML = "";  // 初期化

    // 日付で絞り込むSQLクエリ
    const query = `
      SELECT * FROM comments 
      WHERE created_at LIKE ? 
      ORDER BY created_at DESC
    `;
    const stmt = db.prepare(query);
    stmt.bind([`${date}%`]);  // 日付の部分一致検索
    const results = stmt.getAsObject(); // 結果を取得

    if (results.length > 0) {
        results.forEach(([id, username, message, createdAt]) => {
            const commentDiv = document.createElement("div");
            commentDiv.className = "comment";
            commentDiv.innerHTML = `
                <p class="name">${username}</p>
                <p>${message}</p>
                <a href="#" class="delete" data-id="${id}">削除</a>
                <small>${new Date(createdAt).toLocaleString()}</small>
            `;
            commentsContainer.appendChild(commentDiv);
        });
    } else {
        commentsContainer.innerHTML = "<p>この日付のコメントはありません。</p>";
    }
}

// データベースをローカルストレージに保存する関数
function saveDatabase() {
    const binaryArray = db.export();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(binaryArray)));
    localStorage.setItem("commentsDB", base64);
}

// 初期化関数を呼び出し
init();
