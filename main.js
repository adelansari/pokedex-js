let currentPage = 1;
const limit = 1302; // total number of Pokemon
const baseUrl = 'https://pokeapi.co/api/v2/pokemon';
const imgUrl = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/';
let pokemons = [];
let displayedPokemons = [];

const fetchPokemon = async () => {
  try {
    const response = await fetch(`${baseUrl}?limit=${limit}`);
    if (!response.ok) {
      throw new Error(`Error status: ${response.status}`);
    }
    const data = await response.json();
    pokemons = data.results;
    updateDisplayedPokemons();
  } catch (error) {
    console.error(error);
  }
};

const updateDisplayedPokemons = () => {
  displayedPokemons = pokemons.slice((currentPage - 1) * 20, currentPage * 20);
  displayPokemons(displayedPokemons);
  displayPagination();
};

const displayPokemons = (pokemons) => {
  const container = document.querySelector('#pokemon-container');
  container.innerHTML = ''; // clear the container

  pokemons.forEach((pokemon) => {
    const pokemonId = pokemon.url.split('/')[6]; // Extract the ID from the URL
    const pokemonElement = document.createElement('div');
    pokemonElement.innerHTML = `
      <img class="pokemon-image" src="${imgUrl}${pokemonId}.png" alt="${pokemon.name}" />
      <h2>${pokemon.name}</h2>
      `;
    container.appendChild(pokemonElement);
  });
};

const displayPokemonDetails = async (url) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error status: ${response.status}`);
    }
    const data = await response.json();
  } catch (error) {
    console.error(error);
  }
};

const displayPagination = () => {
  const pagination = document.querySelector('#pagination');
  pagination.innerHTML = ''; // clear the pagination

  if (currentPage > 1) {
    const prevButton = document.createElement('button');
    prevButton.textContent = 'Previous Page';
    prevButton.addEventListener('click', () => {
      currentPage--;
      updateDisplayedPokemons();
    });
    pagination.appendChild(prevButton);
  }

  const currentPageSpan = document.createElement('span');
  currentPageSpan.textContent = `Page ${currentPage}`;
  pagination.appendChild(currentPageSpan);

  if (currentPage < pokemons.length / 20) {
    const nextButton = document.createElement('button');
    nextButton.textContent = 'Next Page';
    nextButton.addEventListener('click', () => {
      currentPage++;
      updateDisplayedPokemons();
    });
    pagination.appendChild(nextButton);
  }
};

const displaySearchResults = (pokemons) => {
  const container = document.querySelector('#pokemon-container');
  container.innerHTML = ''; // clear the container

  pokemons.forEach((pokemon) => {
    const pokemonId = pokemon.url.split('/')[6]; // Extract the ID from the URL
    const pokemonElement = document.createElement('div');
    pokemonElement.innerHTML = `
      <img class="pokemon-image" src="${imgUrl}${pokemonId}.png" alt="${pokemon.name}" />
      <h2>${pokemon.name}</h2>
      `;
    container.appendChild(pokemonElement);
  });
};
// Event listeners
document.querySelector('#search-bar').addEventListener('input', (e) => {
  const searchTerm = e.target.value.toLowerCase();
  const filteredPokemons = pokemons.filter((pokemon) => pokemon.name.includes(searchTerm));
  displaySearchResults(filteredPokemons);
});

// Fetch all the Pokemon data
fetchPokemon();
