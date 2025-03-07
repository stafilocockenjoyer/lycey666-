// Конфигурация Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAkoQTZ5pG6v_yjFvj_-HJagLQl3F0jZ80",
    authDomain: "lycey666.firebaseapp.com",
    databaseURL: "https://lycey666-default-rtdb.firebaseio.com",
    projectId: "lycey666",
    storageBucket: "lycey666.firebasestorage.app",
    messagingSenderId: "243803681189",
    appId: "1:243803681189:web:e35a1b402a76ba2d87784c",
    measurementId: "G-DYXLMY1C2L"
};

// Инициализация Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();
const newsRef = db.ref('news');

// Глобальные переменные
let isAdminLoggedIn = false;
let newsItems = [];
const ticker = document.getElementById('newsTicker');
const tickerContent = document.getElementById('tickerContent');

// Список кликбейт-фраз для новостей
const clickbaitPhrases = [
    " — читать далее...", " — фулл тут...", " — смотри бесплатно...",
    " — шок-контент...", " — кликни сюда...", " — подробности внутри...",
    " — узнай больше...", " — не пропусти!"
];

// Функция для получения случайной кликбейт-фразы
const getRandomClickbait = () => clickbaitPhrases[Math.floor(Math.random() * clickbaitPhrases.length)];

// Загрузка новостей из Firebase с fallback
function loadNewsFromFirebase() {
    newsRef.on('value', (snapshot) => {
        const data = snapshot.val();
        newsItems = [];
        tickerContent.innerHTML = '';
        if (data) {
            Object.keys(data).forEach(key => {
                const item = data[key];
                const h3 = document.createElement('h3');
                h3.innerHTML = `<a href="${item.link}" target="_blank">${item.text}${getRandomClickbait()}</a>`;
                h3.dataset.id = key;
                newsItems.push(h3);
                tickerContent.appendChild(h3);
            });
        } else {
            console.log('База данных пуста, добавляю начальные новости');
            const initialNews = [
                { text: "Начало Всероссийской олимпиады 2025", link: "http://www.lyceum-6.edusite.ru/p1aa1.html" },
                { text: "Победа в 'Учитель года 2025'", link: "http://www.lyceum-6.edusite.ru/news/p11aa1.html" },
                { text: "День здоровья 25 марта", link: "http://www.lyceum-6.edusite.ru/news/p11aa1.html" },
                { text: "Выставка проектов 30 марта", link: "http://www.lyceum-6.edusite.ru/news/p11aa1.html" },
                { text: "Обновление кабинета алтайского языка", link: "http://www.lyceum-6.edusite.ru/news/p11aa1.html" }
            ];
            initialNews.forEach(news => newsRef.push(news));
        }
        updateTickerContent();
        updateNewsList();
    }, (error) => {
        console.error('Ошибка загрузки новостей:', error);
        alert('Не удалось загрузить новости из Firebase. Использую локальный fallback.');
        tickerContent.innerHTML = '';
        const fallbackNews = [
            { text: "Начало олимпиады", link: "#" },
            { text: "День открытых дверей", link: "#" }
        ];
        fallbackNews.forEach(news => {
            const h3 = document.createElement('h3');
            h3.innerHTML = `<a href="${news.link}">${news.text}</a>`;
            tickerContent.appendChild(h3);
        });
    });
}

// Переключение темы
function toggleTheme() {
    const body = document.body;
    const button = document.querySelector('.theme-toggle');
    if (body.classList.contains('light')) {
        body.classList.replace('light', 'dark');
        button.textContent = 'Светлая тема';
    } else {
        body.classList.replace('dark', 'light');
        button.textContent = 'Тёмная тема';
    }
}

// Открытие вкладок
function openTab(event, tabId, group) {
    const tabContents = document.querySelectorAll(`#${group} .tab-content`);
    const tabButtons = document.querySelectorAll(`#${group} .tab-btn`);
    tabContents.forEach(content => content.classList.remove('active'));
    tabButtons.forEach(button => button.classList.remove('active'));
    if (tabId === 'close') {
        // Сброс всех вкладок
        document.querySelector(`#${group} .tab-btn`).classList.add('active');
        document.querySelector(`#${group} .tab-content`).classList.add('active');
    } else {
        document.getElementById(tabId).classList.add('active');
        event.target.classList.add('active');
    }
}

function openInnerTab(event, tabId, group) {
    const tabContents = document.querySelectorAll(`#${group} .tab-content`);
    const tabButtons = document.querySelectorAll(`#${group} .inner-tabs .tab-btn`);
    tabContents.forEach(content => content.classList.remove('active'));
    tabButtons.forEach(button => button.classList.remove('active'));
    if (tabId === 'close') {
        // Сброс внутренних вкладок
        document.querySelector(`#${group} .inner-tabs .tab-btn`).classList.add('active');
        document.querySelector(`#${group} .tab-content`).classList.add('active');
    } else {
        document.getElementById(tabId).classList.add('active');
        event.target.classList.add('active');
    }
}

// Закрытие вкладок
function closeTabs(group) {
    openTab({ target: document.querySelector(`#${group} .tab-btn`) }, 'close', group);
}

function closeInnerTabs(group) {
    openInnerTab({ target: document.querySelector(`#${group} .inner-tabs .tab-btn`) }, 'close', group);
}

// Прокрутка новостей
function scrollNews(distance) {
    const currentScroll = ticker.scrollLeft;
    const contentWidth = tickerContent.scrollWidth / 2;
    let targetScroll = currentScroll + distance;
    if (targetScroll >= contentWidth) targetScroll -= contentWidth;
    else if (targetScroll < 0) targetScroll += contentWidth;
    ticker.scrollTo({ left: targetScroll, behavior: 'smooth' });
}

// Обработка кликов по новостям
tickerContent.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (link) window.open(link.href, '_blank');
});

// Показ формы логина
function showLoginForm() {
    document.getElementById('loginForm').classList.add('active');
    document.getElementById('popupOverlay').classList.add('active');
    document.body.classList.add('popup-active');
}

// Закрытие формы логина
function closeLoginForm() {
    document.getElementById('loginForm').classList.remove('active');
    document.getElementById('popupOverlay').classList.remove('active');
    document.body.classList.remove('popup-active');
}

// Логин администратора (с упрощённым вариантом для теста)
function login() {
    const email = document.getElementById('loginInput').value.trim();
    const password = document.getElementById('passwordInput').value.trim();
    const rememberMe = document.getElementById('rememberMe').checked;

    if (!email || !password) return alert('Пожалуйста, введите email и пароль!');

    // Упрощённый вход для теста
    if (email === 'admin' && password === '123') {
        isAdminLoggedIn = true;
        closeLoginForm();
        document.getElementById('adminPanel').classList.add('active');
        document.querySelector('.login-btn').style.display = 'none';
        makeDraggableAndResizable(document.getElementById('adminPanel'));
        updateNewsList();
        return;
    }

    auth.signInWithEmailAndPassword(email, password)
        .then(() => {
            auth.setPersistence(rememberMe ? firebase.auth.Auth.Persistence.LOCAL : firebase.auth.Auth.Persistence.SESSION);
            isAdminLoggedIn = true;
            closeLoginForm();
            document.getElementById('adminPanel').classList.add('active');
            document.querySelector('.login-btn').style.display = 'none';
            makeDraggableAndResizable(document.getElementById('adminPanel'));
            updateNewsList();
        })
        .catch(error => {
            let errorMessage = 'Ошибка входа: ';
            switch (error.code) {
                case 'auth/invalid-email': errorMessage += 'Неверный формат email.'; break;
                case 'auth/user-not-found': errorMessage += 'Пользователь не найден. Зарегистрируйте email (например, admin@lyceum-6.ru) в Firebase Console.'; break;
                case 'auth/wrong-password': errorMessage += 'Неверный пароль.'; break;
                case 'auth/invalid-credential': errorMessage += 'Неверные учетные данные.'; break;
                default: errorMessage += error.message;
            }
            alert(errorMessage);
            console.error('Ошибка входа:', error);
        });
}

// Задать вопрос
function submitQuestion() {
    const question = document.querySelector('.question-form textarea').value;
    if (question) alert('Вопрос отправлен: ' + question);
    else alert('Введите вопрос!');
}

// Добавление новости
function addNews() {
    if (!isAdminLoggedIn) return alert('Войдите в админ-панель для редактирования!');
    const newsText = document.getElementById('newsText').value.trim();
    const newsLink = document.getElementById('newsLink').value.trim();
    if (!newsText || !newsLink) return alert('Введите текст новости и ссылку!');
    newsRef.push({ text: newsText, link: newsLink });
    document.getElementById('newsText').value = '';
    document.getElementById('newsLink').value = '';
}

// Удаление новости
function deleteNews() {
    if (!isAdminLoggedIn) return alert('Войдите в админ-панель для редактирования!');
    const newsList = document.getElementById('newsList');
    const selectedIndex = newsList.selectedIndex;
    if (selectedIndex === -1) return alert('Выберите новость для удаления!');
    const itemId = newsItems[selectedIndex].dataset.id;
    newsRef.child(itemId).remove();
}

// Обновление содержимого тикера
function updateTickerContent() {
    tickerContent.innerHTML += tickerContent.innerHTML; // Дублируем контент для бесконечной прокрутки
    ticker.scrollLeft = 0;
}

// Обновление списка новостей в админ-панели
function updateNewsList() {
    const newsList = document.getElementById('newsList');
    newsList.innerHTML = '';
    newsItems.forEach((item, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = item.textContent.replace(/ — .+?$/, '').trim();
        newsList.appendChild(option);
    });
}

// Показ попапа для новых пользователей
function showWelcomePopupForNewUsers() {
    if (!document.cookie.includes('hasVisited=true')) {
        document.getElementById('welcomePopup').classList.add('active');
        document.getElementById('popupOverlay').classList.add('active');
        document.body.classList.add('popup-active');
        document.cookie = 'hasVisited=true; max-age=31536000';
    }
}

// Закрытие попапа с обновлениями
function closeWelcomePopup() {
    document.getElementById('welcomePopup').classList.remove('active');
    document.getElementById('popupOverlay').classList.remove('active');
    document.body.classList.remove('popup-active');
}

// Сделать элемент перетаскиваемым и изменяемым по размеру
function makeDraggableAndResizable(element) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    const header = element.querySelector('h3');
    header.onmousedown = (e) => {
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = () => { document.onmouseup = null; document.onmousemove = null; };
        document.onmousemove = (e) => {
            e.preventDefault();
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            element.style.top = (element.offsetTop - pos2) + "px";
            element.style.left = (element.offsetLeft - pos1) + "px";
        };
    };
}

// Переключение боковых панелей
function toggleSidebar(id) {
    document.getElementById(id).classList.toggle('active');
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    const groups = ['tab-group-1', 'tab-group-2', 'tab-group-3', 'tab-group-4', 'tab-group-5'];
    groups.forEach(group => document.querySelector(`#${group} .tab-btn`).click());
    loadNewsFromFirebase();
    auth.onAuthStateChanged(user => {
        isAdminLoggedIn = !!user;
        const adminPanel = document.getElementById('adminPanel');
        const loginBtn = document.querySelector('.login-btn');
        if (user) {
            adminPanel.classList.add('active');
            loginBtn.style.display = 'none';
            makeDraggableAndResizable(adminPanel);
            updateNewsList();
        } else {
            adminPanel.classList.remove('active');
            loginBtn.style.display = 'block';
        }
    });
    showWelcomePopupForNewUsers();
});