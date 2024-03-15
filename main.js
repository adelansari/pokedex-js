const baseUrl = 'https://pokeapi.co/api/v2/pokemon';
const imgUrl = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/';
let currentPage = 1;
let pokemons = [];
let pokemonId = [];
let displayedPokemons = [];
let favorites = JSON.parse(localStorage.getItem('favorites')) || []; // check favorites in local storage or initialize it
let timeoutId; // for pagination input

const typeColors = {
  normal: '#A8A77A',
  fire: '#EE8130',
  water: '#6390F0',
  electric: '#F7D02C',
  grass: '#7AC74C',
  ice: '#96D9D6',
  fighting: '#C22E28',
  poison: '#A33EA1',
  ground: '#E2BF65',
  flying: '#A98FF3',
  psychic: '#F95587',
  bug: '#A6B91A',
  rock: '#B6A136',
  ghost: '#735797',
  dragon: '#6F35FC',
  dark: '#705746',
  steel: '#B7B7CE',
  fairy: '#D685AD',
};

// Function to update --vh
const updateVh = () => {
  document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
};

// Update --vh every 100 milliseconds
setInterval(updateVh, 100);

/* Helper Functions */
const formatName = (name) => {
  return name
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const getContrastColor = (bgColor) => {
  const color = bgColor.charAt(0) === '#' ? bgColor.substring(1, 7) : bgColor;
  const r = parseInt(color.substring(0, 2), 16); // hexToR
  const g = parseInt(color.substring(2, 4), 16); // hexToG
  const b = parseInt(color.substring(4, 6), 16); // hexToB
  const uicolors = [r / 255, g / 255, b / 255];
  const c = uicolors.map((col) => {
    if (col <= 0.03928) {
      return col / 12.92;
    }
    return Math.pow((col + 0.055) / 1.055, 2.4);
  });
  const L = 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  return L > 0.179 ? '#000000' : '#FFFFFF';
};

const debounce = (func, delay) => {
  let debounceTimer;
  return (...args) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => func(...args), delay);
  };
};

/* Fetching and Displaying Pokemon */
const fetchPokemon = async () => {
  const spinner = document.querySelector('#loader');
  spinner.style.display = 'block'; // show spinner
  try {
    const response = await fetch(`${baseUrl}?limit=100000`);
    if (!response.ok) {
      throw new Error(`Error status: ${response.status}`);
    }
    const data = await response.json();
    pokemons = data.results;
    updateDisplayedPokemons();
  } catch (error) {
    console.error(error);
  } finally {
    spinner.style.display = 'none'; // hide spinner
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
    const pokemonElement = createPokemonElement(pokemon);
    container.appendChild(pokemonElement);
  });
};

/* Pokemon Element Creation and Favorite Handling */
const createPokemonElement = (pokemon) => {
  let pokemonId = Number(pokemon.url.split('/')[6]); // extract the id from the url
  const isFavorite = favorites.includes(pokemonId);
  const pokemonElement = document.createElement('div');
  pokemonElement.innerHTML = `
    <div class="card-id">${pokemonId}</div>
    <i class="material-icons favorite-icon">${isFavorite ? 'star' : 'star_border'}</i>
    <img class="pokemon-image" src="${imgUrl}${pokemonId}.png" alt="${pokemon.name}" />
    <h2>${formatName(pokemon.name)}</h2>
    `;

  /* Event listener for Pokemon grid element */
  pokemonElement.addEventListener('click', (e) => {
    if (e.target !== favoriteIcon) {
      displayPokemonDetails(pokemon.url);
    }
  });

  /* Event listener for favorite icon */
  const favoriteIcon = pokemonElement.querySelector('.favorite-icon');
  favoriteIcon.addEventListener('click', (e) => {
    e.stopPropagation(); // prevent triggering the pokemon grid element event listener
    toggleFavorite(pokemonId, favoriteIcon);
  });

  return pokemonElement;
};

const toggleFavorite = (pokemonId, favoriteIcon) => {
  pokemonId = Number(pokemonId);
  if (favorites.includes(pokemonId)) {
    // Remove from favorites
    favorites = favorites.filter((id) => id !== pokemonId);
    favoriteIcon.textContent = 'star_border';
  } else {
    // Add to favorites
    favorites.push(pokemonId);
    favoriteIcon.textContent = 'star';
  }
  localStorage.setItem('favorites', JSON.stringify(favorites));
};

/* Pokemon Details and Modal Handling */
const displayPokemonDetails = async (url) => {
  const spinner = document.querySelector('#loader');
  spinner.style.display = 'block'; // show spinner
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error status: ${response.status}`);
    }
    const data = await response.json();
    displayModal(data);
  } catch (error) {
    console.error(error);
  } finally {
    spinner.style.display = 'none'; // hide spinner
  }
};

const displayModal = (pokemon) => {
  const { id, name, types, species, height, weight, stats } = pokemon;
  const formattedName = formatName(name);
  const typesList = types
    .map((type) => {
      const bgColor = typeColors[type.type.name];
      const textColor = getContrastColor(bgColor);
      return `<span class="type-label" style="background-color: ${bgColor}; color: ${textColor};">${type.type.name}</span>`;
    })
    .join(' ');
  const statsList = stats.map((stat) => `<li>${stat.stat.name}: ${stat.base_stat}</li>`).join('');

  const modal = document.querySelector('#pokemon-modal');
  modal.innerHTML = `
  <div class="modal-content">
    <button class="close-button">&times;</button>
    <div class="pokemon-details">
      <img src="${imgUrl}${id}.png" alt="${name}" />
      <table>
        <thead>
          <tr><th colspan="2">${formattedName}</th></tr>
        </thead>
        <tbody>
          <tr><th>ID</th><td>${id}</td></tr>
          <tr><th>Types</th><td>${typesList}</td></tr>
          <tr><th>Species</th><td>${species.name}</td></tr>
          <tr><th>Height</th><td>${height / 10.0} m</td></tr>
          <tr><th>Weight</th><td>${weight / 10.0} kg</td></tr>
          <tr><th>Stats</th><td><ul>${statsList}</ul></td></tr>
        </tbody>
      </table>
    </div>
  </div>
  `;
  modal.style.display = 'block';
  modal.style.opacity = '0';
  setTimeout(() => {
    modal.style.opacity = '1';
  }, 300); // delay to trigger the transition

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
  }, 300);
};

/* Pagination */
const displayPagination = () => {
  const pagination = document.querySelector('#pagination');
  pagination.innerHTML = ''; // clear the pagination

  if (currentPage > 1) {
    const prevButton = document.createElement('button');
    prevButton.innerHTML = `<i class="material-icons">arrow_back_ios</i>`;
    prevButton.addEventListener('click', () => {
      currentPage--;
      updateDisplayedPokemons();
    });
    pagination.appendChild(prevButton);
  }

  const currentPageInput = document.createElement('input');
  currentPageInput.type = 'number';
  currentPageInput.min = 1;
  currentPageInput.max = Math.ceil(pokemons.length / 20);
  currentPageInput.value = currentPage;
  currentPageInput.className = 'page-input';
  pagination.appendChild(currentPageInput);

  const totalPagesSpan = document.createElement('span');
  totalPagesSpan.textContent = `/${Math.ceil(pokemons.length / 20)}`;
  pagination.appendChild(totalPagesSpan);

  currentPageInput.addEventListener(
    'input',
    debounce(() => {
      const enteredPage = Number(currentPageInput.value);
      if (enteredPage >= 1 && enteredPage <= Math.ceil(pokemons.length / 20)) {
        currentPage = enteredPage;
        updateDisplayedPokemons();
      }
    }, 1000)
  );

  if (currentPage < Math.ceil(pokemons.length / 20)) {
    const nextButton = document.createElement('button');
    nextButton.innerHTML = `<i class="material-icons">arrow_forward_ios</i>`;
    nextButton.addEventListener('click', () => {
      currentPage++;
      updateDisplayedPokemons();
    });
    pagination.appendChild(nextButton);
  }
};

/* Search Functionality */
const searchHandler = (e) => {
  const searchTerm = e.target.value.toLowerCase();
  if (searchTerm) {
    const filteredPokemons = pokemons.filter((pokemon) => pokemon.name.includes(searchTerm));
    displaySearchResults(filteredPokemons);
  } else {
    updateDisplayedPokemons();
  }
};

document.querySelector('#search-bar').addEventListener('input', debounce(searchHandler, 500));

const displaySearchResults = (pokemons) => {
  const container = document.querySelector('#pokemon-container');
  container.innerHTML = ''; // clear the container

  if (pokemons.length === 0) {
    container.innerHTML = '<div class="no-results">No pokemon found</div>'; // add a no results message
    return;
  }

  pokemons.forEach((pokemon) => {
    const pokemonElement = createPokemonElement(pokemon);
    container.appendChild(pokemonElement);
  });
};

// Fetch all the Pokemon data
fetchPokemon();

/* Modal and filter */
function createModal(callback) {
  const modal = document.createElement('div');
  modal.className = 'sortModal';
  modal.style.display = 'none'; // Hide by default

  const modalContent = document.createElement('div');
  modalContent.className = 'sortModalContent';

  const grid = document.createElement('div');
  grid.style.display = 'grid';
  grid.style.gridTemplateColumns = 'auto auto'; // Two columns

  const label1 = document.createElement('label');
  label1.textContent = 'Type:';
  grid.appendChild(label1);
  const select1 = document.createElement('select');
  ['ID', 'Name'].forEach((option) => select1.add(new Option(option)));
  grid.appendChild(select1);

  const label2 = document.createElement('label');
  label2.textContent = 'Sort:';
  grid.appendChild(label2);
  const select2 = document.createElement('select');
  ['Ascending', 'Descending'].forEach((option) => select2.add(new Option(option)));
  grid.appendChild(select2);

  modalContent.appendChild(grid);

  const applyButton = document.createElement('button');
  applyButton.textContent = 'Apply';
  applyButton.addEventListener('click', () => {
    modal.style.display = 'none'; // Hide modal
    callback(select1.value, select2.value); // Call the callback with the selected options
  });
  modalContent.appendChild(applyButton);

  modal.appendChild(modalContent);

  // Close the modal if clicked outside
  modal.addEventListener('click', (event) => {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  });

  return modal;
}

// Function to add a modal to an icon
function addModalToIcon(icon, callback) {
  const modal = createModal(callback);
  document.body.appendChild(modal);

  icon.addEventListener('click', () => {
    modal.style.display = 'block'; // Show modal
  });
}

// Add modal to the sort icon
addModalToIcon(document.querySelector('#sort-icon'), (filter, sort) => {
  // Sort pokemons by the selected filter in ascending order
  pokemons.sort((a, b) => {
    if (filter === 'ID') {
      return parseInt(a.id) - parseInt(b.id); // Convert ids to numbers before comparing
    } else {
      return a.name.localeCompare(b.name);
    }
  });

  displayedPokemons = [...pokemons];

  if (sort === 'Descending') {
    displayedPokemons.reverse();
  }

  displayPokemons(displayedPokemons);
});
