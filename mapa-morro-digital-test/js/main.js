function initializeMap() {
    try {
        console.log('Iniciando aplicação...');
        // Logic to initialize the map
        // If there's an error, throw it
        throw new Error('Erro ao inicializar o mapa');
    } catch (error) {
        console.error('Erro ao inicializar o mapa:', error);
    }
    console.log('Aplicação inicializada com sucesso!');
}

initializeMap();