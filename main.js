const config = {
  baseUrl: 'https://pokeapi.co/api/v2/pokemon',
  imgUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/',
  pageSize: 20,
};

const elements = {
  loader: document.querySelector('#loader'),
  pokemonContainer: document.querySelector('#pokemon-container'),
  paginationContainer: document.querySelector('#pagination'),
  pokemonModal: document.querySelector('#pokemon-modal'),
  searchBar: document.querySelector('#search-bar'),
};

const state = {
  currentPage: 1,
  pokemons: [],
  favorites: JSON.parse(localStorage.getItem('favorites')) || [],
};

// Helper Functions
const capitalize = (name) =>
  name
    .split('-')
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ');

const showLoader = () => (elements.loader.style.display = 'block');
const hideLoader = () => (elements.loader.style.display = 'none');

const fetchAllPokemon = async () => {
  try {
    showLoader();
    let url = `${config.baseUrl}?limit=100000`;
    const allPokemon = []; // Array to store ALL Pokemon

    do {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      const data = await response.json();

      allPokemon.push(...data.results); // Add Pokemon to the array
      url = data.next; // Update URL for the next batch
    } while (url); // Continue fetching as long as there's a 'next' URL

    state.pokemons = allPokemon;
  } finally {
    hideLoader();
  }
};

// Rendering Functions
const renderPokemonCard = (pokemon) => {
  const isFavorite = state.favorites.includes(pokemon.id.toString()); // Assuming Pokemon ID is a number
  return `
    <div class="pokemon-card">
      <div class="card-id">${pokemon.id}</div>
      <i class="material-icons favorite-icon">${isFavorite ? 'star' : 'star_border'}</i>
      <img class="pokemon-image" src="${config.imgUrl}${pokemon.id}.png" alt="${pokemon.name}" />
      <h2>${capitalize(pokemon.name)}</h2>
    </div>
  `;
};

const renderPokemonList = () => {
  const start = (state.currentPage - 1) * config.pageSize;
  const end = start + config.pageSize;
  const displayedPokemons = state.pokemons.slice(start, end);

  elements.pokemonContainer.innerHTML = displayedPokemons
    .map((pokemon) => {
      // Update renderPokemonCard to use the actual properties from your Pokemon object
      return renderPokemonCard(pokemon);
    })
    .join('');

  addPokemonCardListeners();
};

const renderPagination = () => {
  elements.paginationContainer.innerHTML = ''; // Clear existing pagination

  let totalPages = Math.ceil(state.pokemons.length / config.pageSize);

  if (state.currentPage > 1) {
    const prevButton = document.createElement('button');
    prevButton.textContent = 'Previous';
    prevButton.addEventListener('click', () => {
      state.currentPage--;
      updateDisplayedPokemons();
    });
    elements.paginationContainer.appendChild(prevButton);
  }

  if (state.currentPage < totalPages) {
    const nextButton = document.createElement('button');
    nextButton.textContent = 'Next';
    nextButton.addEventListener('click', () => {
      state.currentPage++;
      updateDisplayedPokemons();
    });
    elements.paginationContainer.appendChild(nextButton);
  }
};

const renderPokemonModal = (pokemon) => {
  elements.pokemonModal.innerHTML = `
    <div class="modal-content">
      <button class="close-button">&times;</button>
      <div class="pokemon-details">
        <img src="${config.imgUrl}${pokemon.id}.png" alt="${pokemon.name}" />
        <table>
          <thead>
            <tr>
              <th colspan="2">${capitalize(pokemon.name)}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th>ID</th>
              <td>${pokemon.id}</td>
            </tr>
            <tr>
              <th>Types</th>
              <td>${pokemon.types.map((type) => type.type.name).join(', ')}</td>
            </tr>
            <tr>
              <th>Species</th>
              <td>${pokemon.species.name}</td>
            </tr>
            <tr>
              <th>Height</th>
              <td>${(pokemon.height / 10.0).toFixed(1)} m</td> 
            </tr>
            <tr>
              <th>Weight</th>
              <td>${(pokemon.weight / 10.0).toFixed(1)} kg</td> 
            </tr>
            <tr>
              <th>Stats</th>
              <td>
                <ul>
                  ${pokemon.stats.map((stat) => `<li>${stat.stat.name}: ${stat.base_stat}</li>`).join('')}
                </ul>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `;

  elements.pokemonModal.style.display = 'block';

  elements.pokemonModal.querySelector('.close-button').addEventListener('click', closeModal);
  window.addEventListener('click', (event) => {
    if (event.target === elements.pokemonModal) closeModal();
  });
};

const closeModal = () => {
  elements.pokemonModal.style.display = 'none';
};

// Event Listeners
const addPokemonCardListeners = () => {
  elements.pokemonContainer.querySelectorAll('.pokemon-card').forEach((card) => {
    card.addEventListener('click', () => displayPokemonDetails(card.querySelector('.card-id').textContent));

    card.querySelector('.favorite-icon').addEventListener('click', (e) => {
      e.stopPropagation();
      toggleFavorite(card.querySelector('.card-id').textContent);
    });
  });
};

elements.searchBar.addEventListener('input', (e) => {
  clearTimeout(searchTimeout); // Clear any existing timeouts

  searchTimeout = setTimeout(() => {
    const searchTerm = e.target.value.toLowerCase();
    if (searchTerm) {
      const filteredPokemons = state.pokemons.filter((pokemon) => pokemon.name.includes(searchTerm));
      renderPokemonList(filteredPokemons);
    } else {
      updateDisplayedPokemons();
    }
  }, 500);
});

// State Management
const displayPokemonDetails = async (pokemonId) => {
  try {
    showLoader();
    const response = await fetch(`${config.baseUrl}/${pokemonId}`);
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    const pokemonData = await response.json();
    renderPokemonModal(pokemonData);
  } catch (error) {
    console.error('Error fetching details:', error);
  } finally {
    hideLoader();
  }
};

const updateDisplayedPokemons = () => {
  renderPokemonList();
  renderPagination();
};

const toggleFavorite = (pokemonId) => {
  const index = state.favorites.indexOf(pokemonId);
  if (index > -1) {
    state.favorites.splice(index, 1);
  } else {
    state.favorites.push(pokemonId);
  }
  localStorage.setItem('favorites', JSON.stringify(state.favorites));
  updateDisplayedPokemons();
};

// Initialization
const initialize = async () => {
  state.pokemons = await fetchAllPokemon();
  updateDisplayedPokemons();
};

initialize(); // Start fetching and display
