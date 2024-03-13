let currentPage = 1;
const limit = 1302; // total number of Pokemon
const baseUrl = 'https://pokeapi.co/api/v2/pokemon';
const imgUrl = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/';
let pokemons = [];
let displayedPokemons = [];

// check favorites in local storage or initialize it
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

// helper function to capitalize the first letter of a string
const formatName = (name) => {
  return name
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

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
    const isFavorite = favorites.includes(pokemonId);
    const pokemonElement = document.createElement('div');
    pokemonElement.innerHTML = `
      <div class="card-id">${pokemonId}</div>
      <i class="material-icons favorite-icon">${isFavorite ? 'star' : 'star_border'}</i>
      <img class="pokemon-image" src="${imgUrl}${pokemonId}.png" alt="${pokemon.name}" />
      <h2>${formatName(pokemon.name)}</h2>
      `;
    container.appendChild(pokemonElement);

    // Event listener for Pokemon grid element
    pokemonElement.addEventListener('click', (e) => {
      if (e.target !== favoriteIcon) {
        displayPokemonDetails(pokemon.url);
      }
    });

    // Event listener for favorite icon
    const favoriteIcon = pokemonElement.querySelector('.favorite-icon');
    favoriteIcon.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent triggering the Pokemon grid element event listener
      if (favorites.includes(pokemonId)) {
        // Remove from favorites
        favorites = favorites.filter((id) => id !== pokemonId);
        favoriteIcon.textContent = 'star_border';
      } else {
        // Add to favorites
        favorites.push(pokemonId);
        favoriteIcon.textContent = 'star';
      }
      // Update favorites in local storage
      localStorage.setItem('favorites', JSON.stringify(favorites));
    });
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
      <button class="close-button">&times;</button>
      <div class="pokemon-details">
        <img src="${imgUrl}${pokemon.id}.png" alt="${pokemon.name}" />
        <table>
          <thead>
            <tr>
              <th colspan="2">${formatName(pokemon.name)}</th>
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
              <td>${pokemon.height / 10.0} m</td> <!-- Convert height from decimetres to meters -->
            </tr>
            <tr>
              <th>Weight</th>
              <td>${pokemon.weight / 10.0} kg</td> <!-- Convert weight from hectograms to kilograms -->
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
      <h2>${formatName(pokemon.name)}</h2>
      `;
    container.appendChild(pokemonElement);
    pokemonElement.addEventListener('click', () => displayPokemonDetails(pokemon.url));
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
