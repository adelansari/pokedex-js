const baseUrl = "https://pokeapi.co/api/v2/pokemon";

// Function to fetch all Pokémon data
const fetchPokemon = async () => {
  try {
    const response = await fetch(`${baseUrl}?limit=100000`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Fetch error:", error);
    return null;
  }
};

// Function to fetch details for a specific Pokémon
const fetchPokemonDetails = async (url) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Fetch error:", error);
  }
};

export { fetchPokemon, fetchPokemonDetails };
