async function fetchAndGenerateGallery() {
    const response = await fetch('http://localhost:5678/api/works');
    const works = await response.json();

    function generateGallery(works) {
        const sectionGallery = document.querySelector(".gallery");

        sectionGallery.innerHTML = '';

        for (let i = 0; i < works.length; i++) {
            const photo = works[i];
            const figureGallery = document.createElement("figure");

            const imageUrlElement = document.createElement("img");
            imageUrlElement.src = photo.imageUrl;
            imageUrlElement.alt = photo.title;

            const titleElement = document.createElement("figcaption");
            titleElement.innerText = photo.title;

            figureGallery.appendChild(imageUrlElement);
            figureGallery.appendChild(titleElement);
            sectionGallery.appendChild(figureGallery);
        }
    }

    generateGallery(works);

    const divFilter = document.createElement('div');
    divFilter.classList.add('filter');

    const sectionPortfolio = document.getElementById('portfolio');
    const divGallery = sectionPortfolio.querySelector('.gallery');
    sectionPortfolio.insertBefore(divFilter, divGallery);

    const responses = await fetch('http://localhost:5678/api/categories');
    const categories = await responses.json();

    function createButton(category) {
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

    const allButton = createButton({ id: 0, name: 'Tous' });
    divFilter.appendChild(allButton);

    categories.forEach(category => {
        const filterBtn = createButton(category);
        divFilter.appendChild(filterBtn);
    });
}

fetchAndGenerateGallery();
