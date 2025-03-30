import { OPENROUTESERVICE_API_KEY } from '../core/constants.js';
import { map, markers } from '../core/state.js';

/**
 * searchLocation
 *    Realiza a busca de um local (via Nominatim) e, em seguida,
 *    obtém POIs correlatos via Overpass-API, usando sinônimos e queries definidas.
 */
export function searchLocation() {
  const apiKey = OPENROUTESERVICE_API_KEY; // ou sua const

  const queries = {
    restaurantes:
      '[out:json];node["amenity"="restaurant"](around:15000,-13.376,-38.913);out body;',
    pousadas:
      '[out:json];node["tourism"="hotel"](around:15000,-13.376,-38.913);out body;',
    lojas: '[out:json];node["shop"](around:15000,-13.376,-38.913);out body;',
    praias:
      '[out:json];node["natural"="beach"](around:15000,-13.376,-38.913);out body;',
    'pontos turísticos':
      '[out:json];node["tourism"="attraction"](around:10000,-13.376,-38.913);out body;',
    passeios:
      '[out:json];node["tourism"="information"](around:10000,-13.376,-38.913);out body;',
    festas:
      '[out:json];node["amenity"="nightclub"](around:10000,-13.376,-38.913);out body;',
    bares:
      '[out:json];node["amenity"="bar"](around:10000,-13.376,-38.913);out body;',
    cafés:
      '[out:json];node["amenity"="cafe"](around:10000,-13.376,-38.913);out body;',
    hospitais:
      '[out:json];node["amenity"="hospital"](around:10000,-13.376,-38.913);out body;',
    farmácias:
      '[out:json];node["amenity"="pharmacy"](around:10000,-13.376,-38.913);out body;',
    parques:
      '[out:json];node["leisure"="park"](around:10000,-13.376,-38.913);out body;',
    'postos de gasolina':
      '[out:json];node["amenity"="fuel"](around:10000,-13.376,-38.913);out body;',
    'banheiros públicos':
      '[out:json];node["amenity"="toilets"](around:10000,-13.376,-38.913);out body;',
    'caixas eletrônicos':
      '[out:json];node["amenity"="atm"](around:10000,-13.376,-38.913);out body;',
    emergências:
      '[out:json];node["amenity"~"hospital|police"](around:10000,-13.376,-38.913);out body;',
    dicas: '[out:json];node["tips"](around:10000,-13.376,-38.913);out body;',
    sobre: '[out:json];node["about"](around:10000,-13.376,-38.913);out body;',
    educação:
      '[out:json];node["education"](around:10000,-13.376,-38.913);out body;',
  };

  const synonyms = {
    restaurantes: [
      'restaurantes',
      'restaurante',
      'comida',
      'alimentação',
      'refeições',
      'culinária',
      'jantar',
      'almoço',
      'lanche',
      'bistrô',
      'churrascaria',
      'lanchonete',
      'restarante',
      'restaurnte',
      'restaurente',
      'restaurantr',
      'restaurnate',
      'restauranta',
    ],
    pousadas: [
      'pousadas',
      'pousada',
      'hotéis',
      'hotel',
      'hospedagem',
      'alojamento',
      'hostel',
      'residência',
      'motel',
      'resort',
      'abrigo',
      'estadia',
      'albergue',
      'pensão',
      'inn',
      'guesthouse',
      'bed and breakfast',
      'bnb',
      'pousasa',
      'pousda',
      'pousdada',
    ],
    lojas: [
      'lojas',
      'loja',
      'comércio',
      'shopping',
      'mercado',
      'boutique',
      'armazém',
      'supermercado',
      'minimercado',
      'quiosque',
      'feira',
      'bazaar',
      'loj',
      'lojs',
      'lojinha',
      'lojinhas',
      'lojz',
      'lojax',
    ],
    praias: [
      'praias',
      'praia',
      'litoral',
      'costa',
      'faixa de areia',
      'beira-mar',
      'orla',
      'prais',
      'praia',
      'prai',
      'preia',
      'preias',
    ],
    'pontos turísticos': [
      'pontos turísticos',
      'turismo',
      'atrações',
      'sítios',
      'marcos históricos',
      'monumentos',
      'locais históricos',
      'museus',
      'galerias',
      'exposições',
      'ponto turístico',
      'ponto turístco',
      'ponto turisico',
      'pontus turisticus',
      'pont turistic',
    ],
    passeios: [
      'passeios',
      'excursões',
      'tours',
      'visitas',
      'caminhadas',
      'aventuras',
      'trilhas',
      'explorações',
      'paseios',
      'paseio',
      'pasceios',
      'paseis',
    ],
    festas: [
      'festas',
      'festa',
      'baladas',
      'balada',
      'vida noturna',
      'discotecas',
      'clubes noturnos',
      'boate',
      'clube',
      'fest',
      'festass',
      'baladas',
      'balad',
      'baldas',
      'festinh',
      'festona',
      'fesat',
      'fetsas',
    ],
    bares: [
      'bares',
      'bar',
      'botecos',
      'pubs',
      'tabernas',
      'cervejarias',
      'choperias',
      'barzinho',
      'drinks',
      'bares',
      'barzinhos',
      'baress',
    ],
    cafés: [
      'cafés',
      'café',
      'cafeterias',
      'bistrôs',
      'casas de chá',
      'confeitarias',
      'docerias',
      'cafe',
      'caf',
      'cafeta',
      'cafett',
      'cafetta',
      'cafeti',
    ],
    hospitais: [
      'hospitais',
      'hospital',
      'saúde',
      'clínicas',
      'emergências',
      'prontos-socorros',
      'postos de saúde',
      'centros médicos',
      'hspital',
      'hopital',
      'hospial',
      'hspitais',
      'hsopitais',
      'hospitalar',
      'hospitai',
    ],
    farmácias: [
      'farmácias',
      'farmácia',
      'drogarias',
      'apotecas',
      'lojas de medicamentos',
      'farmacia',
      'fármacia',
      'farmásia',
      'farmci',
      'farmacias',
      'farmac',
      'farmaci',
    ],
    parques: [
      'parques',
      'parque',
      'jardins',
      'praças',
      'áreas verdes',
      'reserva natural',
      'bosques',
      'parques urbanos',
      'parqe',
      'parq',
      'parcs',
      'paques',
      'park',
      'parks',
      'parqu',
    ],
    'postos de gasolina': [
      'postos de gasolina',
      'posto de gasolina',
      'combustível',
      'gasolina',
      'abastecimento',
      'serviços automotivos',
      'postos de combustível',
      'posto de combustivel',
      'pstos de gasolina',
      'post de gasolina',
      'pstos',
      'pstos de combustivel',
      'pstos de gas',
    ],
    'banheiros públicos': [
      'banheiros públicos',
      'banheiro público',
      'toaletes',
      'sanitários',
      'banheiros',
      'WC',
      'lavabos',
      'toilets',
      'banheiro publico',
      'banhero público',
      'banhero publico',
      'banhero',
      'banheir',
    ],
    'caixas eletrônicos': [
      'caixas eletrônicos',
      'caixa eletrônico',
      'atm',
      'banco',
      'caixa',
      'terminal bancário',
      'caixa automático',
      'saque',
      'caixa eletronico',
      'caxas eletronicas',
      'caxa eletronica',
      'caxas',
      'caias eletronico',
      'caias',
    ],
    emergências: [
      'emergências',
      'emergência',
      'polícia',
      'hospital',
      'serviços de emergência',
      'socorro',
      'urgências',
      'emergencia',
      'emergencia',
      'emrgencia',
      'emrgencias',
    ],
    dicas: [
      'dicas',
      'dica',
      'conselhos',
      'sugestões',
      'recomendações',
      'dics',
      'dcias',
      'dicaz',
      'dicaa',
      'dicassa',
    ],
    sobre: [
      'sobre',
      'informações',
      'detalhes',
      'a respeito',
      'informação',
      'sbre',
      'sore',
      'sob',
      'sobr',
      'sobe',
    ],
    educação: [
      'educação',
      'educacao',
      'escolas',
      'faculdades',
      'universidades',
      'instituições de ensino',
      'cursos',
      'aulas',
      'treinamentos',
      'aprendizagem',
      'educaçao',
      'educacão',
      'eduacão',
      'eduacao',
      'educaç',
      'educça',
    ],
  };

  const searchQuery = prompt(
    'Digite o local que deseja buscar em Morro de São Paulo:'
  );
  if (searchQuery) {
    const viewBox = '-38.926, -13.369, -38.895, -13.392';
    let nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&viewbox=${viewBox}&bounded=1&key=${apiKey}`;

    fetch(nominatimUrl)
      .then((response) => response.json())
      .then((data) => {
        console.log('Data from Nominatim:', data);
        if (data && data.length > 0) {
          // Filtra resultados apenas dentro do retângulo
          const filteredData = data.filter((location) => {
            const lat = parseFloat(location.lat);
            const lon = parseFloat(location.lon);
            return (
              lon >= -38.926 &&
              lon <= -38.895 &&
              lat >= -13.392 &&
              lat <= -13.369
            );
          });

          console.log('Filtered data:', filteredData);

          if (filteredData.length > 0) {
            const firstResult = filteredData[0];
            const lat = firstResult.lat;
            const lon = firstResult.lon;

            // Remove o marcador atual, se existir
            if (currentMarker) {
              map.removeLayer(currentMarker);
            }

            // Remove todos os marcadores antigos
            markers.forEach((marker) => map.removeLayer(marker));
            markers = [];

            // Adiciona um novo marcador para o resultado da pesquisa
            currentMarker = L.marker([lat, lon])
              .addTo(map)
              .bindPopup(firstResult.display_name)
              .openPopup();

            map.setView([lat, lon], 14);

            // Verifica se a busca corresponde a alguma categoria
            let queryKey = null;
            const lowerQuery = searchQuery.toLowerCase();
            for (const [key, value] of Object.entries(synonyms)) {
              if (value.includes(lowerQuery)) {
                queryKey = key;
                break;
              }
            }

            console.log('Query key:', queryKey);

            if (queryKey && queries[queryKey]) {
              const overpassUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(queries[queryKey])}`;
              fetch(overpassUrl)
                .then((response) => response.json())
                .then((osmData) => {
                  console.log('Data from Overpass:', osmData);
                  if (
                    osmData &&
                    osmData.elements &&
                    osmData.elements.length > 0
                  ) {
                    osmData.elements.forEach((element) => {
                      const name = element.tags.name || 'Sem nome';
                      const description =
                        element.tags.description ||
                        element.tags.amenity ||
                        element.tags.tourism ||
                        element.tags.natural ||
                        '';
                      const marker = L.marker([element.lat, element.lon])
                        .addTo(map)
                        .bindPopup(`<b>${name}</b><br>${description}`)
                        .openPopup();
                      markers.push(marker);
                    });
                  } else {
                    alert(
                      `Nenhum(a) ${searchQuery} encontrado(a) num raio de 1.5km.`
                    );
                  }
                })
                .catch((error) => {
                  console.error('Erro ao buscar dados do Overpass:', error);
                  alert('Ocorreu um erro ao buscar pontos de interesse.');
                });
            } else {
              alert(
                `Busca por "${searchQuery}" não é suportada. Tente buscar por restaurantes, pousadas, lojas, praias, ou outros pontos de interesse.`
              );
            }
          } else {
            alert('Local não encontrado em Morro de São Paulo.');
          }
        } else {
          alert('Local não encontrado.');
        }
      })
      .catch((error) => {
        console.error('Erro na busca:', error);
        alert('Ocorreu um erro na busca.');
      });
  }
}
