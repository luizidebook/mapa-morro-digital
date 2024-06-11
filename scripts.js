                        let map;
let currentLocation;
let routingControl;

function toggleMenu() {
    const menu = document.getElementById('menu');
    menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
}

function handleMenuClick(subMenuId) {
    const subMenu = document.getElementById(subMenuId);
    subMenu.style.display = subMenu.style.display === 'none' ? 'block' : 'none';
}

function showMessage(option, coordinates) {
    const messageBox = document.getElementById('message-box');
    messageBox.style.display = 'block';

    let message = '';
    switch (option) {
        case 'historia':
            message = `<p>Conheça a rica história de Morro de São Paulo, desde seus tempos coloniais até se tornar um dos destinos turísticos mais populares do Brasil. Morro de São Paulo é um dos locais mais históricos e fascinantes da Bahia, com uma mistura de influências culturais de portugueses, africanos e indígenas.</p>`;
            break;
        case 'tocaMorcego':
            message = `<p>A Toca do Morcego oferece uma experiência inesquecível com uma vista única para o pôr do sol mais bonito do Brasil. Localizado na subida para o Farol do Morro de São Paulo, a Toca do Morcego combina as melhores características de um bar, balada e restaurante.</p>
                       <p>Você pode desfrutar de coquetéis refrescantes enquanto aprecia a paisagem deslumbrante. A Toca do Morcego também é conhecida por suas festas temáticas e eventos especiais, tornando-se um ponto de encontro popular para turistas e locais.</p>`;
            break;
        case 'igrejaLuz':
            message = `<p>A Igreja Nossa Senhora da Luz é um marco histórico de Morro de São Paulo. Sua construção teve início em 1628 e é um exemplo significativo da arquitetura colonial portuguesa. A igreja abriga várias imagens sacras e é um local de peregrinação para muitos devotos. Além disso, a igreja oferece uma vista panorâmica deslumbrante da vila e do mar, tornando-se um local popular para fotos.</p>`;
            break;
        case 'pracaAureliano':
            message = `<p>A Praça Aureliano Lima é o coração da vila de Morro de São Paulo. Além de ser um ponto de encontro para os locais, a praça é cercada por lojas de artesanato, restaurantes e bares. À noite, a praça ganha vida com a feirinha de artesanato, onde você pode comprar lembranças únicas e apreciar apresentações de artistas locais.</p>`;
            break;
        case 'farolMorro':
            message = `<p>O Farol do Morro é um dos pontos mais icônicos de Morro de São Paulo. Construído em 1855, o farol oferece uma vista panorâmica espetacular das praias e do oceano. É um ótimo lugar para observar o pôr do sol e tirar fotos incríveis. A subida até o farol é uma pequena aventura, mas vale a pena pela vista.</p>`;
            break;
        case 'miranteTirolesa':
            message = `<p>O Mirante da Tirolesa é um ponto turístico imperdível em Morro de São Paulo. Oferece uma vista deslumbrante do alto, permitindo aos visitantes ver a beleza natural da região de uma perspectiva única. Para os mais aventureiros, a tirolesa é uma atividade emocionante que proporciona uma experiência inesquecível.</p>`;
            break;
        case 'fortalezaTapirandu':
            message = `<p>A Fortaleza de Tapirandú é uma construção histórica importante em Morro de São Paulo. Construída no século XVII, a fortaleza serviu para proteger a ilha de invasões. Hoje, suas ruínas são um local fascinante para explorar, com vistas panorâmicas do mar e da ilha.</p>`;
            break;
        case 'paredaoArgila':
            message = `<p>O Paredão da Argila é conhecido por suas propriedades terapêuticas e beleza natural. Localizado na Praia da Gamboa, o paredão oferece banhos de argila que, segundo os moradores, têm propriedades rejuvenescedoras para a pele. É um passeio ideal para quem quer relaxar e se conectar com a natureza.</p>`;
            break;
        case 'voltaIlha':
            message = `<p>O passeio Volta à Ilha é uma das atividades mais populares em Morro de São Paulo. Inclui várias paradas em piscinas naturais e ilhas, como Garapuá e Moreré, onde você pode nadar em águas cristalinas e observar a vida marinha. É uma ótima maneira de explorar a beleza natural da região.</p>`;
            break;
        case 'quadricicloGarapua':
            message = `<p>O passeio de quadriciclo para Garapuá é uma aventura emocionante que leva você por trilhas e praias deslumbrantes. É uma ótima opção para quem gosta de adrenalina e quer explorar lugares mais isolados e tranquilos.</p>`;
            break;
        case '4x4Garapua':
            message = `<p>O passeio 4x4 para Garapuá é ideal para quem busca aventura e conforto ao mesmo tempo. A bordo de veículos robustos, você explorará praias e trilhas incríveis, com paradas estratégicas para fotos e relaxamento. É uma experiência inesquecível para amantes de aventura.</p>`;
            break;
        case 'lanchaGamboa':
            message = `<p>A viagem de lancha para Gamboa é uma das atividades mais relaxantes e cênicas em Morro de São Paulo. Com paradas em locais paradisíacos, como a Ilha do Caitá e a Praia da Argila, você poderá desfrutar de um dia cheio de natureza e tranquilidade.</p>`;
            break;
        case 'primeiraPraia':
            message = `<p>A Primeira Praia é a menor e mais movimentada de Morro de São Paulo. Popular entre os surfistas por suas boas ondas, é o lugar perfeito para quem gosta de esportes aquáticos e atividades mais agitadas.</p>`;
            break;
        case 'segundaPraia':
            message = `<p>A Segunda Praia é conhecida por sua vida noturna vibrante e festas à beira-mar. Durante o dia, é um ótimo lugar para relaxar, tomar sol e nadar em suas águas calmas e cristalinas.</p>`;
            break;
        case 'terceiraPraia':
            message = `<p>A Terceira Praia é tranquila e ideal para quem busca paz e sossego. Suas águas calmas são perfeitas para snorkel e mergulho, oferecendo uma rica vida marinha para explorar.</p>`;
            break;
        case 'quartaPraia':
            message = `<p>A Quarta Praia é famosa por suas piscinas naturais formadas durante a maré baixa. É o lugar ideal para famílias e para quem quer relaxar em um ambiente mais tranquilo e isolado.</p>`;
            break;
        case 'quintaPraia':
            message = `<p>A Quinta Praia, também conhecida como Praia do Encanto, é um verdadeiro paraíso escondido. Com poucas estruturas turísticas, oferece uma experiência mais selvagem e intocada, perfeita para quem busca tranquilidade absoluta.</p>`;
            break;
        case 'tocaMorcegoFesta':
            message = `<p>Se você busca diversão, muita gente bonita e energia contagiante, a Festa Sextou na Toca do Morcego é o lugar perfeito. Com uma combinação de música eletrônica, brasilidades e uma vista deslumbrante, é a melhor opção para uma noite inesquecível.</p>`;
            break;
        case 'restauranteAromas':
            message = `<p>O Restaurante Aromas oferece uma culinária deliciosa e ambiente aconchegante, perfeito para refeições em família ou a dois. É conhecido por seus pratos regionais e atendimento impecável.</p>`;
            break;
     case 'restauranteCasaVila':
            message = `<p>O Restaurante Casa da Vila é famoso por seu ambiente acolhedor e pratos saborosos, proporcionando uma experiência gastronômica única. Ideal para quem deseja experimentar a culinária local.</p>`;
            break;
        case 'sambassCafe':
            message = `<p>O Sambass Café é um lugar vibrante e animado, ideal para quem busca boa comida e música ao vivo. Localizado na Segunda Praia, é perfeito para jantar e curtir a noite.</p>`;
            break;
        case 'buddaBeach':
            message = `<p>Budda Beach oferece um ambiente relaxante com vista para o mar, perfeito para refeições descontraídas. É uma ótima escolha para quem quer desfrutar de uma refeição deliciosa com uma bela paisagem.</p>`;
            break;
        case 'funny':
            message = `<p>Funny é o lugar perfeito para quem busca diversão e boa comida, com uma atmosfera descontraída e amigável. Ideal para grupos de amigos e famílias.</p>`;
            break;
        case 'pousada1':
            message = `<p>A Pousada Minha Louca Paixão oferece um ambiente acolhedor e serviços de qualidade para uma estadia confortável em Morro de São Paulo. Possui uma localização privilegiada perto das praias.</p>`;
            break;
        case 'pousada2':
            message = `<p>A Pousada Natureza é conhecida pelo seu serviço excelente e localização privilegiada, ideal para relaxar e explorar a região. Oferece acomodações confortáveis e um ambiente tranquilo.</p>`;
            break;
        case 'pousada3':
            message = `<p>A Pousada Caeira oferece vistas deslumbrantes e acomodações confortáveis, perfeita para uma estadia tranquila. É ideal para casais e famílias que buscam conforto e privacidade.</p>`;
            break;
        case 'pousada4':
            message = `<p>A Pousada Bahia 10 é ideal para famílias e casais, com instalações modernas e atendimento de qualidade. Oferece uma experiência de hospedagem única em Morro de São Paulo.</p>`;
            break;
        case 'lojas':
            message = `<p>Descubra as lojas e comércios locais onde você pode encontrar lembranças únicas e produtos regionais. Uma maneira de explorar essas opções é andar pela vila e verificar as lojas especializadas em suvenires ecológicos, artesanato local, roupas, acessórios e muito mais.</p>`;
            break;
        case 'dicas':
            message = `<p>Confira dicas úteis para aproveitar ao máximo sua estadia em Morro de São Paulo:</p>
                       <p>1. A ilha é bastante segura, curta tranquilo dia e noite.</p>
                       <p>2. À noite, leve uma lanterninha ou garanta a bateria do celular para caminhar com mais segurança nas praias.</p>
                       <p>3. As piscinas naturais são incríveis, visite-as durante a maré baixa.</p>
                       <p>4. Há médicos particulares, um posto de saúde público e duas farmácias em Morro de São Paulo. O hospital mais próximo fica em Valença.</p>
                       <p>5. Não perca o pôr do sol na Toca do Morcego, eleito como o melhor do Brasil.</p>`;
            break;
        case 'emergencias':
            message = `<p>Encontre aqui informações importantes de contatos de emergência:</p>
                       <p>AMBULÂNCIA: 75-99894-5017</p>
                       <p>UNIDADE BÁSICA DE SAÚDE: 75-3652-1798</p>
                       <p>POLÍCIA CIVIL EM MORRO DE SP: 75-3652-1645</p>
                       <p>POLICIA MILITAR EM MORRO DE SP: 75-99925-0856</p>`;
            break;
        case 'sobre':
            message = `<p>Saiba mais sobre a Morro Digital e como estamos transformando a experiência turística em Morro de São Paulo com tecnologia e inovação.</p>
                       <p>Morro Digital é uma empresa que criou um guia turístico virtual utilizando inteligência artificial para oferecer uma experiência turística excepcional em Morro de São Paulo, na Bahia.</p>
                       <p>Nosso objetivo é proporcionar aos turistas e moradores locais acesso fácil e rápido a informações sobre a cidade, sua história, atrações, gastronomia, compras e serviços de emergência.</p>
                       <p>Com tecnologia avançada e uma ampla base de dados, Morro Digital se torna um guia confiável e personalizado para todos.</p>
                       <p>Além de um assistente virtual, somos parceiros estratégicos para contribuir com o turismo, melhorar a experiência do usuário e fortalecer a economia local e regional.</p>`;
            break;
        default:
            message = '<p>Opção não encontrada. Por favor, selecione outra opção no menu.</p>';
            break;
    }

    messageBox.innerHTML = message;

    if (coordinates) {
        showRoute(coordinates);
    }
}

function showRoute(destination) {
    if (routingControl) {
        map.removeControl(routingControl);
    }

    routingControl = L.Routing.control({
        waypoints: [
            L.latLng(currentLocation.latitude, currentLocation.longitude),
            L.latLng(destination[0], destination[1])
        ],
        router: L.Routing.osrmv1({
            serviceUrl: 'https://router.project-osrm.org/route/v1'
        }),
        geocoder: L.Control.Geocoder.nominatim(),
        createMarker: function() { return null; },
        routeWhileDragging: true
    }).addTo(map);
}

navigator.geolocation.getCurrentPosition(async function(position) {
    currentLocation = position.coords;

    map = L.map('map').setView([currentLocation.latitude, currentLocation.longitude], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    L.marker([currentLocation.latitude, currentLocation.longitude]).addTo(map)
        .bindPopup('Você está aqui!')
        .openPopup();

    document.getElementById('loading').style.display = 'none';

    initMenuOptions();
}, function() {
    document.getElementById('loading').innerHTML = 'Não foi possível obter sua localização.';
});

async function fetchOSMData(query) {
    const url = `https://overpass-api.de/api/interpreter?data=${query}`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
}

function displayOSMData(data, subMenuId) {
    const subMenu = document.getElementById(subMenuId);
    data.elements.forEach(element => {
        if (element.type === 'node') {
            const btn = document.createElement('button');
            btn.className = 'submenu-btn';
            btn.textContent = element.tags.name || 'Local sem nome';
            btn.onclick = () => showMessage(btn.textContent, [element.lat, element.lon]);
            subMenu.appendChild(btn);
        }
    });
}

function initMenuOptions() {
    const queries = {
        pontosTuristicosSubMenu: `[out:json];node["tourism"="attraction"](around:5000,-13.376,-38.913);out body;`,
        passeiosSubMenu: `[out:json];node["tourism"="information"](around:5000,-13.376,-38.913);out body;`,
        praiasSubMenu: `[out:json];node["natural"="beach"](around:5000,-13.376,-38.913);out body;`,
        vidaNoturnaSubMenu: `[out:json];node["amenity"="nightclub"](around:5000,-13.376,-38.913);out body;`,
        restaurantesSubMenu: `[out:json];node["amenity"="restaurant"](around:5000,-13.376,-38.913);out body;`,
        pousadasSubMenu: `[out:json];node["tourism"="hotel"](around:5000,-13.376,-38.913);out body;`
    };

    for (const [subMenuId, query] of Object.entries(queries)) {
        fetchOSMData(query).then(data => displayOSMData(data, subMenuId));
    }
}
