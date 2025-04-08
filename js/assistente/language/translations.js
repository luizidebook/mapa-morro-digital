/**
 * Sistema de traduções do assistente virtual
 */

// Importar função de textos gerais do sistema
import { getGeneralText } from '../../i18n/language.js';

// Traduções específicas do assistente
const assistantTranslations = {
  pt: {
    // Mensagens de boas-vindas e gerais
    welcome:
      'Olá! Sou seu assistente virtual para Morro de São Paulo. Como posso ajudar?',
    greeting_response:
      'Olá! Como posso ajudar você a descobrir Morro de São Paulo?',
    farewell_response: 'Até logo! Estou aqui se precisar de mais informações!',
    thanks_response:
      'Por nada! Estou aqui para ajudar. Precisa de mais alguma coisa?',
    listeningPrompt: 'Estou ouvindo... Diga o que você precisa.',
    processingRequest: 'Processando sua solicitação...',
    helpResponse:
      'Posso ajudar você a encontrar lugares, criar rotas, fornecer informações sobre praias, restaurantes e passeios. O que você procura?',
    weather_response:
      'O clima em Morro de São Paulo é geralmente quente e ensolarado, com temperaturas entre 25°C e 30°C na maior parte do ano. A alta temporada vai de dezembro a março.',
    language_changed_to: 'Idioma alterado para Português',

    // Praias
    beachInfoResponse:
      'Morro de São Paulo tem 5 praias principais. A Primeira Praia é mais agitada, a Segunda tem muitos bares e restaurantes, a Terceira é mais tranquila, a Quarta é menos movimentada e a Quinta (Praia do Encanto) é a mais isolada. Qual delas gostaria de conhecer?',
    first_beach_info:
      'A Primeira Praia é a mais próxima do centro histórico, com águas agitadas, ideal para surf. Tem menos estrutura que as outras praias, mas é uma boa opção para quem quer ficar perto da vila.',
    second_beach_info:
      'A Segunda Praia é o coração de Morro de São Paulo! Tem águas calmas, bares, restaurantes e muita agitação. É perfeita para quem quer curtir a praia com estrutura completa e boa vida noturna.',
    third_beach_info:
      'A Terceira Praia tem águas tranquilas e cristalinas, perfeitas para banho! É mais familiar e relaxante, com excelentes pousadas e restaurantes. Daqui saem muitos barcos para passeios.',
    fourth_beach_info:
      'A Quarta Praia é a mais extensa e tranquila. Suas águas são cristalinas com piscinas naturais na maré baixa. É ideal para quem busca relaxamento e contato com a natureza.',
    fifth_beach_info:
      'A Quinta Praia, também conhecida como Praia do Encanto, é a mais preservada e deserta. Perfeita para quem busca privacidade e natureza intocada.',

    // Navegação e localização
    findLocationResponse: 'Encontrei {location} no mapa. Veja os detalhes:',
    createRouteResponse:
      'Criando rota para {location}. Posso iniciar a navegação quando estiver pronto.',
    navigationStarted: 'Iniciando navegação. Siga as instruções na tela.',
    nearby_place:
      'Você está próximo de {placeName}, a apenas {distance} de distância. Gostaria de mais informações?',

    // Categorias de comida
    seafood: 'Frutos do Mar',
    bahian_food: 'Comida Baiana',
    international_food: 'Internacional',
    seafood_response:
      'Os melhores restaurantes de frutos do mar são o Sambass na Terceira Praia e o Ponto do Marisco na Segunda Praia. Ambos têm pratos frescos e deliciosos, com destaque para a moqueca de camarão e lagosta grelhada.',

    // Atividades
    boat_tour: 'Passeio de Barco',
    diving: 'Mergulho',
    trails: 'Trilhas',
    diving_response:
      'Há pontos de mergulho excelentes em Morro! A piscina natural é perfeita para snorkeling e acessível para iniciantes. Para mergulho com cilindro, recomendo a Nautica Diving School na Segunda Praia.',

    // Hospedagem
    budget: 'Econômico',
    comfort: 'Confortável',
    luxury: 'Luxo',
    budget_accommodation_response:
      'Para hospedagem econômica, recomendo a Pousada Bahia Inn na vila ou o Hostel Morro de São Paulo, ambos oferecem bom custo-benefício e localização conveniente.',

    // Nomes das praias
    first_beach_name: 'Primeira Praia',
    second_beach_name: 'Segunda Praia',
    third_beach_name: 'Terceira Praia',
    fourth_beach_name: 'Quarta Praia',
    fifth_beach_name: 'Quinta Praia',

    // Perguntas específicas
    ask_seafood: 'Quero saber sobre restaurantes de frutos do mar',
    ask_bahian: 'Quero saber sobre restaurantes de comida baiana',
    ask_international: 'Quero saber sobre restaurantes internacionais',
    ask_first_beach: 'Me fale sobre a Primeira Praia',
    ask_second_beach: 'Me fale sobre a Segunda Praia',
    ask_third_beach: 'Me fale sobre a Terceira Praia',
    ask_fourth_beach: 'Me fale sobre a Quarta Praia',
    ask_fifth_beach: 'Me fale sobre a Quinta Praia',

    // Respostas genéricas
    generic_response_1:
      'Entendi sua mensagem. Posso ajudar com informações sobre praias, restaurantes, hospedagem ou passeios em Morro de São Paulo.',
    generic_response_2:
      'Para ajudar melhor, você poderia ser mais específico sobre o que deseja saber de Morro de São Paulo?',
    generic_response_3:
      'Posso oferecer várias informações. Você está interessado em quais aspectos de Morro de São Paulo?',
    generic_response_4:
      'Posso ajudar com dicas de praias, restaurantes, hospedagem ou atividades. O que prefere saber?',

    // Elementos da interface
    ask_placeholder: 'Pergunte algo sobre Morro de São Paulo...',
    assistant_placeholder: 'Pergunte algo sobre Morro de São Paulo...',
    'placeholder.ask': 'Pergunte algo sobre Morro de São Paulo...',
    assistant_title: 'Assistente Virtual',
    send_button: 'Enviar',
    voice_button: 'Entrada de voz',
    close_button: 'Fechar',
    suggestion_button: 'Sugestão',
    toggle_button: 'Alternar assistente',
    system_error: 'Desculpe, ocorreu um erro. Por favor, tente novamente.',
    unknown_location:
      'Não tenho informações específicas sobre esse local, mas posso falar sobre as principais praias e pontos turísticos de Morro de São Paulo.',
    feature_selected:
      'Você selecionou {feature}. Posso fornecer mais detalhes sobre essa opção.',
    navigation_started: 'Navegação iniciada! Siga as instruções na tela.',
    navigation_ended: 'Navegação finalizada.',
    navigation_error:
      'Não foi possível iniciar a navegação. Por favor, verifique sua conexão e tente novamente.',

    // Configurações de voz
    voice_settings_button: 'Configurações de voz',
    voice_settings_title: 'Configurações de Voz',
    select_voice: 'Selecione uma voz',
    preview_voice: 'Testar voz',
    speech_rate: 'Velocidade da fala',
    speech_pitch: 'Tom da voz',
    save_settings: 'Salvar configurações',
    voice_preview_text:
      'Olá! Esta é uma amostra de como esta voz soará no assistente virtual.',
  },

  en: {
    // Welcome and general messages
    welcome:
      "Hello! I'm your virtual assistant for Morro de São Paulo. How can I help you?",
    greeting_response: 'Hello! How can I help you discover Morro de São Paulo?',
    farewell_response: "Goodbye! I'm here if you need more information!",
    thanks_response:
      "You're welcome! I'm here to help. Do you need anything else?",
    listeningPrompt: "I'm listening... Tell me what you need.",
    processingRequest: 'Processing your request...',
    helpResponse:
      'I can help you find places, create routes, provide information about beaches, restaurants, and tours. What are you looking for?',
    weather_response:
      'The weather in Morro de São Paulo is generally warm and sunny, with temperatures between 25°C and 30°C most of the year. The high season is from December to March.',
    language_changed_to: 'Language changed to English',

    // Beaches
    beachInfoResponse:
      'Morro de São Paulo has 5 main beaches. First Beach is busier, Second Beach has many bars and restaurants, Third Beach is calmer, Fourth Beach is less crowded, and Fifth Beach (Enchantment Beach) is the most isolated. Which one would you like to know about?',
    first_beach_info:
      "First Beach is closest to the historic center, with rough waters, ideal for surfing. It has less infrastructure than other beaches, but it's a good option for those who want to stay close to the village.",
    second_beach_info:
      "Second Beach is the heart of Morro de São Paulo! It has calm waters, bars, restaurants, and lots of excitement. It's perfect for those who want to enjoy the beach with complete infrastructure and good nightlife.",
    third_beach_info:
      "Third Beach has calm, crystal-clear waters, perfect for swimming! It's more family-friendly and relaxing, with excellent inns and restaurants. Many boat tours depart from here.",
    fourth_beach_info:
      "Fourth Beach is the most extensive and quiet. Its waters are crystal clear with natural pools at low tide. It's ideal for those seeking relaxation and contact with nature.",
    fifth_beach_info:
      'Fifth Beach, also known as Enchantment Beach, is the most preserved and deserted. Perfect for those seeking privacy and untouched nature.',

    // Navigation and location
    findLocationResponse: 'I found {location} on the map. See the details:',
    createRouteResponse:
      "Creating route to {location}. I can start navigation when you're ready.",
    navigationStarted:
      'Starting navigation. Follow the on-screen instructions.',
    nearby_place:
      'You are near {placeName}, just {distance} away. Would you like more information?',

    // Food categories
    seafood: 'Seafood',
    bahian_food: 'Bahian Food',
    international_food: 'International',
    seafood_response:
      'The best seafood restaurants are Sambass on Third Beach and Ponto do Marisco on Second Beach. Both have fresh and delicious dishes, especially the shrimp moqueca and grilled lobster.',

    // Activities
    boat_tour: 'Boat Tour',
    diving: 'Diving',
    trails: 'Hiking Trails',
    diving_response:
      'There are excellent diving spots in Morro! The natural pool is perfect for snorkeling and accessible for beginners. For scuba diving, I recommend Nautica Diving School on Second Beach.',

    // Accommodation
    budget: 'Budget',
    comfort: 'Comfortable',
    luxury: 'Luxury',
    budget_accommodation_response:
      'For budget accommodation, I recommend Pousada Bahia Inn in the village or Hostel Morro de São Paulo, both offer good value for money and convenient location.',

    // Beach names
    first_beach_name: 'First Beach',
    second_beach_name: 'Second Beach',
    third_beach_name: 'Third Beach',
    fourth_beach_name: 'Fourth Beach',
    fifth_beach_name: 'Fifth Beach',

    // Specific questions
    ask_seafood: 'I want to know about seafood restaurants',
    ask_bahian: 'I want to know about Bahian food restaurants',
    ask_international: 'I want to know about international restaurants',
    ask_first_beach: 'Tell me about First Beach',
    ask_second_beach: 'Tell me about Second Beach',
    ask_third_beach: 'Tell me about Third Beach',
    ask_fourth_beach: 'Tell me about Fourth Beach',
    ask_fifth_beach: 'Tell me about Fifth Beach',

    // Generic responses
    generic_response_1:
      'I understand your message. I can help with information about beaches, restaurants, accommodation, or tours in Morro de São Paulo.',
    generic_response_2:
      'To better help you, could you be more specific about what you want to know about Morro de São Paulo?',
    generic_response_3:
      'I can offer various information. What aspects of Morro de São Paulo are you interested in?',
    generic_response_4:
      'I can help with tips on beaches, restaurants, accommodation, or activities. What would you prefer to know?',

    // Interface elements
    ask_placeholder: 'Ask something about Morro de São Paulo...',
    assistant_placeholder: 'Ask something about Morro de São Paulo...',
    'placeholder.ask': 'Ask something about Morro de São Paulo...',
    assistant_title: 'Virtual Assistant',
    send_button: 'Send',
    voice_button: 'Voice input',
    close_button: 'Close',
    suggestion_button: 'Suggestion',
    toggle_button: 'Toggle assistant',
    system_error: 'Sorry, an error occurred. Please try again.',
    unknown_location:
      "I don't have specific information about this location, but I can tell you about the main beaches and tourist spots in Morro de São Paulo.",
    feature_selected:
      'You selected {feature}. I can provide more details about this option.',
    navigation_started:
      'Navigation started! Follow the on-screen instructions.',
    navigation_ended: 'Navigation ended.',
    navigation_error:
      'Could not start navigation. Please check your connection and try again.',

    // Voice settings
    voice_settings_button: 'Voice settings',
    voice_settings_title: 'Voice Settings',
    select_voice: 'Select a voice',
    preview_voice: 'Test voice',
    speech_rate: 'Speech rate',
    speech_pitch: 'Voice pitch',
    save_settings: 'Save settings',
    voice_preview_text:
      'Hello! This is a sample of how this voice will sound in the virtual assistant.',
  },

  es: {
    // Mensajes de bienvenida y generales
    welcome:
      '¡Hola! Soy tu asistente virtual para Morro de São Paulo. ¿En qué puedo ayudarte?',
    greeting_response:
      '¡Hola! ¿Cómo puedo ayudarte a descubrir Morro de São Paulo?',
    farewell_response:
      '¡Hasta luego! ¡Estoy aquí si necesitas más información!',
    thanks_response: '¡De nada! Estoy aquí para ayudar. ¿Necesitas algo más?',
    listeningPrompt: 'Estoy escuchando... Dime qué necesitas.',
    processingRequest: 'Procesando tu solicitud...',
    helpResponse:
      'Puedo ayudarte a encontrar lugares, crear rutas, proporcionar información sobre playas, restaurantes y excursiones. ¿Qué estás buscando?',
    weather_response:
      'El clima en Morro de São Paulo es generalmente cálido y soleado, con temperaturas entre 25°C y 30°C durante la mayor parte del año. La temporada alta es de diciembre a marzo.',
    language_changed_to: 'Idioma cambiado a Español',

    // Playas
    beachInfoResponse:
      'Morro de São Paulo tiene 5 playas principales. La Primera Playa es más animada, la Segunda tiene muchos bares y restaurantes, la Tercera es más tranquila, la Cuarta es menos concurrida y la Quinta (Playa del Encanto) es la más aislada. ¿Cuál te gustaría conocer?',
    first_beach_info:
      'La Primera Playa está más cerca del centro histórico, con aguas agitadas, ideal para el surf. Tiene menos infraestructura que otras playas, pero es una buena opción para quienes quieren estar cerca del pueblo.',
    second_beach_info:
      '¡La Segunda Playa es el corazón de Morro de São Paulo! Tiene aguas tranquilas, bares, restaurantes y mucha animación. Es perfecta para quienes quieren disfrutar de la playa con infraestructura completa y buena vida nocturna.',
    third_beach_info:
      'La Tercera Playa tiene aguas tranquilas y cristalinas, ¡perfectas para nadar! Es más familiar y relajante, con excelentes posadas y restaurantes. De aquí salen muchos barcos para paseos.',
    fourth_beach_info:
      'La Cuarta Playa es la más extensa y tranquila. Sus aguas son cristalinas con piscinas naturales en marea baja. Es ideal para quienes buscan relajación y contacto con la naturaleza.',
    fifth_beach_info:
      'La Quinta Playa, también conocida como Playa del Encanto, es la más preservada y desierta. Perfecta para quienes buscan privacidad y naturaleza virgen.',

    // Navegación y ubicación
    findLocationResponse: 'Encontré {location} en el mapa. Mira los detalles:',
    createRouteResponse:
      'Creando ruta a {location}. Puedo iniciar la navegación cuando estés listo.',
    navigationStarted:
      'Iniciando navegación. Sigue las instrucciones en pantalla.',
    nearby_place:
      'Estás cerca de {placeName}, a solo {distance} de distancia. ¿Te gustaría más información?',

    // Categorías de comida
    seafood: 'Mariscos',
    bahian_food: 'Comida Bahiana',
    international_food: 'Internacional',
    seafood_response:
      'Los mejores restaurantes de mariscos son Sambass en la Tercera Playa y Ponto do Marisco en la Segunda Playa. Ambos tienen platos frescos y deliciosos, especialmente la moqueca de camarones y la langosta a la parrilla.',

    // Actividades
    boat_tour: 'Paseo en Barco',
    diving: 'Buceo',
    trails: 'Senderos',
    diving_response:
      '¡Hay excelentes lugares para bucear en Morro! La piscina natural es perfecta para snorkel y accesible para principiantes. Para buceo con tanque, recomiendo Nautica Diving School en la Segunda Playa.',

    // Alojamiento
    budget: 'Económico',
    comfort: 'Confortable',
    luxury: 'Lujo',
    budget_accommodation_response:
      'Para alojamiento económico, recomiendo la Pousada Bahia Inn en el pueblo o el Hostel Morro de São Paulo, ambos ofrecen buena relación calidad-precio y ubicación conveniente.',

    // Nombres de playas
    first_beach_name: 'Primera Playa',
    second_beach_name: 'Segunda Playa',
    third_beach_name: 'Tercera Playa',
    fourth_beach_name: 'Cuarta Playa',
    fifth_beach_name: 'Quinta Playa',

    // Preguntas específicas
    ask_seafood: 'Quiero saber sobre restaurantes de mariscos',
    ask_bahian: 'Quiero saber sobre restaurantes de comida bahiana',
    ask_international: 'Quiero saber sobre restaurantes internacionales',
    ask_first_beach: 'Háblame de la Primera Playa',
    ask_second_beach: 'Háblame de la Segunda Playa',
    ask_third_beach: 'Háblame de la Tercera Playa',
    ask_fourth_beach: 'Háblame de la Cuarta Playa',
    ask_fifth_beach: 'Háblame de la Quinta Playa',

    // Respuestas genéricas
    generic_response_1:
      'Entiendo tu mensaje. Puedo ayudarte con información sobre playas, restaurantes, alojamiento o tours en Morro de São Paulo.',
    generic_response_2:
      'Para ayudarte mejor, ¿podrías ser más específico sobre lo que quieres saber de Morro de São Paulo?',
    generic_response_3:
      'Puedo ofrecer información variada. ¿En qué aspectos de Morro de São Paulo estás interesado?',
    generic_response_4:
      'Puedo ayudarte con consejos sobre playas, restaurantes, alojamiento o actividades. ¿Qué prefieres saber?',

    // Elementos de la interfaz
    ask_placeholder: 'Pregunta algo sobre Morro de São Paulo...',
    assistant_placeholder: 'Pregunta algo sobre Morro de São Paulo...',
    'placeholder.ask': 'Pregunta algo sobre Morro de São Paulo...',
    assistant_title: 'Asistente Virtual',
    send_button: 'Enviar',
    voice_button: 'Entrada de voz',
    close_button: 'Cerrar',
    suggestion_button: 'Sugerencia',
    toggle_button: 'Alternar asistente',
    system_error: 'Lo siento, ocurrió un error. Por favor, inténtalo de nuevo.',
    unknown_location:
      'No tengo información específica sobre esta ubicación, pero puedo hablarte sobre las principales playas y puntos turísticos de Morro de São Paulo.',
    feature_selected:
      'Has seleccionado {feature}. Puedo proporcionarte más detalles sobre esta opción.',
    navigation_started:
      '¡Navegación iniciada! Sigue las instrucciones en pantalla.',
    navigation_ended: 'Navegación finalizada.',
    navigation_error:
      'No se pudo iniciar la navegación. Por favor, verifica tu conexión e inténtalo de nuevo.',

    // Configuración de voz
    voice_settings_button: 'Configuración de voz',
    voice_settings_title: 'Configuración de Voz',
    select_voice: 'Seleccione una voz',
    preview_voice: 'Probar voz',
    speech_rate: 'Velocidad del habla',
    speech_pitch: 'Tono de voz',
    save_settings: 'Guardar configuración',
    voice_preview_text:
      '¡Hola! Esta es una muestra de cómo sonará esta voz en el asistente virtual.',
  },

  he: {
    // הודעות כלליות וברכה
    welcome:
      'שלום! אני העוזר הווירטואלי של מורו דה סאו פאולו. איך אני יכול לעזור?',
    greeting_response:
      'שלום! איך אני יכול לעזור לך לגלות את מורו דה סאו פאולו?',
    farewell_response: 'להתראות! אני כאן אם תצטרך מידע נוסף!',
    thanks_response: 'בבקשה! אני כאן כדי לעזור. האם אתה צריך משהו נוסף?',
    listeningPrompt: 'אני מקשיב... אמור לי מה אתה צריך.',
    processingRequest: 'מעבד את הבקשה שלך...',
    helpResponse:
      'אני יכול לעזור לך למצוא מקומות, ליצור מסלולי ניווט, לספק מידע על חופים, מסעדות וסיורים. פשוט אמור לי מה אתה מחפש!',
    weather_response:
      'מזג האוויר במורו דה סאו פאולו בדרך כלל חם ושמשי, עם טמפרטורות בין 25°C ל-30°C ברוב ימות השנה. העונה הגבוהה היא מדצמבר עד מרץ.',
    language_changed_to: 'השפה שונתה לעברית',

    // חופים
    beachInfoResponse:
      'מורו דה סאו פאולו יש 5 חופים עיקריים. החוף הראשון הוא תוסס יותר, השני יש בו הרבה ברים ומסעדות, השלישי רגוע יותר, הרביעי פחות צפוף, והחמישי (חוף הקסם) הוא המבודד ביותר. איזה מהם היית רוצה להכיר?',
    first_beach_info:
      'החוף הראשון הוא הקרוב ביותר למרכז ההיסטורי, עם מים סוערים, אידיאלי לגלישה. יש לו פחות תשתיות מחופים אחרים, אבל זו אפשרות טובה למי שרוצה להישאר קרוב לכפר.',
    second_beach_info:
      'החוף השני הוא לב מורו דה סאו פאולו! יש בו מים שקטים, ברים, מסעדות והרבה פעילות. זה מושלם למי שרוצה ליהנות מהחוף עם תשתית מלאה וחיי לילה טובים.',
    third_beach_info:
      'החוף השלישי יש מים שקטים וצלולים, מושלמים לשחייה! הוא יותר משפחתי ומרגיע, עם פונדקים ומסעדות מצוינים. מכאן יוצאות סירות רבות לטיולים.',
    fourth_beach_info:
      'החוף הרביעי הוא הנרחב והשקט ביותר. המים שלו צלולים עם בריכות טבעיות בשפל. זה אידיאלי למי שמחפש רגיעה ומגע עם הטבע.',
    fifth_beach_info:
      'החוף החמישי, הידוע גם כחוף הקסם, הוא השמור והשומם ביותר. מושלם למי שמחפש פרטיות וטבע בתולי.',

    // ניווט ומיקום
    findLocationResponse: 'מצאתי את {location} על המפה. ראה את הפרטים:',
    createRouteResponse:
      'יוצר מסלול אל {location}. אני יכול להתחיל בניווט כשתהיה מוכן.',
    navigationStarted: 'מתחיל ניווט. עקוב אחר ההוראות על המסך.',
    nearby_place:
      'אתה קרוב ל {placeName}, במרחק {distance} בלבד. האם תרצה לדעת עוד?',

    // קטגוריות מזון
    seafood: 'פירות ים',
    bahian_food: 'אוכל באהיאני',
    international_food: 'בינלאומי',
    seafood_response:
      'מסעדות פירות הים הטובות ביותר הן סמבס בחוף השלישי ופונטו דו מריסקו בחוף השני. לשניהם יש מנות טריות וטעימות, במיוחד המוקיקה החסילונים והלובסטר בגריל.',

    // פעילויות
    boat_tour: 'שיט',
    diving: 'צלילה',
    trails: 'שבילי הליכה',
    diving_response:
      'יש נקודות צלילה מצוינות במורו! הבריכה הטבעית מושלמת לשנורקלינג ונגישה גם למתחילים. לצלילה עם מיכל, אני ממליץ על הנאוטיקה דייבינג סקול בחוף השני.',

    // מגורים
    budget: 'חסכוני',
    comfort: 'נוח',
    luxury: 'יוקרתי',
    budget_accommodation_response:
      'ללינה חסכונית, אני ממליץ על פוסאדה באהיה אין בכפר או על ההוסטל מורו דה סאו פאולו, שניהם מציעים תמורה טובה לכסף וממוקמים היטב.',

    // שמות חופים
    first_beach_name: 'חוף ראשון',
    second_beach_name: 'חוף שני',
    third_beach_name: 'חוף שלישי',
    fourth_beach_name: 'חוף רביעי',
    fifth_beach_name: 'חוף חמישי',

    // שאלות ספציפיות
    ask_seafood: 'אני רוצה לדעת על מסעדות פירות ים',
    ask_bahian: 'אני רוצה לדעת על מסעדות אוכל באהיאני',
    ask_international: 'אני רוצה לדעת על מסעדות אוכל בינלאומי',
    ask_first_beach: 'ספר לי על החוף הראשון',
    ask_second_beach: 'ספר לי על החוף השני',
    ask_third_beach: 'ספר לי על החוף השלישי',
    ask_fourth_beach: 'ספר לי על החוף הרביעי',
    ask_fifth_beach: 'ספר לי על החוף החמישי',

    // תגובות כלליות
    generic_response_1:
      'אני מבין את ההודעה שלך. אני יכול לעזור עם מידע על חופים, מסעדות, לינה או סיורים במורו דה סאו פאולו.',
    generic_response_2:
      'כדי לעזור לך טוב יותר, האם תוכל להיות יותר ספציפי לגבי מה שאתה רוצה לדעת על מורו דה סאו פאולו?',
    generic_response_3:
      'אני יכול להציע מידע מגוון. באילו היבטים של מורו דה סאו פאולו אתה מתעניין?',
    generic_response_4:
      'אני יכול לעזור עם טיפים על חופים, מסעדות, לינה או פעילויות. מה אתה מעדיף לדעת?',

    // רכיבי ממשק
    ask_placeholder: '...שאל משהו על מורו דה סאו פאולו',
    assistant_placeholder: '...שאל משהו על מורו דה סאו פאולו',
    'placeholder.ask': '...שאל משהו על מורו דה סאו פאולו',
    assistant_title: 'עוזר וירטואלי',
    send_button: 'שלח',
    voice_button: 'קלט קולי',
    close_button: 'סגור',
    suggestion_button: 'הצעה',
    toggle_button: 'החלף מצב עוזר',
    system_error: 'מצטער, אירעה שגיאה. אנא נסה שוב.',
    unknown_location:
      'אין לי מידע ספציפי על מיקום זה, אבל אני יכול לספר לך על החופים המרכזיים ומוקדי התיירות במורו דה סאו פאולו.',
    feature_selected:
      'בחרת ב{feature}. אני יכול לספק לך פרטים נוספים על אפשרות זו.',
    navigation_started: 'הניווט התחיל! עקוב אחר ההוראות על המסך.',
    navigation_ended: 'הניווט הסתיים.',
    navigation_error: 'לא ניתן להתחיל בניווט. אנא בדוק את החיבור שלך ונסה שוב.',

    // הגדרות קול
    voice_settings_button: 'הגדרות קול',
    voice_settings_title: 'הגדרות קול',
    select_voice: 'בחר קול',
    preview_voice: 'בדוק קול',
    speech_rate: 'מהירות דיבור',
    speech_pitch: 'גובה קול',
    save_settings: 'שמור הגדרות',
    voice_preview_text: 'שלום! זו דוגמה לאיך הקול הזה יישמע בעוזר הווירטואלי.',
  },
};

// Exportar getAssistantText e outras funções
export function getAssistantText(key, language = null) {
  // Determinar o idioma a ser usado (fallback para pt)
  const lang =
    language ||
    (window.localStorage && localStorage.getItem('preferredLanguage')) ||
    'pt';

  // Verificar se existe tradução para o idioma solicitado
  if (assistantTranslations[lang] && assistantTranslations[lang][key]) {
    return assistantTranslations[lang][key];
  }

  // Fallback para português se não houver tradução
  if (assistantTranslations.pt && assistantTranslations.pt[key]) {
    return assistantTranslations.pt[key];
  }

  // Se não houver tradução em português, usar a chave como texto
  return `⚠️ ${key}`;
}

// Função para atualizar textos na interface do assistente
export function updateAssistantUITexts(language = 'pt') {
  try {
    // Garantir que o container do assistente existe
    ensureAssistantElementsExist();

    // Carregar traduções necessárias
    forceLoadRequiredTranslations(language);

    // Atualizar os elementos da interface
    const elementsToUpdate = [
      {
        selector: '.assistant-header h3, #assistant-title',
        key: 'assistant_title',
      },
      {
        selector: '#assistant-input-field',
        key: 'ask_placeholder',
      },
      {
        selector: '#assistant-send-btn',
        key: 'send_button',
        type: 'aria-label',
      },
      {
        selector: '#assistant-voice-btn',
        key: 'voice_button',
        type: 'aria-label',
      },
      {
        selector: '#close-assistant-dialog',
        key: 'close_button',
        type: 'aria-label',
      },
    ];

    elementsToUpdate.forEach((item) => {
      const elements = document.querySelectorAll(item.selector);
      if (elements.length === 0) return;

      const translation = getAssistantText(item.key, language);

      elements.forEach((element) => {
        if (item.type === 'aria-label' || item.type === 'title') {
          element.setAttribute(item.type, translation);
        } else if (element.tagName === 'INPUT') {
          element.placeholder = translation;
        } else {
          element.textContent = translation;
        }
      });
    });

    // Atualizar também mensagens existentes
    updateExistingMessages(language);

    console.log(`Textos do assistente atualizados para: ${language}`);
  } catch (error) {
    console.error('Erro ao atualizar textos do assistente:', error);
  }
}

// Função auxiliar para garantir que os elementos do assistente existam
function ensureAssistantElementsExist() {
  const assistantContainer = document.querySelector('#digital-assistant');
  if (!assistantContainer) {
    console.log(
      'Container do assistente não encontrado, criando elementos básicos...'
    );

    // Criar elementos básicos para o assistente
    const container = document.createElement('div');
    container.id = 'digital-assistant';
    container.className = 'digital-assistant';

    container.innerHTML = `
      <div id="assistant-toggle" class="assistant-icon">
        <i class="fas fa-robot"></i>
      </div>
      <div id="assistant-dialog" class="assistant-panel">
        <div class="assistant-header">
          <h3 id="assistant-title">Assistente Virtual</h3>
          <div class="assistant-controls">
            <button id="assistant-minimize-btn" class="assistant-btn"><i class="fas fa-minus"></i></button>
            <button id="close-assistant-dialog" class="assistant-btn"><i class="fas fa-times"></i></button>
          </div>
        </div>
        <div id="assistant-messages" class="assistant-messages">
          <ul class="messages-list"></ul>
        </div>
        <div class="assistant-input">
          <input id="assistant-input-field" type="text" placeholder="Pergunte algo..." />
          <button id="assistant-send-btn" class="assistant-btn send-btn">
            <i class="fas fa-paper-plane"></i>
          </button>
          <button id="assistant-voice-btn" class="assistant-btn voice-btn">
            <i class="fas fa-microphone"></i>
          </button>
        </div>
        <div class="assistant-suggestions">
          <button class="suggestion-btn">Praias</button>
          <button class="suggestion-btn">Restaurantes</button>
          <button class="suggestion-btn">Passeios</button>
        </div>
      </div>
    `;

    document.body.appendChild(container);
  }
}

// Função para garantir que traduções necessárias estejam carregadas
function forceLoadRequiredTranslations(language) {
  if (!assistantTranslations[language]) {
    assistantTranslations[language] = {};
  }

  // Garantir que chaves essenciais estejam presentes
  const essentialKeys = [
    'assistant_title',
    'ask_placeholder',
    'send_button',
    'voice_button',
    'close_button',
    'welcome',
  ];

  essentialKeys.forEach((key) => {
    if (!assistantTranslations[language][key]) {
      // Usar fallback do português
      assistantTranslations[language][key] =
        assistantTranslations.pt[key] || key;
    }
  });
}

// Função para atualizar mensagens existentes na interface
function updateExistingMessages(language) {
  const messages = document.querySelectorAll(
    '.assistant-message .message-text, .message-bubble .message-text'
  );

  if (!messages || messages.length === 0) {
    console.log('Nenhuma mensagem encontrada para atualizar');
    return;
  }

  console.log(
    `Atualizando ${messages.length} mensagens existentes para idioma: ${language}`
  );

  messages.forEach((message) => {
    if (!message || !message.textContent) return;

    const text = message.textContent.trim();

    // Verificar se é uma mensagem de boas-vindas
    const welcomePatterns = {
      pt: ['Olá!', 'Bem-vindo', 'Oi!'],
      en: ['Hello!', 'Welcome', 'Hi!'],
      es: ['¡Hola!', 'Bienvenido', '¡Hola!'],
      he: ['שלום!', 'ברוך הבא'],
    };

    // Verificar todos os padrões do idioma atual
    const patterns = welcomePatterns[language] || [];
    let isWelcomeMessage = false;

    for (const pattern of patterns) {
      if (text.includes(pattern)) {
        isWelcomeMessage = true;
        break;
      }
    }

    // Se for mensagem de boas-vindas, atualizar com o texto traduzido
    if (isWelcomeMessage) {
      const welcomeText = getAssistantText('welcome', language);
      if (welcomeText) {
        message.textContent = welcomeText;
      }
    }

    // Verificar outras mensagens comuns para tradução
    const commonMessages = [
      'greeting_response',
      'farewell_response',
      'thanks_response',
      'help_response',
      'location_reached',
      'attraction_nearby',
    ];

    // Tentar encontrar correspondências para outras mensagens comuns
    for (const key of commonMessages) {
      const translatedText = getAssistantText(key, language);
      if (translatedText && text.includes(translatedText)) {
        message.textContent = translatedText;
        break;
      }
    }
  });
}

// Exportar tradução de conteúdo HTML
export function translateHTMLContent(htmlContent, language) {
  const translationPattern = /{{(TRANSLATE|i18n):([^}]+)}}/g;

  return htmlContent.replace(translationPattern, (match, prefix, key) => {
    return getAssistantText(key, language) || key;
  });
}

// Adicionar ao arquivo translations.js
/**
 * Configura suporte para idiomas da direita para a esquerda (RTL) como o Hebraico
 * @param {string} language - Código do idioma atual
 * @returns {boolean} - true se o idioma for RTL
 */
function setupRTLSupport(language) {
  // Lista completa de idiomas RTL
  const rtlLanguages = ['he', 'ar', 'fa', 'ur', 'yi', 'dv'];

  // Verificar se o idioma é RTL
  const isRTL = rtlLanguages.includes(language);

  // Configurar atributo dir no HTML para suporte RTL
  document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');

  // Adicionar/remover classe RTL do body
  document.body.classList.toggle('rtl-language', isRTL);

  // Aplicar classe RTL a todos os elementos do assistente
  const assistantElements = document.querySelectorAll(
    '.digital-assistant, #digital-assistant, .assistant-dialog, #assistant-dialog, ' +
      '.assistant-panel, #assistant-panel, #assistant-messages, .assistant-messages, ' +
      '.assistant-input, .message-bubble, '
  );

  assistantElements.forEach((el) => {
    if (el) {
      el.classList.toggle('rtl-language', isRTL);
      el.style.direction = isRTL ? 'rtl' : 'ltr';
    }
  });

  console.log(
    `Assistente: Suporte RTL ${isRTL ? 'ativado' : 'desativado'} para o idioma ${language}`
  );

  return isRTL;
}

// Adicionar ao arquivo translations.js
export function initializeLanguage() {
  // Obter idioma do localStorage ou definir o padrão
  const storedLanguage = localStorage.getItem('preferredLanguage') || 'pt';

  // Configurar direção RTL para hebraico
  setupRTLSupport(storedLanguage);

  // Atualizar textos da interface
  updateAssistantUITexts(storedLanguage);

  console.log(`Inicialização de idioma concluída: ${storedLanguage}`);
  return storedLanguage;
}
