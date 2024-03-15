import { fetchPokemon, fetchPokemonDetails } from "./api.js";
import { formatName, getContrastColor, debounce } from "./utils.js";
import { addModalToIcon } from "./modal.js";

const imgUrl = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/";
let currentPage = 1;
let pokemons = [];
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
const typeColors = {
  normal: "#A8A77A",
  fire: "#EE8130",
  water: "#6390F0",
  electric: "#F7D02C",
  grass: "#7AC74C",
  ice: "#96D9D6",
  fighting: "#C22E28",
  poison: "#A33EA1",
  ground: "#E2BF65",
  flying: "#A98FF3",
  psychic: "#F95587",
  bug: "#A6B91A",
  rock: "#B6A136",
  ghost: "#735797",
  dragon: "#6F35FC",
  dark: "#705746",
  steel: "#B7B7CE",
  fairy: "#D685AD",
};

// Update Displayed Pokemons
const updateDisplayedPokemons = () => {
  const displayedPokemons = pokemons.slice((currentPage - 1) * 20, currentPage * 20);
  displayPokemons(displayedPokemons);
  displayPagination();
};

// Display Pokemons
const displayPokemons = (pokemons) => {
  const container = document.querySelector("#pokemon-container");
  container.innerHTML = "";
  pokemons.forEach((pokemon) => container.appendChild(createPokemonElement(pokemon)));
};

// Create Pokemon Element
const createPokemonElement = (pokemon) => {
  let pokemonId = Number(pokemon.url.split("/")[6]);
  const isFavorite = favorites.includes(pokemonId);
  const pokemonElement = document.createElement("div");
  pokemonElement.innerHTML = `
    <div class="card-id">${pokemonId}</div>
    <i class="material-icons favorite-icon">${isFavorite ? "star" : "star_border"}</i>
    <img class="pokemon-image" src="${imgUrl}${pokemonId}.png" onerror="this.onerror=null;this.src='assets/pokemon_placeholder-image.png';" alt="${
    pokemon.name
  }" />
    <h2>${formatName(pokemon.name)}</h2>
    `;
  pokemonElement.addEventListener("click", (e) => {
    if (e.target !== favoriteIcon) {
      displayPokemonDetails(pokemon.url);
    }
  });
  const favoriteIcon = pokemonElement.querySelector(".favorite-icon");
  favoriteIcon.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleFavorite(pokemonId, favoriteIcon);
  });
  return pokemonElement;
};

// Toggle Favorite
const toggleFavorite = (pokemonId, favoriteIcon) => {
  pokemonId = Number(pokemonId);
  if (favorites.includes(pokemonId)) {
    favorites = favorites.filter((id) => id !== pokemonId);
    favoriteIcon.textContent = "star_border";
  } else {
    favorites.push(pokemonId);
    favoriteIcon.textContent = "star";
  }
  localStorage.setItem("favorites", JSON.stringify(favorites));
};

// Display Pokemon Details
const displayPokemonDetails = async (url) => {
  const spinner = document.querySelector("#loader");
  spinner.style.display = "block"; // Show spinner

  const data = await fetchPokemonDetails(url);
  if (data) {
    displayModal(data);
  }

  spinner.style.display = "none"; // Hide spinner
};

const displayModal = (pokemon) => {
  const spinner = document.querySelector("#loader");
  spinner.style.display = "block"; // Show loader
  const { id, name, types, species, height, weight, stats } = pokemon;
  const formattedName = formatName(name);
  const typesList = types
    .map((type) => {
      const bgColor = typeColors[type.type.name];
      const textColor = getContrastColor(bgColor);
      return `<span class="type-label" style="background-color: ${bgColor}; color: ${textColor};">${type.type.name}</span>`;
    })
    .join(" ");
  const statsList = stats.map((stat) => `<li>${stat.stat.name}: ${stat.base_stat}</li>`).join("");

  const modal = document.querySelector("#pokemon-modal");
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

  setTimeout(() => {
    modal.style.display = "block";
    modal.classList.add("show");
  }, 1000);

  // Disable scrolling
  document.body.style.overflow = "hidden";

  // Close the modal when clicking outside of it
  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal(modal);
    }
  });

  // Close the modal when clicking the close button
  document.querySelector(".close-button").addEventListener("click", () => {
    closeModal(modal);
  });

  spinner.style.display = "none"; // Hide loader after modal is displaye
};

const closeModal = (modal) => {
  modal.classList.remove("show"); //  to hide modal with animation
  setTimeout(() => {
    modal.style.display = "none";
    document.body.style.overflow = "auto"; // re-enable scrolling
  }, 300);
};

/* Pagination */
const displayPagination = () => {
  const pagination = document.querySelector("#pagination");
  pagination.innerHTML = ""; // clear the pagination

  if (currentPage > 1) {
    const prevButton = document.createElement("button");
    prevButton.innerHTML = `<i class="material-icons">arrow_back_ios</i>`;
    prevButton.addEventListener("click", () => {
      currentPage--;
      updateDisplayedPokemons();
    });
    pagination.appendChild(prevButton);
  }

  const currentPageInput = document.createElement("input");
  currentPageInput.type = "number";
  currentPageInput.min = 1;
  currentPageInput.max = Math.ceil(pokemons.length / 20);
  currentPageInput.value = currentPage;
  currentPageInput.className = "page-input";
  pagination.appendChild(currentPageInput);

  const totalPagesSpan = document.createElement("span");
  totalPagesSpan.textContent = `/${Math.ceil(pokemons.length / 20)}`;
  pagination.appendChild(totalPagesSpan);

  currentPageInput.addEventListener("input", () => {
    const spinner = document.querySelector("#loader");
    spinner.style.display = "block"; // Show loader

    debounce(() => {
      const enteredPage = +currentPageInput.value;
      if (enteredPage >= 1 && enteredPage <= Math.ceil(pokemons.length / 20)) {
        currentPage = enteredPage;
        setTimeout(() => {
          updateDisplayedPokemons();
          spinner.style.display = "none"; // Hide loader after 1s
        }, 500);
      } else {
        spinner.style.display = "none"; // Hide loader if input is invalid
      }
    }, 500)();
  });

  if (currentPage < Math.ceil(pokemons.length / 20)) {
    const nextButton = document.createElement("button");
    nextButton.innerHTML = `<i class="material-icons">arrow_forward_ios</i>`;
    nextButton.addEventListener("click", () => {
      currentPage++;
      updateDisplayedPokemons();
    });
    pagination.appendChild(nextButton);
  }
};

/* Search Functionality */
const searchHandler = debounce((e) => {
  const searchTerm = e.target.value.toLowerCase();
  if (searchTerm) {
    const filteredPokemons = pokemons.filter((pokemon) => pokemon.name.includes(searchTerm));
    displaySearchResults(filteredPokemons);
  } else {
    updateDisplayedPokemons();
  }
  const spinner = document.querySelector("#loader");
  spinner.style.display = "none"; // Hide spinner after search results are displayed
}, 500);

document.querySelector("#search-bar").addEventListener("input", (e) => {
  const spinner = document.querySelector("#loader");
  spinner.style.display = "block"; // Show spinner when user starts typing
  searchHandler(e);
});

const displaySearchResults = (pokemons) => {
  const container = document.querySelector("#pokemon-container");
  container.innerHTML = ""; // clear the container

  if (pokemons.length === 0) {
    container.innerHTML = '<div class="no-results">No pokemon found</div>'; // add a no results message
    return;
  }

  pokemons.forEach((pokemon) => {
    const pokemonElement = createPokemonElement(pokemon);
    container.appendChild(pokemonElement);
  });
};

// Initial Fetch Call
const init = async () => {
  const spinner = document.querySelector("#loader");
  spinner.style.display = "block"; // Show spinner

  const data = await fetchPokemon();

  if (data) {
    pokemons = data.results;
    updateDisplayedPokemons();
  } else {
    console.error("Failed to fetch Pokémon list.");
  }

  spinner.style.display = "none"; // Hide spinner
};

init();

// Add modal to the sort icon
addModalToIcon(document.querySelector("#sort-icon"), (filter, sort) => {
  // Sort pokemons by the selected filter in ascending order
  pokemons.sort((a, b) => {
    if (filter === "ID") {
      return a.url.split("/")[6] - b.url.split("/")[6]; // Correctly sorting by ID
    } else {
      return a.name.localeCompare(b.name); // Sorting by name
    }
  });

  if (sort === "Descending") {
    pokemons.reverse();
  }

  // Update displayed Pokémons based on the current page
  updateDisplayedPokemons();
});
