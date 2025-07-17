const apiUrl = "https://www.themealdb.com/api/json/v1/1/search.php?s=";

const searchBtn = document.getElementById("search-btn")
const searchInput = document.getElementById("search-input")

const recipesContainer = document.getElementById("recipes-container")
const favoritesContainer = document.getElementById("favorites-container")

let favorites = JSON.parse(localStorage.getItem("favoriteRecipes")) || [];
console.log(favorites);


searchBtn.addEventListener("click", () => {
    const dish = searchInput.value.trim();
    if (dish) {
        fetchRecipes(dish);
    }
    else {
        alert("Plz write your dish name")
    }
});

searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        searchBtn.click()
    }
})

function fetchRecipes(dish) {
    fetch(`${apiUrl}${dish}`)
        .then((response) => {

            return response.json()
        })

        .then((data) => {


            if (data.meals) {
                displayRecipes(data.meals);
            } else {
                recipesContainer.innerHTML = `<p>No recipes found.</p>`;
            }
        })
        .catch((err) => {
            recipesContainer.innerHTML = `<p> Error fetching recipes. </p>`;
            console.error(err);
        });

}



function isFavorite(id) {
    return favorites.some(fav => fav.id === id);
}



function displayRecipes(recipes) {
    recipesContainer.innerHTML = "";
    recipes.forEach((meal) => {
        const card = document.createElement("div");
        card.classList.add("recipe-card");

        card.innerHTML = `
           <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
           <div class="recipe-info">
              <h3>${meal.strMeal}<h3>
              <p><strong>Category:</strong> ${meal.strCategory}</p>
              <p><strong>Instructions:</strong> ${meal.strInstructions.substring(0, 100)}...</p>
              </div>`

        const favoriteBtn = document.createElement('button')
        favoriteBtn.classList.add('favorite-btn')
        favoriteBtn.innerHTML = `<img src="${isFavorite(meal.idMeal) ? 'assets/heart-fill.png' : 'assets/heart-outline.png'}" alt = "favorite">`;

        favoriteBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            toggleFavorite(meal.idMeal, meal.strMeal, meal.strMealThumb)
            displayRecipes(recipes)

        })


        recipesContainer.appendChild(card);

        card.appendChild(favoriteBtn);
        card.addEventListener("click", () => openRecipeDetails(meal))

    })
}



function toggleFavorite(id, name, img) {
    const index = favorites.findIndex(fav => fav.id === id);
    if (index !== -1) {
        favorites.splice(index, 1);
    }
    else {
        favorites.push({ id, name, img });
    }
    localStorage.setItem("favoriteRecipes", JSON.stringify(favorites));
    displayFavorites();
}

function displayFavorites() {
    favoritesContainer.innerHTML = "";
    if (favorites.length === 0) {
        favoritesContainer.innerHTML = "<p style=\"font-family: cursive;font-size: x-large;color: white;\">No favorites yet.</p>";
        return;

    }

    favorites.forEach((fav) => {
        const card = document.createElement("div");
        card.classList.add("recipe-card");
        card.innerHTML = `
          <img src=" ${fav.img}" alt="${fav.name}">
          <div class = "recipe-info">
              <h3>${fav.name}</h3>
          </div>`;


        const favBtn = document.createElement("button");
        favBtn.classList.add("favorite-btn");
        favBtn.innerHTML = `<img src ="assets/heart-fill.png" alt ="unfavorite">`;
        favBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            toggleFavorite(fav.id, fav.name, fav.img);
        });



        favoritesContainer.appendChild(card);

        card.appendChild(favBtn);
        card.addEventListener("click", () => {
            fetch(`${apiUrl}${fav.name}`)
                .then((res) => res.json())
                .then((data) => {
                    if (data.meals) {
                        openRecipeDetails(data.meals[0])
                    }
                })
        })

    })
}



function openRecipeDetails(meal) {
    const popUp = document.createElement("div");
    popUp.classList.add("popUp");

    let ingredientsHTML = ""
    for (let i = 1; i <= 20; i++) {
        const ing = meal[`strIngredient${i}`];
        const meas = meal[`strMeasure${i}`]
        if (ing) {
            ingredientsHTML += `<li>${ing} - ${meas}</li>`
        }

    }

    popUp.innerHTML = `
      <div class = "popUp-content">
         <span class ="close-btn"> &times;</span>
         <h2>${meal.strMeal}</h2>
         <img src="${meal.strMealThumb}" alt=${meal.strMeal}">
         <h3>Ingredients</h3>
         <ul>${ingredientsHTML}</ul>
         <h3>Instructions</h3>
         <ul>${meal.strInstructions}</ul>
       </div>
         `;


    document.body.appendChild(popUp);

    popUp.querySelector(".close-btn").addEventListener("click", () => {
        popUp.remove();
    });






}


displayFavorites();




