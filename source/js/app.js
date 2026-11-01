let currentUser = null;
let recipes = [];
let selectedIngredients = [];

function LoginPage() {
    document.getElementById('app').innerHTML = `
    <h1>Вход</h1>
    <form class="form">
        <div class="form-group">
            <label>Email</label>
            <input type="email" id="loginEmail" placeholder="user@mail.ru">
            <div class="error-text" id="loginEmailError"></div>
        </div>
        <div class="form-group">
            <label>Пароль</label>
            <input type="password" id="loginPassword">
            <div class="error-text" id="loginPasswordError"></div>
        </div>
        <button type="button" onclick="Login()">Войти</button>
    </form>
    <p class="help">Нет аккаунта? <a href="#" onclick="RegisterPage()">Регистрация</a></p>
    `;
}

LoginPage();

function Login() {
    let isValid = true;

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    document.getElementById('loginEmailError').textContent = '';
    document.getElementById('loginPasswordError').textContent = '';
    document.getElementById('loginEmail').classList.remove('error');
    document.getElementById('loginPassword').classList.remove('error');

    if (!email || !email.includes('@')) {
        document.getElementById('loginEmailError').textContent = 'Некорректный email';
        document.getElementById('loginEmail').classList.add('error');
        isValid = false;
    }

    if (!password || password.length < 6) {
        document.getElementById('loginPasswordError').textContent = 'Пароль должен содержать не менее 6 символов';
        document.getElementById('loginPassword').classList.add('error');
        isValid = false;
    }

    if (isValid) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.email === email && u.password === password);

        if(!user) {
            document.getElementById('loginEmailError').textContent = 'Неверный email или пароль';
            document.getElementById('loginEmail').classList.add('error');
            return;
        }

        currentUser = user;
        LoadRecipes();
        MainPage();
    }
}

function RegisterPage() {
    document.getElementById('app').innerHTML = `
    <h1>Регистрация</h1>
    <form class="form">
        <div class="form-group">
            <label>Email</label>
            <input type="email" id="regEmail" placeholder="user@mail.ru">
            <div class="error-text" id="regEmailError"></div>
        </div>
        <div class="form-group">
            <label>Имя</label>
            <input type="text" id="regName" placeholder="Иван">
            <div class="error-text" id="regNameError"></div>
        </div>
        <div class="form-group">
            <label>Пароль</label>
            <input type="password" id="regPassword">
            <div class="error-text" id="regPasswordError"></div>
        </div>
        <button type="button" onclick="Register()">Зарегистрироваться</button>
    </form>
    <p class="help">Есть аккаунт? <a href="#" onclick="LoginPage()">Войти</a></p>
    `;
}

function Register() {
    const email = document.getElementById('regEmail').value;
    const name = document.getElementById('regName').value;
    const password = document.getElementById('regPassword').value;

    document.getElementById('regEmailError').textContent = '';
    document.getElementById('regNameError').textContent = '';
    document.getElementById('regPasswordError').textContent = '';
    document.getElementById('regEmail').classList.remove('error');
    document.getElementById('regName').classList.remove('error');
    document.getElementById('regPassword').classList.remove('error');

    let isValid = true;

    if (!email || !email.includes('@')) {
        document.getElementById('regEmailError').textContent = 'Некорректный email';
        document.getElementById('regEmail').classList.add('error');
        isValid = false;
    }

    if (!name || name.length < 2) {
        document.getElementById('regNameError').textContent = 'Имя не может быть короче 2 символов';
        document.getElementById('regName').classList.add('error');
        isValid = false;
    }

    if (!password || password.length < 6) {
        document.getElementById('regPasswordError').textContent = 'Пароль должен содержать не менее 6 символов';
        document.getElementById('regPassword').classList.add('error');
        isValid = false;
    }

    if (isValid) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');

        if (users.some(u => u.email === email)) {
            document.getElementById('regEmailError').textContent = 'Email уже используется';
            document.getElementById('regEmail').classList.add('error');
            return;
        }

        users.push({ id: Date.now(), email, name, password });
        localStorage.setItem('users', JSON.stringify(users));

        alert('Регистрация успешна!');
        LoginPage();
    } 
}

function Logout() {
    currentUser = null;
    LoginPage();
}

function MainPage() {
    document.getElementById('app').innerHTML = `
    <div class="container-page">
        <h1>Рецепты</h1>

        <div class="nav-buttons">
            <button type="button" onClick="MainPage()">Все рецепты</button>
            <button type="button" onClick="MyRecipesPage()">Мои рецепты</button>
            <button type="button" onclick="RecipeFormPage()">Создать рецепт</button>
            <button type="button" onclick="ConstructorPage()">Конструктор рецептов</button>
            <button type="button" onclick="Logout()">Выйти</button>
        </div>


        <div class="sort">
            <label>Сортировка:</label>
            <select id="sortSelect" onchange="SortRecipes()">
                <option value="date_desc" selected>Сначала новые</option>
                <option value="date_asc">Сначала старые</option>
                <option value="time_asc">Сначала быстрые</option>
                <option value="time_desc">Сначала долгие</option>
                <option value="calories_asc">Сначала низкокалорийные</option>
                <option value="calories_desc">Сначала высококалорийные</option>
            </select>
        </div>


        <div id="recipesList"></div>
    </div>
    `;

    SortRecipes();
}

function RenderRecipes() {
    const container = document.getElementById('recipesList');

    if (recipes.length === 0) {
        container.innerHTML = '<p>Пока нет рецептов. Создайте первый!</p>';
        return;
    }

    const visibleRecipes = recipes.filter(r => r.isPublic);

    container.innerHTML = visibleRecipes.map(r => `
        <div class="recipe-card">
            <h3>${r.title}</h3>
            ${r.image ? `<img src="${r.image}" alt="${r.title}">` : '<img src="/source/images/picture.png" alt="${r.title}">'}

            <div class="card-info">
                <p><strong>Описание:</strong> ${r.description}</p>
                <p><strong>Калорийность:</strong> ${r.calories} ккал</p>
                <p><strong>Время:</strong> ${r.cookingTime} мин.</p>
                <p><strong>Автор:</strong> ${r.author || 'неизвестен'}</p>
            </div>

            <button type="button" onclick="ViewRecipe(${r.id})">Подробнее</button>
        </div>
    `).join('');
}

function SortRecipes() {
    const sort = document.getElementById('sortSelect').value;

    if (sort === 'date_desc') recipes.sort((a, b) => b.id - a.id);
    if (sort === 'date_asc') recipes.sort((a, b) => a.id - b.id);
    if (sort === 'time_asc') recipes.sort((a, b) => a.cookingTime - b.cookingTime);
    if (sort === 'time_desc') recipes.sort((a, b) => b.cookingTime - a.cookingTime);
    if (sort === 'calories_asc') recipes.sort((a, b) => a.calories - b.calories);
    if (sort === 'calories_desc') recipes.sort((a, b) => b.calories - a.calories);

    RenderRecipes();
}

function LoadRecipes() {
    recipes = JSON.parse(localStorage.getItem('recipes') || '[]');
}


let editingRecipeId = null;

function RecipeFormPage(id = null) {
    editingRecipeId = id;
    const recipe = id ? recipes.find(r => r.id === id) : null;

    // Если редактируем, но рецепт не найден или чужой — выходим
    if (id && (!recipe || recipe.author !== currentUser.name)) {
        alert('Рецепт не найден или вы не можете его редактировать');
        MainPage();
        return;
    }

    document.getElementById('app').innerHTML = `
        <h1>${id ? 'Редактирование рецепта' : 'Создание рецепта'}</h1>
        <form id="recipeForm" class="form">
            <div class="form-group">
                <label>Название*</label>
                <input type="text" id="recipeTitle" value="${recipe ? recipe.title : ''}">
                <div class="error-text" id="recipeTitleError"></div>
            </div>
            
            <div class="form-group">
                <label>Описание*</label>
                <textarea id="recipeDescription" rows="4">${recipe ? recipe.description : ''}</textarea>
                <div class="error-text" id="recipeDescriptionError"></div>
            </div>
            
            <div class="form-group">
                <label>Калорийность (ккал)*</label>
                <input type="number" id="recipeCalories" value="${recipe ? recipe.calories : ''}">
                <div class="error-text" id="recipeCaloriesError"></div>
            </div>
            
            <div class="form-group">
                <label>Время приготовления (мин)*</label>
                <input type="number" id="recipeTime" value="${recipe ? recipe.cookingTime : ''}">
                <div class="error-text" id="recipeTimeError"></div>
            </div>
            
            <div class="form-group">
                <label>Ссылка на изображение</label>
                <input type="text" id="recipeImage" value="${recipe ? recipe.image : ''}">
            </div>
            
            <div class="form-group">
                <label>Ингредиенты (через запятую)*</label>
                <input type="text" id="recipeIngredients" value="${recipe && recipe.ingredients ? recipe.ingredients.join(', ') : ''}">
                <div class="error-text" id="recipeIngredientsError"></div>
            </div>
            
            <div class="form-group">
                <label style="display: flex; gap: 10px; align-items: center;">
                    <input type="checkbox" id="recipeIsPublic" ${recipe && recipe.isPublic ? 'checked' : ''}>
                    Опубликовать рецепт
                </label>
            </div>
            
            <div class="form-btns">
                <button type="button" onclick="SaveRecipe()">${id ? 'Сохранить' : 'Создать'}</button>
                <button type="button" onclick="MainPage()">Отмена</button>
            </div>
        </form>
    `;
}

function SaveRecipe() {
    const title = document.getElementById('recipeTitle').value.trim();
    const description = document.getElementById('recipeDescription').value.trim();
    const calories = document.getElementById('recipeCalories').value;
    const cookingTime = document.getElementById('recipeTime').value;
    const image = document.getElementById('recipeImage').value.trim();
    const ingredientsInput = document.getElementById('recipeIngredients').value.trim();
    const isPublic = document.getElementById('recipeIsPublic').checked;

    ['recipeTitleError', 'recipeDescriptionError', 'recipeCaloriesError', 'recipeTimeError', 'recipeIngredientsError'].forEach(id => { document.getElementById(id).textContent = ''; });
    ['recipeTitle', 'recipeDescription', 'recipeCalories', 'recipeTime', 'recipeIngredients'].forEach(id => { document.getElementById(id).classList.remove('error'); });

    let isValid = true;

    if (!title) {
        document.getElementById('recipeTitleError').textContent = 'Введите название';
        document.getElementById('recipeTitle').classList.add('error');
        isValid = false;
    }

    if (!description) {
        document.getElementById('recipeDescriptionError').textContent = 'Введите описание';
        document.getElementById('recipeDescription').classList.add('error');
        isValid = false;
    }

    if (!calories || Number(calories) <= 0) {
        document.getElementById('recipeCaloriesError').textContent = 'Калорийность должна быть больше 0';
        document.getElementById('recipeCalories').classList.add('error');
        isValid = false;
    }

    if (!cookingTime || Number(cookingTime) <= 0) {
        document.getElementById('recipeTimeError').textContent = 'Время должно быть больше 0';
        document.getElementById('recipeTime').classList.add('error');
        isValid = false;
    }

    const ingredients = ingredientsInput ? ingredientsInput.split(',').map(i => i.trim()).filter(i => i) : [];

    if (ingredients.length === 0) {
        document.getElementById('recipeIngredientsError').textContent = 'Добавьте хотя бы один ингредиент';
        document.getElementById('recipeIngredients').classList.add('error');
        isValid = false;
    }

    if (!isValid) return;

    if (editingRecipeId) {
        const recipe = recipes.find(r => r.id === editingRecipeId);
        recipe.title = title;
        recipe.description = description;
        recipe.calories = Number(calories);
        recipe.cookingTime = Number(cookingTime);
        recipe.image = image;
        recipe.ingredients = ingredients;
        recipe.isPublic = isPublic;
    } else {
        const newRecipe = {
            id: Date.now(),
            title,
            description,
            calories: Number(calories),
            cookingTime: Number(cookingTime),
            image,
            ingredients,
            isPublic,
            author: currentUser.name,
        };
        recipes.push(newRecipe);
    }

    localStorage.setItem('recipes', JSON.stringify(recipes));
    alert(editingRecipeId ? 'Рецепт обновлён' : 'Рецепт создан');
    editingRecipeId = null;
    MainPage();
}


function MyRecipesPage() {
    const myRecipes = recipes.filter(r => r.author === currentUser.name);

    document.getElementById('app').innerHTML = `
    <div class="container-page">
        <h1>Мои рецепты</h1>

        <div class="nav-buttons my-recipes">
            <button type="button" onclick="MainPage()">На главную</button>
            <button type="button" onclick="RecipeFormPage()">Создать рецепт</button>
        </div>

        <div class="recipesList">
            ${myRecipes.length === 0 ? '<p>У вас пока нет рецептов</p>' : myRecipes.map(r => `
                <div class="recipe-card">
                    <h3>${r.title}</h3>
                    ${r.image ? `<img src="${r.image}" alt="${r.title}">` : '<img src="/source/images/picture.png" alt="${r.title}">'}
                    
                    <div class="card-info">
                        <p><strong>Описание:</strong> ${r.description}</p>
                        <p><strong>Калорийность:</strong> ${r.calories} ккал</p>
                        <p><strong>Время:</strong> ${r.cookingTime} мин.</p>
                    </div>

                    <div class="card-btns">
                        <button type="button" onclick="ViewRecipe(${r.id})">Подробнее</button>
                        ${r.author === currentUser.name ? `
                            <button type="button" onclick="RecipeFormPage(${r.id})">Редактировать</button>
                            <button type="button" onclick="DeleteRecipe(${r.id})">Удалить</button>
                        ` : ''}
                    </div>
                </div>    
            `).join('')}
        </div>
    </div>
    `;
}

function DeleteRecipe(id) {
    const recipe = recipes.find(r => r.id === id);
    if (!recipe) return;

    if (recipe.author !== currentUser.name) {
        alert('Вы можете удалить только свои рецепты');
        return;
    }

    if(!confirm('Вы точно хотите удалить рецепт?')) return;

    recipes = recipes.filter(r => r.id !== id);
    localStorage.setItem('recipes', JSON.stringify(recipes));

    alert('Рецепт удалён');
    MyRecipesPage();
}

function ViewRecipe(id) {
    const recipe = recipes.find(r => r.id === id);
    if (!recipe) return;

    document.getElementById('app').innerHTML = `
    <div class="container-page view">
        <h1>${recipe.title}</h1>
        <button type="button" onclick="MainPage()">На главную</button>
        
        <div class="recipe-card">
            ${recipe.image ? `<img src="${recipe.image}" alt="${recipe.title}">` : '<img src="/source/images/picture.png" alt="${recipe.title}">'}

            <div class="inner-container">
                <div class="card-info">
                    <p><strong>Описание:</strong> ${recipe.description}</p>
                    <p><strong>Калорийность:</strong> ${recipe.calories} ккал</p>
                    <p><strong>Время приготовления:</strong> ${recipe.cookingTime} мин.</p>
                    <p><strong>Автор:</strong> ${recipe.author}</p>
                </div>

                <div class="card-ingredients">
                    <h2>Ингредиенты</h2>
                    <ul>
                        ${recipe.ingredients && recipe.ingredients.length > 0 
                            ? recipe.ingredients.map(i => `<li>${i}</li>`).join('') 
                            : '<li>Ингредиенты не указаны</li>'}
                    </ul>
                </div>
            </div>
        </div>
    </div>
    `;
}

// ФУНКЦИЯ НАЧАЛА ПЕРЕТАСКИВАНИЯ ЭЛЕМЕНТА
function DragStart(event) {
    event.dataTransfer.setData('text/plain', event.target.textContent.trim()) // храним данные о переносимом элементе
}


// ФУНКЦИЯ ВЕДЕНИЯ ЭЛЕМЕНТА НАД ЗОНОЙ ЕГО СБРОСА
function DragOver(event) {
    event.preventDefault(); // сброс стандартного поведения браузера, которое блокирует перетаскивание элементов
}

// ФУНКЦИЯ СБРОСА ЭЛЕМЕНТА
function Drop(event) {
    event.preventDefault();
    const ingredient = event.dataTransfer.getData('text/plain');

    if (!selectedIngredients.includes(ingredient)) {
        selectedIngredients.push(ingredient);
        RenderSelectedIngredients();
        SearchByIngredients(); 
    }
}


// ОТРИСОВКА ДОБАВЛЕННЫХ ЭЛЕМЕНТОВ В ЗОНЕ СБРОСА
function RenderSelectedIngredients() {
    const dropZone = document.getElementById('dropZone');

    if (selectedIngredients.length === 0) {
        dropZone.innerHTML = '<p>Перетащите нужные ингредиенты сюда<p>';
        return;
    }

    dropZone.innerHTML = selectedIngredients.map(i => `<span>${i}</span>`).join('');
}

function ConstructorPage() {
    const allIngredients = ['Свёкла', 'Морковь', 'Картофель', 'Лук', 'Чеснок', 'Капуста', 'Мясо'];
    selectedIngredients = [];
    document.getElementById('app').innerHTML = `
    <div class="container-page">
        <h1>Конструктор рецептов</h1>
        <button type="button" onClick="MainPage()">На главную</button>

        <div>
            <div class="all-ingredients-list">
                <h3>Ингредиенты</h3>
                <ul>
                    ${allIngredients.map(i => `
                        <li draggable="true" ondragstart="DragStart(event)">${i}</li>
                    `).join('')}
                </ul>
            </div>
            <div class="selectd-ingredients-list">
                <h3>Выбранные ингредиенты</h3>
                <div id="dropZone" class="drop-zone" ondragover="DragOver(event)" ondrop="Drop(event)"></div>
            </div>
        </div>

        <div id="findCount"></div>

        <div id="searchResults" class="recipesList"></div>
    </div>
    `;
    RenderSelectedIngredients();
}

function SearchByIngredients() {
    const result = document.getElementById('searchResults');

    if (selectedIngredients.length === 0) {
        result.innerHTML = '<p>Выберите ингредиенты<p>';
        return;
    }

    const found = recipes.filter(r =>
        r.ingredients && selectedIngredients.some(i => r.ingredients.includes(i))
    );

    if (found.length === 0) {
        result.innerHTML = '<p>Рецепты не найдены</p>';
        return;
    }

    const findCount = document.getElementById('findCount');

    findCount.innerHTML = `<h3>Найдено рецептов: ${found.length}</h3>`;

    result.innerHTML = `
        ${found.map(r => `
            <div class="recipe-card">
            <h3>${r.title}</h3>
            ${r.image ? `<img src="${r.image}" alt="${r.title}">` : '<img src="/source/images/picture.png" alt="${r.title}">'}

            <div class="card-info">
                <p><strong>Описание:</strong> ${r.description}</p>
                <p><strong>Калорийность:</strong> ${r.calories} ккал</p>
                <p><strong>Время:</strong> ${r.cookingTime} мин.</p>
                <p><strong>Автор:</strong> ${r.author || 'неизвестен'}</p>
            </div>

            <div class="card-btns">
                <button type="button" onclick="ViewRecipe(${r.id})">Подробнее</button>
                ${r.author === currentUser.name ? `
                    <button type="button" onclick="RecipeFormPage(${r.id})">Редактировать</button>
                    <button type="button" onclick="DeleteRecipe(${r.id})">Удалить</button>
                ` : ''}
            </div>
        </div>
        `).join('')}
    `;
}