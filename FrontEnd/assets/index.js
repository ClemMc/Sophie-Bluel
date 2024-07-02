document.addEventListener('DOMContentLoaded', async () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

    await init();

    if (isLoggedIn) {
        editMode();
        updateLog();
    }
});

async function init() {
    const works = await fetchWorks();
    generateGallery(works);

    const categories = await fetchCategories();
    setupFilterButtons(categories, works);
}

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

function editMode() {
    const filterDiv = document.querySelector('.filter');
    if (filterDiv) {
        filterDiv.remove();
    }

    const sectionPortfolio = document.getElementById('portfolio');
    const h2 = sectionPortfolio.querySelector('h2');

    const editSpan = document.createElement('span');
    editSpan.innerHTML = '<i class="fa-regular fa-pen-to-square"></i> Modifier';
    editSpan.classList.add('edit-span');
    h2.appendChild(editSpan);

    editSpan.addEventListener('click', openModal);

    const editBanner = document.createElement('div');
    editBanner.innerHTML = '<i class="fa-regular fa-pen-to-square"></i> Mode édition';
    editBanner.classList.add('edit-banner');
    document.body.insertBefore(editBanner, document.body.firstChild);
}

function updateLog() {
    const nav = document.querySelector('nav ul');
    const loginLink = nav.querySelector('a[href="login.html"]');
    if (loginLink) {
        loginLink.textContent = 'logout';
        loginLink.href = '#';
        loginLink.addEventListener('click', () => {
            localStorage.removeItem('isLoggedIn');
            window.location.reload();
        });
    }
}

async function openModal() {
    const works = await fetchWorks();

    const modal = document.createElement('div');
    modal.id = 'editModal';
    modal.classList.add('modal');
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <h3>Galerie photo</h3>
            <div id="photoList">
                ${works.map(work => `
                    <div class="thumbnail">
                        <img src="${work.imageUrl}" alt="${work.title}">
                        <button class="delete-photo" data-id="${work.id}">
                            <i class="fa fa-trash"></i>
                        </button>
                    </div>
                `).join('')}
            </div>
            <hr />
            <form id="addPhoto">
                <input type="submit" value="Ajouter une photo">
            </form>
        </div>
    `;

    document.body.appendChild(modal);
    modal.style.display = 'block';
    modal.querySelector('.close').addEventListener('click', () => {
        modal.style.display = 'none';
        document.body.removeChild(modal);
    });

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
            document.body.removeChild(modal);
        }
    });

    document.querySelector('#addPhoto').addEventListener('submit', (event) => {
        event.preventDefault();
        const newImage = document.querySelector('#newImage').files[0];
        if (newImage) {
            console.log('Nouvelle image ajoutée:', newImage);
        }
    });

    document.querySelectorAll('.delete-photo').forEach(button => {
        button.addEventListener('click', async (event) => {
            const photoId = event.target.closest('button').dataset.id;
            await deletePhoto(photoId);
            event.target.closest('.thumbnail').remove();
        });
    });
}

async function deletePhoto(photoId) {
    const response = await fetch(`http://localhost:5678/api/works/${photoId}`, {
        method: 'DELETE',
    });
    if (response.ok) {
        console.log(`Photo ${photoId} supprimée`);
    } else {
        console.error(`Erreur lors de la suppression de la photo ${photoId}`);
    }
}
