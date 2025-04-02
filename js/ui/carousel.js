console.log(
  'Swiper:',
  typeof Swiper !== 'undefined' ? 'Disponível' : 'Indisponível'
);
// Importações necessárias
import { showModal } from '../ui/modals.js';
import { getUrlsForLocation } from '../utils/utils.js';

// Variável global para gerenciar o carrossel
let swiperInstance = null;

/**
 * 1. startCarousel - Inicia o carrossel de imagens para um local.
 */
export function startCarousel(locationName) {
  const images = getImagesForLocation(locationName);
  if (!images || images.length === 0) {
    alert('Nenhuma imagem disponível para o carrossel.');
    return;
  }
  const swiperWrapper = document.querySelector('.swiper-wrapper');
  swiperWrapper.innerHTML = '';
  images.forEach((src) => {
    const slide = document.createElement('div');
    slide.className = 'swiper-slide';
    slide.innerHTML = `<img src="${src}" alt="${locationName}" style="width: 100%; height: 100%;">`;
    swiperWrapper.appendChild(slide);
  });
  showModal('carousel-modal');
  if (swiperInstance) {
    swiperInstance.destroy(true, true);
  }
  swiperInstance = new Swiper('.swiper-container', {
    slidesPerView: 1,
    spaceBetween: 10,
    loop: true,
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    autoplay: {
      delay: 2500,
      disableOnInteraction: false,
    },
  });
  console.log('startCarousel: Carrossel iniciado para', locationName);
}

/**
 * 2. getImagesForLocation
 *    Retorna um array de URLs de imagens para um local (nome => lista de strings).
 */
export function getImagesForLocation(locationName) {
  const basePath = 'Images/';

  const imageDatabase = {
    'Farol do Morro': [
      `${basePath}farol_do_morro1.jpg`,
      `${basePath}farol_do_morro2.jpg`,
      `${basePath}farol_do_morro3.jpg`,
    ],
    'Toca do Morcego': [
      `${basePath}toca_do_morcego1.jpg`,
      `${basePath}toca_do_morcego2.jpg`,
      `${basePath}toca_do_morcego3.jpg`,
    ],
    'Mirante da Tirolesa': [
      `${basePath}mirante_da_tirolesa1.jpg`,
      `${basePath}mirante_da_tirolesa2.jpg`,
      `${basePath}mirante_da_tirolesa3.jpg`,
    ],
    'Fortaleza de Morro de São Paulo': [
      `${basePath}fortaleza_de_morro1.jpg`,
      `${basePath}fortaleza_de_morro2.jpg`,
      `${basePath}fortaleza_de_morro3.jpg`,
    ],
    'Paredão da Argila': [
      `${basePath}paredao_da_argila1.jpg`,
      `${basePath}paredao_da_argila2.jpg`,
      `${basePath}paredao_da_argila3.jpg`,
    ],
    'Passeio de lancha Volta a Ilha de Tinharé': [
      `${basePath}passeio_lancha_ilha_tinhare1.jpg`,
      `${basePath}passeio_lancha_ilha_tinhare2.jpg`,
      `${basePath}passeio_lancha_ilha_tinhare3.jpg`,
    ],
    'Passeio de Quadriciclo para Garapuá': [
      `${basePath}passeio_quadriciclo_garapua1.jpg`,
      `${basePath}passeio_quadriciclo_garapua2.jpg`,
      `${basePath}passeio_quadriciclo_garapua3.jpg`,
    ],
    'Passeio 4X4 para Garapuá': [
      `${basePath}passeio_4x4_garapua1.jpg`,
      `${basePath}passeio_4x4_garapua2.jpg`,
      `${basePath}passeio_4x4_garapua3.jpg`,
    ],
    'Passeio de Barco para Gamboa': [
      `${basePath}passeio_barco_gamboa1.jpg`,
      `${basePath}passeio_barco_gamboa2.jpg`,
      `${basePath}passeio_barco_gamboa3.jpg`,
    ],
    'Primeira Praia': [
      `${basePath}primeira_praia1.jpg`,
      `${basePath}primeira_praia2.jpg`,
      `${basePath}primeira_praia3.jpg`,
    ],
    'Segunda Praia': [
      `${basePath}segunda_praia1.jpg`,
      `${basePath}segunda_praia2.jpg`,
      `${basePath}segunda_praia3.jpg`,
    ],
    'Terceira Praia': [
      `${basePath}terceira_praia1.jpg`,
      `${basePath}terceira_praia2.jpg`,
      `${basePath}terceira_praia3.jpg`,
    ],
    'Quarta Praia': [
      `${basePath}quarta_praia1.jpg`,
      `${basePath}quarta_praia2.jpg`,
      `${basePath}quarta_praia3.jpg`,
    ],
    'Praia do Encanto': [
      `${basePath}praia_do_encanto1.jpg`,
      `${basePath}praia_do_encanto2.jpg`,
      `${basePath}praia_do_encanto3.jpg`,
    ],
    'Praia do Pôrto': [
      `${basePath}praia_do_porto1.jpg`,
      `${basePath}praia_do_porto2.jpg`,
      `${basePath}praia_do_porto3.jpg`,
    ],
    'Praia da Gamboa': [
      `${basePath}praia_da_gamboa1.jpg`,
      `${basePath}praia_da_gamboa2.jpg`,
      `${basePath}praia_da_gamboa3.jpg`,
    ],
    'Toca do Morcego Festas': [
      `${basePath}toca_do_morcego_festas1.jpg`,
      `${basePath}toca_do_morcego_festas2.jpg`,
      `${basePath}toca_do_morcego_festas3.jpg`,
    ],
    'One Love': [
      `${basePath}one_love1.jpg`,
      `${basePath}one_love2.jpg`,
      `${basePath}one_love3.jpg`,
    ],
    Pulsar: [
      `${basePath}pulsar1.jpg`,
      `${basePath}pulsar2.jpg`,
      `${basePath}pulsar3.jpg`,
    ],
    'Mama Iate': [
      `${basePath}mama_iate1.jpg`,
      `${basePath}mama_iate2.jpg`,
      `${basePath}mama_iate3.jpg`,
    ],
    'Teatro do Morro': [
      `${basePath}teatro_do_morro1.jpg`,
      `${basePath}teatro_do_morro2.jpg`,
      `${basePath}teatro_do_morro3.jpg`,
    ],
    'Morena Bela': [
      `${basePath}morena_bela1.jpg`,
      `${basePath}morena_bela2.jpg`,
      `${basePath}morena_bela3.jpg`,
    ],
    Basílico: [
      `${basePath}basilico1.jpg`,
      `${basePath}basilico2.jpg`,
      `${basePath}basilico3.jpg`,
    ],
    'Ki Massa': [
      `${basePath}ki_massa1.jpg`,
      `${basePath}ki_massa2.jpg`,
      `${basePath}ki_massa3.jpg`,
    ],
    'Tempeiro Caseiro': [
      `${basePath}tempeiro_caseiro1.jpg`,
      `${basePath}tempeiro_caseiro2.jpg`,
      `${basePath}tempeiro_caseiro3.jpg`,
    ],
    Bizu: [
      `${basePath}bizu1.jpg`,
      `${basePath}bizu2.jpg`,
      `${basePath}bizu3.jpg`,
    ],
    'Pedra Sobre Pedra': [
      `${basePath}pedra_sobre_pedra1.jpg`,
      `${basePath}pedra_sobre_pedra2.jpg`,
      `${basePath}pedra_sobre_pedra3.jpg`,
    ],
    'Forno a Lenha de Mercedes': [
      `${basePath}forno_a_lenha1.jpg`,
      `${basePath}forno_a_lenha2.jpg`,
      `${basePath}forno_a_lenha3.jpg`,
    ],
    'Ponto G': [
      `${basePath}ponto_g1.jpg`,
      `${basePath}ponto_g2.jpg`,
      `${basePath}ponto_g3.jpg`,
    ],
    'Ponto 9,99': [
      `${basePath}ponto_9991.jpg`,
      `${basePath}ponto_9992.jpg`,
      `${basePath}ponto_9993.jpg`,
    ],
    Patricia: [
      `${basePath}patricia1.jpg`,
      `${basePath}patricia2.jpg`,
      `${basePath}patricia3.jpg`,
    ],
    'dizi 10': [
      `${basePath}dizi_101.jpg`,
      `${basePath}dizi_102.jpg`,
      `${basePath}dizi_103.jpg`,
    ],
    Papoula: [
      `${basePath}papoula1.jpg`,
      `${basePath}papoula2.jpg`,
      `${basePath}papoula3.jpg`,
    ],
    'Sabor da terra': [
      `${basePath}sabor_da_terra1.jpg`,
      `${basePath}sabor_da_terra2.jpg`,
      `${basePath}sabor_da_terra3.jpg`,
    ],
    'Branco&Negro': [
      `${basePath}branco_negro1.jpg`,
      `${basePath}branco_negro2.jpg`,
      `${basePath}branco_negro3.jpg`,
    ],
    'Six Club': [
      `${basePath}six_club1.jpg`,
      `${basePath}six_club2.jpg`,
      `${basePath}six_club3.jpg`,
    ],
    'Santa Villa': [
      `${basePath}santa_villa1.jpg`,
      `${basePath}santa_villa2.jpg`,
      `${basePath}santa_villa3.jpg`,
    ],
    'Recanto do Aviador': [
      `${basePath}recanto_do_aviador1.jpg`,
      `${basePath}recanto_do_aviador2.jpg`,
      `${basePath}recanto_do_aviador3.jpg`,
    ],
    Sambass: [
      `${basePath}sambass1.jpg`,
      `${basePath}sambass2.jpg`,
      `${basePath}sambass3.jpg`,
    ],
    'Bar e Restaurante da Morena': [
      `${basePath}bar_restaurante_morena1.jpg`,
      `${basePath}bar_restaurante_morena2.jpg`,
      `${basePath}bar_restaurante_morena3.jpg`,
    ],
    'Restaurante Alecrim': [
      `${basePath}restaurante_alecrim1.jpg`,
      `${basePath}restaurante_alecrim2.jpg`,
      `${basePath}restaurante_alecrim3.jpg`,
    ],
    'Andina Cozinha Latina': [
      `${basePath}andina_cozinha_latina1.jpg`,
      `${basePath}andina_cozinha_latina2.jpg`,
      `${basePath}andina_cozinha_latina3.jpg`,
    ],
    'Papoula Culinária Artesanal': [
      `${basePath}papoula_culinaria_artesanal1.jpg`,
      `${basePath}papoula_culinaria_artesanal2.jpg`,
      `${basePath}papoula_culinaria_artesanal3.jpg`,
    ],
    'Minha Louca Paixão': [
      `${basePath}minha_louca_paixao1.jpg`,
      `${basePath}minha_louca_paixao2.jpg`,
      `${basePath}minha_louca_paixao3.jpg`,
    ],
    'Café das Artes': [
      `${basePath}cafe_das_artes1.jpg`,
      `${basePath}cafe_das_artes2.jpg`,
      `${basePath}cafe_das_artes3.jpg`,
    ],
    Canoa: [
      `${basePath}canoa1.jpg`,
      `${basePath}canoa2.jpg`,
      `${basePath}canoa3.jpg`,
    ],
    'Restaurante do Francisco': [
      `${basePath}restaurante_francisco1.jpg`,
      `${basePath}restaurante_francisco2.jpg`,
      `${basePath}restaurante_francisco3.jpg`,
    ],
    'La Tabla': [
      `${basePath}la_tabla1.jpg`,
      `${basePath}la_tabla2.jpg`,
      `${basePath}la_tabla3.jpg`,
    ],
    'Santa Luzia': [
      `${basePath}santa_luzia1.jpg`,
      `${basePath}santa_luzia2.jpg`,
      `${basePath}santa_luzia3.jpg`,
    ],
    'Chez Max': [
      `${basePath}chez_max1.jpg`,
      `${basePath}chez_max2.jpg`,
      `${basePath}chez_max3.jpg`,
    ],
    'Barraca da Miriam': [
      `${basePath}barraca_miriam1.jpg`,
      `${basePath}barraca_miriam2.jpg`,
      `${basePath}barraca_miriam3.jpg`,
    ],
    'O Casarão restaurante': [
      `${basePath}casarao_restaurante1.jpg`,
      `${basePath}casarao_restaurante2.jpg`,
      `${basePath}casarao_restaurante3.jpg`,
    ],
    'Hotel Fazenda Parque Vila': [
      `${basePath}hotel_fazenda_parque_vila1.jpg`,
      `${basePath}hotel_fazenda_parque_vila2.jpg`,
      `${basePath}hotel_fazenda_parque_vila3.jpg`,
    ],
    Guaiamu: [
      `${basePath}guaiamu1.jpg`,
      `${basePath}guaiamu2.jpg`,
      `${basePath}guaiamu3.jpg`,
    ],
    'Pousada Fazenda Caeiras': [
      `${basePath}pousada_fazenda_caeiras1.jpg`,
      `${basePath}pousada_fazenda_caeiras2.jpg`,
      `${basePath}pousada_fazenda_caeiras3.jpg`,
    ],
    'Amendoeira Hotel': [
      `${basePath}amendoeira_hotel1.jpg`,
      `${basePath}amendoeira_hotel2.jpg`,
      `${basePath}amendoeira_hotel3.jpg`,
    ],
    'Pousada Natureza': [
      `${basePath}pousada_natureza1.jpg`,
      `${basePath}pousada_natureza2.jpg`,
      `${basePath}pousada_natureza3.jpg`,
    ],
    'Pousada dos Pássaros': [
      `${basePath}pousada_dos_passaros1.jpg`,
      `${basePath}pousada_dos_passaros2.jpg`,
      `${basePath}pousada_dos_passaros3.jpg`,
    ],
    'Hotel Morro de São Paulo': [
      `${basePath}hotel_morro_sao_paulo1.jpg`,
      `${basePath}hotel_morro_sao_paulo2.jpg`,
      `${basePath}hotel_morro_sao_paulo3.jpg`,
    ],
    'Uma Janela para o Sol': [
      `${basePath}uma_janela_para_sol1.jpg`,
      `${basePath}uma_janela_para_sol2.jpg`,
      `${basePath}uma_janela_para_sol3.jpg`,
    ],
    Portaló: [
      `${basePath}portalo1.jpg`,
      `${basePath}portalo2.jpg`,
      `${basePath}portalo3.jpg`,
    ],
    'Pérola do Morro': [
      `${basePath}perola_do_morro1.jpg`,
      `${basePath}perola_do_morro2.jpg`,
      `${basePath}perola_do_morro3.jpg`,
    ],
    'Safira do Morro': [
      `${basePath}safira_do_morro1.jpg`,
      `${basePath}safira_do_morro2.jpg`,
      `${basePath}safira_do_morro3.jpg`,
    ],
    'Xerife Hotel': [
      `${basePath}xerife_hotel1.jpg`,
      `${basePath}xerife_hotel2.jpg`,
      `${basePath}xerife_hotel3.jpg`,
    ],
    'Ilha da Saudade': [
      `${basePath}ilha_da_saudade1.jpg`,
      `${basePath}ilha_da_saudade2.jpg`,
      `${basePath}ilha_da_saudade3.jpg`,
    ],
    'Porto dos Milagres': [
      `${basePath}porto_dos_milagres1.jpg`,
      `${basePath}porto_dos_milagres2.jpg`,
      `${basePath}porto_dos_milagres3.jpg`,
    ],
    Passarte: [
      `${basePath}passarte1.jpg`,
      `${basePath}passarte2.jpg`,
      `${basePath}passarte3.jpg`,
    ],
    'Pousada da Praça': [
      `${basePath}pousada_da_praca1.jpg`,
      `${basePath}pousada_da_praca2.jpg`,
      `${basePath}pousada_da_praca3.jpg`,
    ],
    'Pousada Colibri': [
      `${basePath}pousada_colibri1.jpg`,
      `${basePath}pousada_colibri2.jpg`,
      `${basePath}pousada_colibri3.jpg`,
    ],
    'Pousada Porto de Cima': [
      `${basePath}pousada_porto_de_cima1.jpg`,
      `${basePath}pousada_porto_de_cima2.jpg`,
      `${basePath}pousada_porto_de_cima3.jpg`,
    ],
    'Vila Guaiamu': [
      `${basePath}vila_guaiamu1.jpg`,
      `${basePath}vila_guaiamu2.jpg`,
      `${basePath}vila_guaiamu3.jpg`,
    ],
    'Villa dos Corais pousada': [
      `${basePath}villa_dos_corais1.jpg`,
      `${basePath}villa_dos_corais2.jpg`,
      `${basePath}villa_dos_corais3.jpg`,
    ],
    'Hotel Anima': [
      `${basePath}hotel_anima1.jpg`,
      `${basePath}hotel_anima2.jpg`,
      `${basePath}hotel_anima3.jpg`,
    ],
    'Vila dos Orixás Boutique Hotel & Spa': [
      `${basePath}vila_dos_orixas1.jpg`,
      `${basePath}vila_dos_orixas2.jpg`,
      `${basePath}vila_dos_orixas3.jpg`,
    ],
    'Hotel Karapitangui': [
      `${basePath}hotel_karapitangui1.jpg`,
      `${basePath}hotel_karapitangui2.jpg`,
      `${basePath}hotel_karapitangui3.jpg`,
    ],
    'Pousada Timbalada': [
      `${basePath}pousada_timbalada1.jpg`,
      `${basePath}pousada_timbalada2.jpg`,
      `${basePath}pousada_timbalada3.jpg`,
    ],
    'Casa Celestino Residence': [
      `${basePath}casa_celestino_residence1.jpg`,
      `${basePath}casa_celestino_residence2.jpg`,
      `${basePath}casa_celestino_residence3.jpg`,
    ],
    'Bahia Bacana Pousada': [
      `${basePath}bahia_bacana_pousada1.jpg`,
      `${basePath}bahia_bacana_pousada2.jpg`,
      `${basePath}bahia_bacana_pousada3.jpg`,
    ],
    'Hotel Morro da Saudade': [
      `${basePath}hotel_morro_da_saudade1.jpg`,
      `${basePath}hotel_morro_da_saudade2.jpg`,
      `${basePath}hotel_morro_da_saudade3.jpg`,
    ],
    'Bangalô dos sonhos': [
      `${basePath}bangalo_dos_sonhos1.jpg`,
      `${basePath}bangalo_dos_sonhos2.jpg`,
      `${basePath}bangalo_dos_sonhos3.jpg`,
    ],
    'Cantinho da Josete': [
      `${basePath}cantinho_da_josete1.jpg`,
      `${basePath}cantinho_da_josete2.jpg`,
      `${basePath}cantinho_da_josete3.jpg`,
    ],
    'Vila Morro do Sao Paulo': [
      `${basePath}vila_morro_sao_paulo1.jpg`,
      `${basePath}vila_morro_sao_paulo2.jpg`,
      `${basePath}vila_morro_sao_paulo3.jpg`,
    ],
    'Casa Rossa': [
      `${basePath}casa_rossa1.jpg`,
      `${basePath}casa_rossa2.jpg`,
      `${basePath}casa_rossa3.jpg`,
    ],
    'Village Paraíso Tropical': [
      `${basePath}village_paraiso_tropical1.jpg`,
      `${basePath}village_paraiso_tropical2.jpg`,
      `${basePath}village_paraiso_tropical3.jpg`,
    ],
    Absolute: [
      `${basePath}absolute1.jpg`,
      `${basePath}absolute2.jpg`,
      `${basePath}absolute3.jpg`,
    ],
    'Local Brasil': [
      `${basePath}local_brasil1.jpg`,
      `${basePath}local_brasil2.jpg`,
      `${basePath}local_brasil3.jpg`,
    ],
    'Super Zimbo': [
      `${basePath}super_zimbo1.jpg`,
      `${basePath}super_zimbo2.jpg`,
      `${basePath}super_zimbo3.jpg`,
    ],
    'Mateus Esquadrais': [
      `${basePath}mateus_esquadrais1.jpg`,
      `${basePath}mateus_esquadrais2.jpg`,
      `${basePath}mateus_esquadrais3.jpg`,
    ],
    'São Pedro Imobiliária': [
      `${basePath}sao_pedro_imobiliaria1.jpg`,
      `${basePath}sao_pedro_imobiliaria2.jpg`,
      `${basePath}sao_pedro_imobiliaria3.jpg`,
    ],
    'Imóveis Brasil Bahia': [
      `${basePath}imoveis_brasil_bahia1.jpg`,
      `${basePath}imoveis_brasil_bahia2.jpg`,
      `${basePath}imoveis_brasil_bahia3.jpg`,
    ],
    Coruja: [
      `${basePath}coruja1.jpg`,
      `${basePath}coruja2.jpg`,
      `${basePath}coruja3.jpg`,
    ],
    'Zimbo Dive': [
      `${basePath}zimbo_dive1.jpg`,
      `${basePath}zimbo_dive2.jpg`,
      `${basePath}zimbo_dive3.jpg`,
    ],
    Havaianas: [
      `${basePath}havaianas1.jpg`,
      `${basePath}havaianas2.jpg`,
      `${basePath}havaianas3.jpg`,
    ],
    Ambulância: [
      `${basePath}ambulancia1.jpg`,
      `${basePath}ambulancia2.jpg`,
      `${basePath}ambulancia3.jpg`,
    ],
    'Unidade de Saúde': [
      `${basePath}unidade_de_saude1.jpg`,
      `${basePath}unidade_de_saude2.jpg`,
      `${basePath}unidade_de_saude3.jpg`,
    ],
    'Polícia Civil': [
      `${basePath}policia_civil1.jpg`,
      `${basePath}policia_civil2.jpg`,
      `${basePath}policia_civil3.jpg`,
    ],
    'Polícia Militar': [
      `${basePath}policia_militar1.jpg`,
      `${basePath}policia_militar2.jpg`,
      `${basePath}policia_militar3.jpg`,
    ],
    'Melhores Pontos Turísticos': [
      `${basePath}melhores_pontos_turisticos1.jpg`,
      `${basePath}melhores_pontos_turisticos2.jpg`,
      `${basePath}melhores_pontos_turisticos3.jpg`,
    ],
    'Melhores Passeios': [
      `${basePath}melhores_passeios1.jpg`,
      `${basePath}melhores_passeios2.jpg`,
      `${basePath}melhores_passeios3.jpg`,
    ],
    'Melhores Praias': [
      `${basePath}melhores_praias1.jpg`,
      `${basePath}melhores_praias2.jpg`,
      `${basePath}melhores_praias3.jpg`,
    ],
    'Melhores Restaurantes': [
      `${basePath}melhores_restaurantes1.jpg`,
      `${basePath}melhores_restaurantes2.jpg`,
      `${basePath}melhores_restaurantes3.jpg`,
    ],
    'Melhores Pousadas': [
      `${basePath}melhores_pousadas1.jpg`,
      `${basePath}melhores_pousadas2.jpg`,
      `${basePath}melhores_pousadas3.jpg`,
    ],
    'Melhores Lojas': [
      `${basePath}melhores_lojas1.jpg`,
      `${basePath}melhores_lojas2.jpg`,
      `${basePath}melhores_lojas3.jpg`,
    ],
    Missão: [
      `${basePath}missao1.jpg`,
      `${basePath}missao2.jpg`,
      `${basePath}missao3.jpg`,
    ],
    Serviços: [
      `${basePath}servicos1.jpg`,
      `${basePath}servicos2.jpg`,
      `${basePath}servicos3.jpg`,
    ],
    'Benefícios para Turistas': [
      `${basePath}beneficios_turistas1.jpg`,
      `${basePath}beneficios_turistas2.jpg`,
      `${basePath}beneficios_turistas3.jpg`,
    ],
    'Benefícios para Moradores': [
      `${basePath}beneficios_moradores1.jpg`,
      `${basePath}beneficios_moradores2.jpg`,
      `${basePath}beneficios_moradores3.jpg`,
    ],
    'Benefícios para Pousadas': [
      `${basePath}beneficios_pousadas1.jpg`,
      `${basePath}beneficios_pousadas2.jpg`,
      `${basePath}beneficios_pousadas3.jpg`,
    ],
    'Benefícios para Restaurantes': [
      `${basePath}beneficios_restaurantes1.jpg`,
      `${basePath}beneficios_restaurantes2.jpg`,
      `${basePath}beneficios_restaurantes3.jpg`,
    ],
    'Benefícios para Agências de Turismo': [
      `${basePath}beneficios_agencias_turismo1.jpg`,
      `${basePath}beneficios_agencias_turismo2.jpg`,
      `${basePath}beneficios_agencias_turismo3.jpg`,
    ],
    'Benefícios para Lojas e Comércios': [
      `${basePath}beneficios_lojas_comercios1.jpg`,
      `${basePath}beneficios_lojas_comercios2.jpg`,
      `${basePath}beneficios_lojas_comercios3.jpg`,
    ],
    'Benefícios para Transportes': [
      `${basePath}beneficios_transportes1.jpg`,
      `${basePath}beneficios_transportes2.jpg`,
      `${basePath}beneficios_transportes3.jpg`,
    ],
    'Impacto em MSP': [
      `${basePath}impacto_msp1.jpg`,
      `${basePath}impacto_msp2.jpg`,
      `${basePath}impacto_msp3.jpg`,
    ],
    'Iniciar Tutorial': [
      `${basePath}iniciar_tutorial1.jpg`,
      `${basePath}iniciar_tutorial2.jpg`,
      `${basePath}iniciar_tutorial3.jpg`,
    ],
    'Planejar Viagem com IA': [
      `${basePath}planejar_viagem_ia1.jpg`,
      `${basePath}planejar_viagem_ia2.jpg`,
      `${basePath}planejar_viagem_ia3.jpg`,
    ],
    'Falar com IA': [
      `${basePath}falar_com_ia1.jpg`,
      `${basePath}falar_com_ia2.jpg`,
      `${basePath}falar_com_ia3.jpg`,
    ],
    'Falar com Suporte': [
      `${basePath}falar_com_suporte1.jpg`,
      `${basePath}falar_com_suporte2.jpg`,
      `${basePath}falar_com_suporte3.jpg`,
    ],
    Configurações: [
      `${basePath}configuracoes1.jpg`,
      `${basePath}configuracoes2.jpg`,
      `${basePath}configuracoes3.jpg`,
    ],
  };

  return imageDatabase[locationName] || [];
}
