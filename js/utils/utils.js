/**
 * 1. getUrlsForLocation - Retorna a URL associada a um local.
 */
export function getUrlsForLocation(locationName) {
  const urlDatabase = {
    // Festas
    'Toca do Morcego': 'https://www.tocadomorcego.com.br/',
    Pulsar: 'http://example.com/pulsar',
    'Mama Iate': 'http://example.com/mama_iate',
    'Teatro do Morro': 'http://example.com/teatro_do_morro',
    // Passeios
    'Passeio de lancha Volta a Ilha de Tinharé':
      'https://passeiosmorro.com.br/passeio-volta-a-ilha',
    'Passeio de Quadriciclo para Garapuá':
      'https://passeiosmorro.com.br/passeio-de-quadriciclo',
    'Passeio 4X4 para Garapuá': 'https://passeiosmorro.com.br/passeio-de-4x4',
    'Passeio de Barco para Gamboa':
      'https://passeiosmorro.com.br/passeio-de-barco',
    // Restaurantes
    'Morena Bela': 'http://example.com/morena_bela',
    Basílico: 'http://example.com/basilico',
    'Ki Massa': 'http://example.com/ki_massa',
    'Tempeiro Caseiro': 'http://example.com/tempeiro_caseiro',
    Bizu: 'http://example.com/bizu',
    'Pedra Sobre Pedra': 'http://example.com/pedra_sobre_pedra',
    'Forno a Lenha de Mercedes': 'http://example.com/forno_a_lenha',
    'Ponto G': 'http://example.com/ponto_g',
    'Ponto 9,99': 'http://example.com/ponto_999',
    Patricia: 'http://example.com/patricia',
    'dizi 10': 'http://example.com/dizi_10',
    Papoula: 'http://example.com/papoula',
    'Sabor da terra': 'http://example.com/sabor_da_terra',
    'Branco&Negro': 'http://example.com/branco_negro',
    'Six Club': 'http://example.com/six_club',
    'Santa Villa': 'http://example.com/santa_villa',
    'Recanto do Aviador': 'http://example.com/recanto_do_aviador',
    Sambass: 'https://www.sambass.com.br/',
    'Bar e Restaurante da Morena': 'http://example.com/bar_restaurante_morena',
    'Restaurante Alecrim': 'http://example.com/restaurante_alecrim',
    'Andina Cozinha Latina': 'http://example.com/andina_cozinha_latina',
    'Papoula Culinária Artesanal':
      'http://example.com/papoula_culinaria_artesanal',
    'Minha Louca Paixão': 'https://www.minhaloucapaixao.com.br/',
    'Café das Artes': 'http://example.com/cafe_das_artes',
    Canoa: 'http://example.com/canoa',
    'Restaurante do Francisco': 'http://example.com/restaurante_francisco',
    'La Tabla': 'http://example.com/la_tabla',
    'Santa Luzia': 'http://example.com/santa_luzia',
    'Chez Max': 'http://example.com/chez_max',
    'Barraca da Miriam': 'http://example.com/barraca_miriam',
    'O Casarão restaurante': 'http://example.com/casarao_restaurante',
    // Pousadas
    'Hotel Fazenda Parque Vila': 'http://example.com/hotel_fazenda_parque_vila',
    Guaiamu: 'http://example.com/guaiamu',
    'Pousada Fazenda Caeiras': 'https://pousadacaeira.com.br/',
    'Amendoeira Hotel': 'http://example.com/amendoeira_hotel',
    'Pousada Natureza': 'http://example.com/pousada_natureza',
    'Pousada dos Pássaros': 'http://example.com/pousada_dos_passaros',
    'Hotel Morro de São Paulo': 'http://example.com/hotel_morro_sao_paulo',
    'Uma Janela para o Sol': 'http://example.com/uma_janela_para_sol',
    Portaló: 'http://example.com/portalo',
    'Pérola do Morro': 'http://example.com/perola_do_morro',
    'Safira do Morro': 'http://example.com/safira_do_morro',
    'Xerife Hotel': 'http://example.com/xerife_hotel',
    'Ilha da Saudade': 'http://example.com/ilha_da_saudade',
    'Porto dos Milagres': 'http://example.com/porto_dos_milagres',
    Passarte: 'http://example.com/passarte',
    'Pousada da Praça': 'http://example.com/pousada_da_praca',
    'Pousada Colibri': 'http://example.com/pousada_colibri',
    'Pousada Porto de Cima': 'http://example.com/pousada_porto_de_cima',
    'Vila Guaiamu': 'http://example.com/vila_guaiamu',
    'Villa dos Corais pousada': 'http://example.com/villa_dos_corais',
    'Hotel Anima': 'http://example.com/hotel_anima',
    'Vila dos Orixás Boutique Hotel & Spa':
      'http://example.com/vila_dos_orixas',
    'Hotel Karapitangui': 'http://example.com/hotel_karapitangui',
    'Pousada Timbalada': 'http://example.com/pousada_timbalada',
    'Casa Celestino Residence': 'http://example.com/casa_celestino_residence',
    'Bahia Bacana Pousada': 'http://example.com/bahia_bacana_pousada',
    'Hotel Morro da Saudade': 'http://example.com/hotel_morro_da_saudade',
    'Bangalô dos sonhos': 'http://example.com/bangalo_dos_sonhos',
    'Cantinho da Josete': 'http://example.com/cantinho_da_josete',
    'Vila Morro do Sao Paulo': 'http://example.com/vila_morro_sao_paulo',
    'Casa Rossa': 'http://example.com/casa_rossa',
    'Village Paraíso Tropical': 'http://example.com/village_paraiso_tropical',
    // Lojas
    Absolute: 'http://example.com/absolute',
    'Local Brasil': 'http://example.com/local_brasil',
    'Super Zimbo': 'http://example.com/super_zimbo',
    'Mateus Esquadrais': 'http://example.com/mateus_esquadrais',
    'São Pedro Imobiliária': 'http://example.com/sao_pedro_imobiliaria',
    'Imóveis Brasil Bahia': 'http://example.com/imoveis_brasil_bahia',
    Coruja: 'http://example.com/coruja',
    'Zimbo Dive': 'http://example.com/zimbo_dive',
    Havaianas: 'http://example.com/havaianas',
    // Emergências
    Ambulância: 'http://example.com/ambulancia',
    'Unidade de Saúde': 'http://example.com/unidade_de_saude',
    'Polícia Civil': 'http://example.com/policia_civil',
    'Polícia Militar': 'http://example.com/policia_militar',
  };

  return urlDatabase[locationName] || null;
}
