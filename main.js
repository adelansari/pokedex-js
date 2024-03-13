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

    // Event listener for Pokemon grid element
    pokemonElement.addEventListener('click', () => displayPokemonDetails(pokemon.url));
  });
};

const displayPokemonDetails = async (url) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error status: ${response.status}`);
    }
    const data = await response.json();
    displayModal(data);
  } catch (error) {
    console.error(error);
  }
};

const displayModal = (pokemon) => {
  const modal = document.querySelector('#pokemon-modal');
  modal.innerHTML = `
    <div class="modal-content">
      <span class="close-button">&times;</span>
      <img src="${imgUrl}${pokemon.id}.png" alt="${pokemon.name}" />
      <div>
        <h2>${pokemon.name}</h2>
        <p>Height: ${pokemon.height}</p>
        <p>Weight: ${pokemon.weight}</p>
        <p>Abilities: ${pokemon.abilities.map((ability) => ability.ability.name).join(', ')}</p>
        <p>Types: ${pokemon.types.map((type) => type.type.name).join(', ')}</p>
        <p>Stats:</p>
        <ul>
          ${pokemon.stats.map((stat) => `<li>${stat.stat.name}: ${stat.base_stat}</li>`).join('')}
        </ul>
      </div>
    </div>
  `;
  modal.style.display = 'block';
  modal.style.opacity = '0';
  setTimeout(() => {
    modal.style.opacity = '1';
  }, 1); // delay to trigger the transition

  // Disable scrolling
  document.body.style.overflow = 'hidden';

  // Close the modal when clicking outside of it
  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal(modal);
    }
  });

  // Close the modal when clicking the close button
  document.querySelector('.close-button').addEventListener('click', () => {
    closeModal(modal);
  });
};

const closeModal = (modal) => {
  modal.style.opacity = '0';
  setTimeout(() => {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto'; // re-enable scrolling
  }, 300); // delay to match the transition duration
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

let searchTimeout;

const displaySearchResults = (pokemons) => {
  const container = document.querySelector('#pokemon-container');
  container.innerHTML = ''; // clear the container

  if (pokemons.length === 0) {
    container.innerHTML = '<div class="no-results">No pokemon found</div>'; // Add a no results message
    return;
  }

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

document.querySelector('#search-bar').addEventListener('input', (e) => {
  clearTimeout(searchTimeout);

  searchTimeout = setTimeout(() => {
    const searchTerm = e.target.value.toLowerCase();
    if (searchTerm) {
      const filteredPokemons = pokemons.filter((pokemon) => pokemon.name.includes(searchTerm));
      displaySearchResults(filteredPokemons);
    } else {
      updateDisplayedPokemons();
    }
  }, 1000); // Delay of 1 second
});

// Fetch all the Pokemon data
fetchPokemon();
