async function fetchAndGenerateGallery() {
    const works = await fetchWorks();
    generateGallery(works);

    const categories = await fetchCategories();
    setupFilterButtons(categories, works);
}

fetchAndGenerateGallery();

async function fetchWorks() {
    const response = await fetch('http://localhost:5678/api/works');
    return response.json();
}

async function fetchCategories() {
    const response = await fetch('http://localhost:5678/api/categories');
    return response.json();
}

const generateGallery = (works) => {
    document.querySelector(".gallery").innerHTML = works.map(work => `
        <figure>
            <img src="${work.imageUrl}" alt="${work.title}">
            <figcaption>${work.title}</figcaption>
        </figure>`).join('');
};
function createButton(category, works) {
    const button = document.createElement('button');
    button.textContent = category.name;
    button.dataset.id = category.id;
    button.classList.add('filter-btn');

    button.addEventListener('click', () => {
        const filteredWorks = category.id === 0 ? works : works.filter(work => work.categoryId === category.id);
        generateGallery(filteredWorks);
    });

    return button;
}

function setupFilterButtons(categories, works) {
    const divFilter = document.createElement('div');
    divFilter.classList.add('filter');

    const sectionPortfolio = document.getElementById('portfolio');
    const divGallery = sectionPortfolio.querySelector('.gallery');
    sectionPortfolio.insertBefore(divFilter, divGallery);

    const allButton = createButton({ id: 0, name: 'Tous' }, works);
    divFilter.appendChild(allButton);

    categories.forEach(category => {
        const filterBtn = createButton(category, works);
        divFilter.appendChild(filterBtn);
    });
}

