// Importações necessárias
import { hideAllControlButtons, showButtons } from '../ui/buttons.js';
import { updateAssistantModalContent } from '../ui/modals.js';
import { highlightElement } from '../ui/highlight.js';
import { clearAllMarkers } from '../ui/markers.js';
import { closeSideMenu } from '../ui/menu.js';
import { selectedLanguage } from '../core/varGlobals.js';
import { hideWelcomeModal } from '../ui/modals.js';

let tutorialIsActive = false; // Variável para controlar o estado do tutorial
let currentStep = null; // Passo atual do tutorial
/**
 * 1. startTutorial - Inicia o tutorial interativo (definindo tutorialIsActive etc.)
 */
export function startTutorial() {
  tutorialIsActive = true; // Atualiza o estado do tutorial
  currentStep = 0; // Define o passo inicial
  showTutorialStep('start-tutorial'); // Exibe o primeiro passo do tutorial
  hideWelcomeModal(); // Oculta o modal de boas-vindas
  console.log('startTutorial: Tutorial iniciado.');
}

/**
 * 2. endTutorial - Finaliza o tutorial, limpando estado e fechando modal.
 */
export function endTutorial() {
  tutorialIsActive = false;
  currentStep = null;
  hideAllControlButtons();
  hideAssistantModal();
  console.log('endTutorial: Tutorial finalizado.');
}

/**
 * nextTutorialStep - Avança para o próximo passo do tutorial.
 */
export function nextTutorialStep() {
  if (currentStep < tutorialSteps.length - 1) {
    currentStep++;
    showTutorialStep(tutorialSteps[currentStep].step);
  } else {
    endTutorial();
  }
  console.log(
    `nextTutorialStep: Passo do tutorial definido para ${currentStep}.`
  );
}

/**
 * previousTutorialStep - Retorna ao passo anterior do tutorial.
 */
export function previousTutorialStep(currentStepId) {
  const idx = tutorialSteps.findIndex((s) => s.step === currentStepId);
  if (idx > 0) {
    const previous = tutorialSteps[idx - 1];
    showTutorialStep(previous.step);
  }
  console.log('previousTutorialStep: Voltou um passo no tutorial.');
}

/**
 * showTutorialStep - Exibe conteúdo de um passo específico do tutorial.
 */
export function showTutorialStep(step) {
  const stepConfig = tutorialSteps.find((s) => s.step === step);
  if (!stepConfig) {
    console.error(`Passo ${step} não encontrado.`);
    return;
  }

  const { message, action } = stepConfig;
  updateAssistantModalContent(step, message[selectedLanguage]);
  hideAllControlButtons();

  if (action) action();
}

/**
 * storeAndProceed - Armazena a resposta do usuário e chama showTutorialStep para o próximo passo.
 */
export function storeAndProceed(interest) {
  localStorage.setItem('ask-interest', interest);
  const specificStep = tutorialSteps.find((s) => s.step === interest);
  if (specificStep) {
    currentStep = tutorialSteps.indexOf(specificStep);
    showTutorialStep(specificStep.step);
  } else {
    console.error('Passo específico para o interesse não encontrado.');
  }
}

// Passos do tutorial
const tutorialSteps = [
  {
    step: 'start-tutorial',
    message: {
      pt: 'Sua aventura inesquecível em Morro de São Paulo começa aqui!',
      es: '¡Tu aventura inolvidable en Morro de São Paulo comienza aquí!',
      en: 'Your unforgettable adventure in Morro de São Paulo starts here!',
      he: 'ההרפתקה הבלתי נשכחת שלך במורו דה סאו פאולו מתחילה כאן!',
    },
    action: () => {
      showButtons(['tutorial-iniciar-btn']);
    },
  },
  {
    step: 'ask-interest',
    message: {
      pt: 'O que você está procurando em Morro de São Paulo? Escolha uma das opções abaixo.',
      es: '¿Qué estás buscando en Morro de São Paulo? Elige una de las opciones a continuación.',
      en: 'What are you looking for in Morro de São Paulo? Choose one of the options below.',
      he: 'מה אתה מחפש במורו דה סאו פאולו? בחר אחת מהאפשרויות הבאות.',
    },
    action: () => {
      showButtons([
        'pontos-turisticos-btn',
        'passeios-btn',
        'praias-btn',
        'festas-btn',
        'restaurantes-btn',
        'pousadas-btn',
        'lojas-btn',
        'emergencias-btn',
      ]);
      clearAllMarkers();
    },
  },
  ...generateInterestSteps(),
  {
    step: 'end-tutorial',
    message: {
      pt: 'Parabéns! Você concluiu o tutorial! Aproveite para explorar todas as funcionalidades disponíveis.',
      es: '¡Felicidades! Has completado el tutorial. Disfruta explorando todas las funciones disponibles.',
      en: 'Congratulations! You have completed the tutorial! Enjoy exploring all the available features.',
      he: 'מזל טוב! סיימת את המדריך! תהנה מחקר כל התכונות הזמינות.',
    },
    action: () => {
      showButtons(['tutorial-end-btn']);
    },
  },
];

/**
 * generateInterestSteps - Gera passos personalizados de interesse (tutorial).
 */
export function generateInterestSteps() {
  const interests = [
    {
      id: 'pousadas',
      label: 'Pousadas',
      message: {
        pt: 'Encontre as melhores pousadas para sua estadia.',
        es: 'Encuentra las mejores posadas para tu estadía.',
        en: 'Find the best inns for your stay.',
        he: 'מצא את הפוסאדות הטובות ביותר לשהותך.',
      },
    },
    {
      id: 'pontos-turisticos',
      label: 'Pontos Turísticos',
      message: {
        pt: 'Descubra os pontos turísticos mais populares.',
        es: 'Descubre los puntos turísticos más populares.',
        en: 'Discover the most popular tourist attractions.',
        he: 'גלה את האטרקציות התיירותיות הפופולריות ביותר.',
      },
    },
    {
      id: 'praias',
      label: 'Praias',
      message: {
        pt: 'Explore as praias mais belas de Morro de São Paulo.',
        es: 'Explora las playas más hermosas de Morro de São Paulo.',
        en: 'Explore the most beautiful beaches of Morro de São Paulo.',
        he: 'גלה את החופים היפים ביותר במורו דה סאו פאולו.',
      },
    },
    {
      id: 'passeios',
      label: 'Passeios',
      message: {
        pt: 'Veja passeios disponíveis e opções de reserva.',
        es: 'Consulta los paseos disponibles y las opciones de reserva.',
        en: 'See available tours and booking options.',
        he: 'צפה בטיולים זמינים ואפשרויות הזמנה.',
      },
    },
    {
      id: 'restaurantes',
      label: 'Restaurantes',
      message: {
        pt: 'Descubra os melhores restaurantes da região.',
        es: 'Descubre los mejores restaurantes de la región.',
        en: 'Discover the best restaurants in the area.',
        he: 'גלה את המסעדות הטובות ביותר באזור.',
      },
    },
    {
      id: 'festas',
      label: 'Festas',
      message: {
        pt: 'Saiba sobre festas e eventos disponíveis.',
        es: 'Infórmate sobre fiestas y eventos disponibles.',
        en: 'Learn about available parties and events.',
        he: 'גלה מסיבות ואירועים זמינים.',
      },
    },
    {
      id: 'lojas',
      label: 'Lojas',
      message: {
        pt: 'Encontre lojas locais para suas compras.',
        es: 'Encuentra tiendas locales para tus compras.',
        en: 'Find local shops for your purchases.',
        he: 'מצא חנויות מקומיות לקניות שלך.',
      },
    },
    {
      id: 'emergencias',
      label: 'Emergências',
      message: {
        pt: 'Informações úteis para situações de emergência.',
        es: 'Información útil para situaciones de emergencia.',
        en: 'Useful information for emergency situations.',
        he: 'מידע שימושי למצבי חירום.',
      },
    },
  ];

  // Mapeia os interesses e adiciona o passo "submenu-example"
  const steps = interests.flatMap((interest) => [
    {
      step: interest.id,
      element: `.menu-btn[data-feature="${interest.id}"]`,
      message: interest.message,
      action: () => {
        const element = document.querySelector(
          `.menu-btn[data-feature="${interest.id}"]`
        );
        if (element) {
          highlightElement(element);
        } else {
          console.error(`Elemento para ${interest.label} não encontrado.`);
        }
        showMenuButtons(); // Exibe os botões do menu lateral e toggle
      },
    },
    {
      step: 'submenu-example',
      message: {
        pt: 'Escolha uma opção do submenu para continuar.',
        es: 'Elige una opción del submenú para continuar.',
        en: 'Choose an option from the submenu to proceed.',
        he: 'בחר אפשרות מתפריט המשנה כדי להמשיך.',
      },
      action: () => {
        const submenu = document.querySelector('.submenu');
        if (submenu) {
          submenu.style.display = 'block'; // Exibe o submenu
        }
        setupSubmenuListeners();
        endTutorial(); // Configura os listeners para fechar o modal
      },
    },
  ]);

  return steps;
}

/**
 * removeExistingHighlights - Remove destaques visuais (ex.: setas, círculos).
 */
export function removeExistingHighlights() {
  document.querySelectorAll('.arrow-highlight').forEach((e) => e.remove());
  document.querySelectorAll('.circle-highlight').forEach((e) => e.remove());
  console.log('removeExistingHighlights: Destaques visuais removidos.');
}

/**
 * searchLocation - Realiza uma pesquisa de localização usando a API Nominatim.
 */
export function searchLocation(query) {
  const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`;

  fetch(nominatimUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Erro na resposta da API Nominatim.');
      }
      return response.json();
    })
    .then((data) => {
      if (!data || data.length === 0) {
        showNotification(
          'Nenhum resultado encontrado para a pesquisa.',
          'warning'
        );
        return;
      }

      // Processa os resultados da pesquisa
      console.log('Resultados da pesquisa:', data);
    })
    .catch((error) => {
      console.error('Erro ao realizar a pesquisa:', error);
      showNotification(
        'Erro ao realizar a pesquisa. Tente novamente.',
        'error'
      );
    });
}
