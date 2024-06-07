// scripts.js

// Inicialização do mapa
var map = L.map('map').setView([-13.385, -38.916], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

L.marker([-13.385, -38.916]).addTo(map)
    .bindPopup('Morro de São Paulo, Bahia')
    .openPopup();

function addMarker(lat, lon, description) {
    L.marker([lat, lon]).addTo(map)
        .bindPopup(description)
        .openPopup();
}

// Função para iniciar o tutorial
function startTutorial() {
    document.getElementById('welcome-message').style.display = 'none';
    document.getElementById('tutorial').style.display = 'block';
}

// Função para fechar a mensagem de boas-vindas
function closeWelcomeMessage() {
    document.getElementById('welcome-message').style.display = 'none';
}

// Função para ir para o próximo passo do tutorial
function nextTutorialStep(step) {
    document.querySelectorAll('.tutorial-step').forEach(function (element) {
        element.classList.remove('active');
    });
    document.getElementById('tutorial-step-' + step).classList.add('active');
}

// Função para iniciar o questionário
function startQuestionnaire() {
    document.getElementById('tutorial').style.display = 'none';
    document.getElementById('questionnaire').style.display = 'block';
}

// Função para ir para o próximo passo do questionário
function nextQuestionStep(step) {
    document.querySelectorAll('.question-step').forEach(function (element) {
        element.classList.remove('active');
    });
    document.getElementById('question-step-' + step).classList.add('active');
}

function previousQuestionStep(step) {
    document.querySelectorAll('.question-step').forEach(function (element) {
        element.classList.remove('active');
    });
    document.getElementById('question-step-' + step).classList.add('active');
}

// Função para enviar e ir para a próxima pergunta
function submitAndNext(step) {
    submitForm();
    nextQuestionStep(step);
}

// Função para enviar o questionário e exibir o roteiro personalizado
function submitQuestionnaire() {
    submitForm();
    var preferences = JSON.parse(localStorage.getItem('userPreferences'));
    generateRouteSummary(preferences);
    document.getElementById('questionnaire').style.display = 'none';
    document.getElementById('route-summary').style.display = 'block';
}

// Função para enviar os dados do formulário
function submitForm() {
    var formData = new FormData(document.getElementById('questionnaire-form'));
    var data = {};
    formData.forEach((value, key) => {
        if (data[key]) {
            if (!Array.isArray(data[key])) {
                data[key] = [data[key]];
            }
            data[key].push(value);
        } else {
            data[key] = value;
        }
    });

    axios.post('/save-data', data)
        .then(response => {
            console.log('Dados enviados com sucesso:', response);
            localStorage.setItem('userPreferences', JSON.stringify(data));
            updatePoints(10); // Ganhe pontos ao completar o formulário
        })
        .catch(error => {
            console.error('Erro ao enviar os dados:', error);
        });
}

// Função para gerar o resumo do roteiro
function generateRouteSummary(preferences) {
    var routeContent = document.getElementById('route-content');
    routeContent.innerHTML = '<p>Roteiro personalizado para ' + preferences.nome + ':</p>';
    routeContent.innerHTML += '<p>Atividades:</p><ul>';

    if (preferences.activities) {
        preferences.activities.forEach(function (activity) {
            routeContent.innerHTML += '<li>' + activity + '</li>';
        });
    }
    routeContent.innerHTML += '</ul>';
}

// Função para iniciar o tour guiado
function startMapTour() {
    document.getElementById('route-summary').style.display = 'none';
    document.getElementById('map-tour').style.display = 'block';
    generateMapTour();
}

// Função para gerar o tour guiado
function generateMapTour() {
    var preferences = JSON.parse(localStorage.getItem('userPreferences'));
    var tourContent = document.getElementById('tour-content');

    tourContent.innerHTML = '<p>Tour guiado para ' + preferences.nome + ':</p>';
    tourContent.innerHTML += '<p>Atividades:</p><ul>';

    if (preferences.activities) {
        preferences.activities.forEach(function (activity) {
            tourContent.innerHTML += '<li>' + activity + '</li>';
        });
    }
    tourContent.innerHTML += '</ul>';
}

// Função para ir para o próximo passo do tour guiado
function nextTourStep() {
    // Lógica para mostrar o próximo passo do tour
}

// Função para ir para o passo anterior do tour guiado
function previousTourStep() {
    // Lógica para mostrar o passo anterior do tour
}

// Função para encerrar o tour guiado
function endTour() {
    document.getElementById('map-tour').style.display = 'none';
}

// Função para mostrar a caixa de pesquisa
function showSearchBox() {
    document.getElementById('search-box').style.display = 'block';
}

// Função para pesquisar no mapa
function searchMap(query) {
    if (!query) {
        query = document.getElementById('search-input').value;
    }
    axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&addressdetails=1`)
        .then(function (response) {
            var results = response.data;
            var searchResults = document.getElementById('search-results');
            searchResults.innerHTML = '';
            results.forEach(function (result) {
                var li = document.createElement('li');
                li.textContent = result.display_name;
                li.onclick = function () {
                    map.setView([result.lat, result.lon], 15);
                    addMarker(result.lat, result.lon, result.display_name);
                };
                searchResults.appendChild(li);
            });
        });
}

// Função para alternar o menu flutuante
function toggleMenu() {
    var menuItems = document.getElementById('menu-items');
    if (menuItems.style.display === 'none' || menuItems.style.display === '') {
        menuItems.style.display = 'block';
    } else {
        menuItems.style.display = 'none';
    }
}

// Funções para mostrar informações no menu
function showHospedagem() {
    searchMap('Hospedagem em Morro de São Paulo');
}

function showPontosTuristicos() {
    searchMap('Pontos turísticos em Morro de São Paulo');
}

function showRestaurantes() {
    searchMap('Restaurantes em Morro de São Paulo');
}

function showPasseios() {
    searchMap('Passeios em Morro de São Paulo');
}

function showEventos() {
    searchMap('Eventos e festas em Morro de São Paulo');
}

function showIngressos() {
    searchMap('Compra de ingressos em Morro de São Paulo');
}

function showSuporte() {
    alert('Para suporte, entre em contato pelo email suporte@morrodigital.com');
}

function showConfiguracoes() {
    alert('Configurações ainda não implementadas.');
}

// Inicializar o menu flutuante
document.addEventListener('DOMContentLoaded', function () {
    var menuButton = document.createElement('button');
    menuButton.textContent = '+';
    menuButton.classList.add('menu-button');
    menuButton.onclick = toggleMenu;
    document.body.appendChild(menuButton);

    var submenu = document.createElement('div');
    submenu.classList.add('submenu');
    submenu.setAttribute('id', 'menu-items');
    submenu.style.display = 'none';
    submenu.innerHTML = `
        <button onclick="startQuestionnaire()">Criar Roteiro</button>
        <button onclick="showHospedagem()">Hospedagem</button>
        <button onclick="showPontosTuristicos()">Pontos Turísticos</button>
        <button onclick="showRestaurantes()">Restaurantes</button>
        <button onclick="showPasseios()">Passeios</button>
        <button onclick="showEventos()">Eventos e Festas</button>
        <button onclick="showIngressos()">Comprar Ingressos</button>
        <button onclick="showSuporte()">Suporte</button>
        <button onclick="showConfiguracoes()">Configurações</button>
    `;
    document.body.appendChild(submenu);
    setupPushNotifications();
    loadDailyChallenge();
    loadLeaderboard();
    loadUserBadges();
});

// Função para atualizar pontos
function updatePoints(points) {
    let currentPoints = parseInt(localStorage.getItem('userPoints') || '0');
    currentPoints += points;
    localStorage.setItem('userPoints', currentPoints);
    document.getElementById('points-display').innerText = `Pontos: ${currentPoints}`;
    showNotification(`Você ganhou ${points} pontos!`);
}

// Função para conceder badges
function awardBadge(badge) {
    let badges = JSON.parse(localStorage.getItem('userBadges') || '[]');
    if (!badges.includes(badge)) {
        badges.push(badge);
        localStorage.setItem('userBadges', JSON.stringify(badges));
        showNotification(`Você ganhou o badge: ${badge}!`);
        updateBadgesDisplay();
    }
}

// Função para mostrar notificações
function showNotification(message) {
    alert(message);
}

// Função para carregar desafios diários
function loadDailyChallenge() {
    // Simulação de desafio diário
    document.getElementById('daily-challenge').innerText = "Desafio Diário: Visite a Primeira Praia";
}

// Função para carregar leaderboard
function loadLeaderboard() {
    // Simulação de leaderboard
    axios.get('/leaderboard')
        .then(response => {
            const leaderboard = response.data;
            let leaderboardHtml = '<h2>Leaderboard</h2><ul>';
            leaderboard.forEach(user => {
                leaderboardHtml += `<li>${user.name} - ${user.points} pontos</li>`;
            });
            leaderboardHtml += '</ul>';
            document.getElementById('leaderboard').innerHTML = leaderboardHtml;
        });
}

// Função para carregar badges do usuário
function loadUserBadges() {
    const badges = JSON.parse(localStorage.getItem('userBadges') || '[]');
    let badgesHtml = '<h2>Seus Badges</h2><ul>';
    badges.forEach(badge => {
        badgesHtml += `<li>${badge}</li>`;
    });
    badgesHtml += '</ul>';
    document.getElementById('badges-display').innerHTML = badgesHtml;
}

// Função para configurar notificações push
function setupPushNotifications() {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
        navigator.serviceWorker.register('service-worker.js')
            .then(registration => {
                return registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: 'YOUR_PUBLIC_VAPID_KEY'
                });
            })
            .then(subscription => {
                console.log('Inscrito para notificações push:', subscription);
            })
            .catch(error => console.error('Erro ao registrar Service Worker ou inscrever para notificações push:', error));
    }
}