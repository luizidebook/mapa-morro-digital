// integration/osm-data.js
export class OSMDataProvider {
  constructor() {
    this.cache = new Map();
    this.apiEndpoint = 'https://overpass-api.de/api/interpreter';
    this.cacheExpiration = 24 * 60 * 60 * 1000; // 24 horas
  }

  async fetchPOIsByCategory(category, bounds) {
    // Converter categoria para query OSM
    const query = this._buildQueryForCategory(category, bounds);
    const cacheKey = `${category}_${JSON.stringify(bounds)}`;

    // Verificar cache
    const cachedData = this._getFromCache(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    try {
      // Realizar consulta na API Overpass
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `data=${encodeURIComponent(query)}`,
      });

      if (!response.ok) {
        throw new Error(`Erro na consulta OSM: ${response.status}`);
      }

      const data = await response.json();

      // Processar e armazenar no cache
      const processedData = this._processOSMData(data, category);
      this._saveToCache(cacheKey, processedData);

      return processedData;
    } catch (error) {
      console.error('Erro ao buscar dados OSM:', error);
      throw error;
    }
  }

  async fetchPOIDetails(osmId, osmType) {
    const cacheKey = `details_${osmType}_${osmId}`;

    // Verificar cache
    const cachedData = this._getFromCache(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    // Construir query para detalhes do POI
    const query = `
      [out:json];
      ${osmType}(${osmId});
      out body;
      >;
      out skel qt;
    `;

    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `data=${encodeURIComponent(query)}`,
      });

      if (!response.ok) {
        throw new Error(`Erro na consulta OSM: ${response.status}`);
      }

      const data = await response.json();

      // Processar e armazenar no cache
      const processedData = this._processOSMDetails(data);
      this._saveToCache(cacheKey, processedData);

      return processedData;
    } catch (error) {
      console.error('Erro ao buscar detalhes OSM:', error);
      throw error;
    }
  }

  async searchByName(name, bounds) {
    const cacheKey = `search_${name}_${JSON.stringify(bounds)}`;

    // Verificar cache
    const cachedData = this._getFromCache(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    // Construir query de busca por nome
    const bbox = bounds
      ? `(${bounds.south},${bounds.west},${bounds.north},${bounds.east})`
      : '';
    const query = `
      [out:json];
      (
        node["name"~"${name}", i]${bbox};
        way["name"~"${name}", i]${bbox};
        relation["name"~"${name}", i]${bbox};
      );
      out body;
      >;
      out skel qt;
    `;

    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `data=${encodeURIComponent(query)}`,
      });

      if (!response.ok) {
        throw new Error(`Erro na consulta OSM: ${response.status}`);
      }

      const data = await response.json();

      // Processar e armazenar no cache
      const processedData = this._processOSMSearchResults(data, name);
      this._saveToCache(cacheKey, processedData);

      return processedData;
    } catch (error) {
      console.error('Erro ao buscar dados OSM por nome:', error);
      throw error;
    }
  }

  // Métodos auxiliares
  _buildQueryForCategory(category, bounds) {
    const bbox = bounds
      ? `(${bounds.south},${bounds.west},${bounds.north},${bounds.east})`
      : '';

    // Mapear categoria para tags OSM
    let tags;
    switch (category) {
      case 'praias':
        tags = ['natural=beach'];
        break;
      case 'pontos_turisticos':
        tags = ['tourism=attraction', 'historic=*', 'natural=viewpoint'];
        break;
      case 'restaurantes':
        tags = ['amenity=restaurant', 'amenity=cafe', 'amenity=bar'];
        break;
      case 'pousadas':
        tags = ['tourism=hotel', 'tourism=guest_house', 'tourism=hostel'];
        break;
      case 'lojas':
        tags = ['shop=*'];
        break;
      case 'emergencias':
        tags = [
          'amenity=hospital',
          'amenity=doctors',
          'amenity=pharmacy',
          'amenity=police',
        ];
        break;
      default:
        tags = [category]; // Usar a categoria diretamente como tag
    }

    // Construir query com as tags
    const tagQueries = tags
      .map((tag) => {
        const [key, value] = tag.split('=');
        return value === '*'
          ? `node["${key}"]${bbox};way["${key}"]${bbox};relation["${key}"]${bbox};`
          : `node["${key}"="${value}"]${bbox};way["${key}"="${value}"]${bbox};relation["${key}"="${value}"]${bbox};`;
      })
      .join('');

    return `
      [out:json];
      (
        ${tagQueries}
      );
      out body;
      >;
      out skel qt;
    `;
  }

  _processOSMData(data, category) {
    // Processar dados brutos do OSM para o formato desejado
    if (!data.elements || !data.elements.length) {
      return [];
    }

    const result = [];

    // Extrair nós, caminhos e relações
    const nodes = new Map();
    data.elements.forEach((element) => {
      if (element.type === 'node') {
        nodes.set(element.id, element);
      }
    });

    // Processar elementos
    data.elements.forEach((element) => {
      // Ignorar nós que são apenas parte de caminhos
      if (element.type === 'node' && !element.tags) {
        return;
      }

      // Para caminhos e relações, calcular centroide
      let lat, lon;
      if (element.type === 'way' || element.type === 'relation') {
        if (element.center) {
          // Usar centro fornecido pela API
          lat = element.center.lat;
          lon = element.center.lon;
        } else if (element.nodes) {
          // Calcular centro dos nós
          const nodeCoords = element.nodes
            .map((nodeId) => nodes.get(nodeId))
            .filter((node) => node !== undefined);

          if (nodeCoords.length > 0) {
            lat =
              nodeCoords.reduce((sum, node) => sum + node.lat, 0) /
              nodeCoords.length;
            lon =
              nodeCoords.reduce((sum, node) => sum + node.lon, 0) /
              nodeCoords.length;
          }
        }
      } else {
        // Nó simples
        lat = element.lat;
        lon = element.lon;
      }

      // Se não temos coordenadas, ignorar
      if (lat === undefined || lon === undefined) {
        return;
      }

      // Extrair informações relevantes
      const name = element.tags?.name || element.tags?.ref || `[${category}]`;
      const phone = element.tags?.phone || element.tags?.['contact:phone'];
      const website =
        element.tags?.website || element.tags?.['contact:website'];
      const hours = element.tags?.opening_hours;
      const description = this._generateDescription(element.tags, category);

      result.push({
        id: element.id,
        type: element.type,
        name: name,
        lat: lat,
        lon: lon,
        category: category,
        tags: element.tags || {},
        contact: {
          phone: phone,
          website: website,
          hours: hours,
        },
        description: description,
      });
    });

    return result;
  }

  _processOSMDetails(data) {
    if (!data.elements || !data.elements.length) {
      return null;
    }

    // Processar dados detalhados de um único elemento
    const element = data.elements.find((el) => el.tags);

    if (!element) {
      return null;
    }

    // Processar detalhes...
    // (similar ao _processOSMData, mas mais detalhado)

    return {
      id: element.id,
      type: element.type,
      name: element.tags?.name || element.tags?.ref || '[sem nome]',
      lat: element.lat || element.center?.lat,
      lon: element.lon || element.center?.lon,
      tags: element.tags || {},
      // Mais processamento e formatação de detalhes...
    };
  }

  _processOSMSearchResults(data, searchTerm) {
    // Processar resultados de busca
    // (similar ao _processOSMData, mas com score de relevância)

    if (!data.elements || !data.elements.length) {
      return [];
    }

    // Implementação similar ao _processOSMData, mas adiciona score de relevância
    // com base na similaridade com o termo de busca...

    return []; // Resultados processados
  }

  _generateDescription(tags, category) {
    if (!tags) return '';

    let description = '';

    // Gerar descrição com base nas tags e na categoria
    switch (category) {
      case 'praias':
        if (tags.description) {
          description = tags.description;
        } else {
          description = 'Praia ';
          if (tags.surface) description += `com areia ${tags.surface} `;
          if (tags.access)
            description += `(${tags.access === 'yes' ? 'acesso livre' : 'acesso restrito'}) `;
        }
        break;

      case 'restaurantes':
        description = tags.cuisine
          ? `Restaurante de ${tags.cuisine.replace(';', ', ')}`
          : 'Restaurante';
        break;

      // Mais categorias...

      default:
        description = tags.description || '';
    }

    return description;
  }

  _saveToCache(key, data) {
    this.cache.set(key, {
      data: data,
      timestamp: Date.now(),
    });
    setTimeout(() => this.cache.delete(key), this.cacheExpiration);
  }

  _getFromCache(key) {
    const cached = this.cache.get(key);

    if (!cached) return null;

    // Verificar expiração
    if (Date.now() - cached.timestamp > this.cacheExpiration) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }
}

// osm-data.js - Funções para busca e manipulação de dados OSM
export function getOSMQueryForCategory(category) {
  // Mapeamento de categorias para queries OSM
  const categoryQueries = {
    touristSpots: `
      [out:json];
      area["name"="Morro de São Paulo"]->.searchArea;
      (
        node["tourism"="attraction"](area.searchArea);
        way["tourism"="attraction"](area.searchArea);
        relation["tourism"="attraction"](area.searchArea);
      );
      out body;
      >;
      out skel qt;
    `,
    beaches: `
      [out:json];
      area["name"="Morro de São Paulo"]->.searchArea;
      (
        node["natural"="beach"](area.searchArea);
        way["natural"="beach"](area.searchArea);
        relation["natural"="beach"](area.searchArea);
      );
      out body;
      >;
      out skel qt;
    `,
    // ... outras categorias
  };

  return categoryQueries[category] || null;
}

export async function fetchOSMData(query) {
  try {
    const endpoint = 'https://overpass-api.de/api/interpreter';
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `data=${encodeURIComponent(query)}`,
    });

    if (!response.ok) {
      throw new Error(`Erro na resposta: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar dados OSM:', error);
    throw error;
  }
}

export function displayCategoryResults(data, category) {
  // Processar e exibir os resultados no mapa
  if (!data || !data.elements || data.elements.length === 0) {
    console.warn(`Nenhum resultado encontrado para ${category}`);
    return;
  }

  // Limpar marcadores existentes
  clearMapMarkers();

  // Adicionar novos marcadores
  data.elements.forEach((element) => {
    if (element.type === 'node' && element.lat && element.lon) {
      const name = element.tags?.name || `${category} item`;
      addMapMarker(element.lat, element.lon, name, category);
    }
  });

  // Ajustar visualização para incluir todos os marcadores
  adjustMapViewToMarkers();
}

// ... outras funções relacionadas
