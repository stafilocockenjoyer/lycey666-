// Инициализация Firebase
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
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();
const newsRef = db.ref('news');

let isAdminLoggedIn = false;
let newsItems = [];
const cache = {
    ticker: document.getElementById('newsTicker'),
    tickerContent: document.getElementById('tickerContent'),
    loginForm: document.getElementById('loginForm'),
    adminPanel: document.getElementById('adminPanel'),
    popupOverlay: document.getElementById('popupOverlay'),
    welcomePopup: document.getElementById('welcomePopup'),
    newsList: document.getElementById('newsList')
};

const clickbaitPhrases = [
    " — читать далее...", " — фулл тут...", " — смотри бесплатно...",
    " — шок-контент...", " — кликни сюда...", " — подробности внутри...",
    " — узнай больше...", " — не пропусти!"
];

function getRandomClickbait() {
    return clickbaitPhrases[Math.floor(Math.random() * clickbaitPhrases.length)];
}

function loadNewsFromFirebase() {
    newsRef.on('value', (snapshot) => {
        const data = snapshot.val();
        newsItems = [];
        const fragment = document.createDocumentFragment();
        if (data) {
            Object.keys(data).forEach(key => {
                const item = data[key];
                const h3 = document.createElement('h3');
                h3.innerHTML = `<a href="${item.link}" target="_blank">${item.text}${getRandomClickbait()}</a>`;
                h3.dataset.id = key;
                newsItems.push(h3);
                fragment.appendChild(h3);
            });
        } else {
            const initialNews = [
                { text: "Начало учебного года 2025", link: "https://lyceum-6.ru/news" },
                { text: "Олимпиада по математике", link: "https://lyceum-6.ru/olympiad" },
                { text: "День лицея 19 октября", link: "https://lyceum-6.ru/events" }
            ];
            initialNews.forEach(news => newsRef.push(news));
        }
        cache.tickerContent.innerHTML = '';
        cache.tickerContent.appendChild(fragment);
        updateNewsList();
    }, (error) => {
        console.error('Ошибка загрузки новостей:', error);
        alert('Не удалось загрузить новости: ' + error.message);
    });
}

function toggleTheme() {
    const body = document.body;
    const button = document.querySelector('.theme-toggle');
    body.classList.toggle('light');
    body.classList.toggle('dark');
    button.textContent = body.classList.contains('light') ? 'Тёмная тема' : 'Светлая тема';
}

function openTab(evt, tabName, groupName) {
    const tabContents = document.querySelectorAll(`.${groupName} .tab-content`);
    const tabButtons = document.querySelectorAll(`.${groupName} .tab-btn`);
    tabContents.forEach(content => content.classList.remove('active'));
    tabButtons.forEach(button => button.classList.remove('active'));
    document.getElementById(tabName).classList.add('active');
    evt.currentTarget.classList.add('active');
}

function scrollNews(distance) {
    const currentScroll = cache.ticker.scrollLeft;
    const contentWidth = cache.tickerContent.scrollWidth / 2;
    let targetScroll = currentScroll + distance;
    if (targetScroll >= contentWidth) targetScroll -= contentWidth;
    else if (targetScroll < 0) targetScroll += contentWidth;
    cache.ticker.scrollTo({ left: targetScroll, behavior: 'smooth' });
}

cache.tickerContent.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (link) window.open(link.href, '_blank');
});

document.addEventListener('DOMContentLoaded', () => {
    const groups = ['tab-group-1', 'tab-group-2', 'tab-group-3'];
    groups.forEach(group => document.querySelector(`.${group} .tab-btn`)?.click());
    loadNewsFromFirebase();
    auth.onAuthStateChanged(user => {
        isAdminLoggedIn = !!user;
        cache.adminPanel.classList.toggle('active', isAdminLoggedIn);
        document.querySelector('.login-btn').style.display = isAdminLoggedIn ? 'none' : 'block';
        if (isAdminLoggedIn) makeDraggableAndResizable(cache.adminPanel);
        updateNewsList();
    });
    showWelcomePopupForNewUsers();
});

function showWelcomePopupForNewUsers() {
    if (!document.cookie.includes('hasVisited=true')) {
        cache.welcomePopup.classList.add('active');
        cache.popupOverlay.classList.add('active');
        document.body.classList.add('popup-active');
        document.cookie = 'hasVisited=true; max-age=31536000';
    }
}

function closePopup() {
    [cache.welcomePopup, cache.loginForm].forEach(el => el.classList.remove('active'));
    cache.popupOverlay.classList.remove('active');
    document.body.classList.remove('popup-active');
}

function showLoginForm() {
    cache.loginForm.classList.add('active');
    cache.popupOverlay.classList.add('active');
    document.body.classList.add('popup-active');
}

function login() {
    const email = cache.loginForm.querySelector('#loginInput').value.trim();
    const password = cache.loginForm.querySelector('#passwordInput').value.trim();
    const rememberMe = cache.loginForm.querySelector('#rememberMe').checked;

    if (!email || !password) {
        alert('Пожалуйста, введите email и пароль!');
        return;
    }

    auth.signInWithEmailAndPassword(email, password)
        .then(() => auth.setPersistence(rememberMe ? firebase.auth.Auth.Persistence.LOCAL : firebase.auth.Auth.Persistence.SESSION))
        .then(() => closePopup())
        .catch(error => {
            const errorMessages = {
                'auth/invalid-email': 'Неверный формат email.',
                'auth/user-not-found': 'Пользователь не найден.',
                'auth/wrong-password': 'Неверный пароль.',
                'auth/invalid-credential': 'Неверные учетные данные.'
            };
            alert('Ошибка входа: ' + (errorMessages[error.code] || error.message));
            console.error('Ошибка входа:', error);
        });
}

function addNews() {
    if (!isAdminLoggedIn) {
        alert('Войдите в админ-панель для редактирования!');
        return;
    }
    const newsText = cache.adminPanel.querySelector('#newsText').value.trim();
    const newsLink = cache.adminPanel.querySelector('#newsLink').value.trim();
    if (newsText && newsLink) {
        newsRef.push({ text: newsText, link: newsLink });
        cache.adminPanel.querySelector('#newsText').value = '';
        cache.adminPanel.querySelector('#newsLink').value = '';
    } else {
        alert('Введите текст новости и ссылку!');
    }
}

function updateNewsList() {
    const fragment = document.createDocumentFragment();
    newsItems.forEach((item, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = item.textContent.replace(/ — .+?$/, '').trim();
        fragment.appendChild(option);
    });
    cache.newsList.innerHTML = '';
    cache.newsList.appendChild(fragment);
}

function deleteNews() {
    if (!isAdminLoggedIn) {
        alert('Войдите в админ-панель для редактирования!');
        return;
    }
    const selectedIndex = cache.newsList.selectedIndex;
    if (selectedIndex === -1) {
        alert('Выберите новость для удаления!');
        return;
    }
    newsRef.child(newsItems[selectedIndex].dataset.id).remove();
}

function makeDraggableAndResizable(element) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    element.querySelector('h3').onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        element.style.top = (element.offsetTop - pos2) + "px";
        element.style.left = (element.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}