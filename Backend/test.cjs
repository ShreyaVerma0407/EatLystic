const axios = require('axios');
const readline = require('readline');

// Create readline interface to take user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to fetch calories from Edamam API
const getEdamamData = async (ingredient) => {
  const appId = '819b7605';   // Edamam App ID
  const appKey = '05cb952bde7958c83909e30673c65a31'; // Edamam API Key

  try {
    const response = await axios.get('https://api.edamam.com/api/food-database/v2/parser', {
      params: {
        app_id: appId,
        app_key: appKey,
        ingr: ingredient
      }
    });

    if (response.data.hints && response.data.hints.length > 0) {
      const foodItem = response.data.hints[0].food; // Get the first food hint
      const calories = foodItem.nutrients.ENERC_KCAL; // Extract calories
      console.log(`${ingredient} has ${calories} kcal per serving.`);
      return calories;
    } else {
      throw new Error('No data found for ingredient in Edamam API');
    }
  } catch (error) {
    console.error(`Error fetching data from Edamam API: ${error.message}`);
    return null;
  }
};

// Function to fetch calories from USDA API
const getUsdaData = async (ingredient) => {
  const usdaApiKey = 'CX0hGlYtG7cX9dyhSAsZnoLgJtTly9aa02hIqwpQ'; // USDA API Key
  
  try {
    const response = await axios.get(`https://api.nal.usda.gov/fdc/v1/foods/search`, {
      params: {
        query: ingredient,
        apiKey: usdaApiKey
      }
    });

    if (response.data.foods && response.data.foods.length > 0) {
      const calories = response.data.foods[0].foodNutrients.find(nutrient => nutrient.nutrientName === 'Energy').value; // Extract calories
      console.log(`${ingredient} has ${calories} kcal per serving.`);
      return calories;
    } else {
      throw new Error('No data found for ingredient in USDA API');
    }
  } catch (error) {
    console.error(`Error fetching data from USDA API: ${error.message}`);
    return null;
  }
};

// Main function to get calories from both APIs
const getCalories = async (ingredient) => {
  let calories = await getEdamamData(ingredient);
  if (!calories) {
    calories = await getUsdaData(ingredient);
  }
  if (!calories) {
    console.log('No calories data found for the ingredient');
  }
};

// Prompt the user for input
rl.question('Please enter the food ingredient (or type "exit" to quit): ', (ingredient) => {
  if (ingredient.toLowerCase() === 'exit') {
    rl.close();
  } else {
    console.log(`Searching for calories of: ${ingredient}`);
    getCalories(ingredient).finally(() => rl.close());
  }
});
