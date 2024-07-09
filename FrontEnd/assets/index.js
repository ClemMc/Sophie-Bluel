document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token') ? localStorage.getItem('token') : false;
    await init();

    if (token) {
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
        <figure data-id="${work.id}">
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
    if (!loginLink) {
        return;
    }
    loginLink.textContent = 'logout';
    loginLink.href = '#';
    loginLink.addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.reload();
    });
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
                    <div class="miniature" data-id="${work.id}">
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
        openAddPhotoModal();
    });

    document.querySelectorAll('.delete-photo').forEach(button => {
        button.addEventListener('click', async (event) => {
            const photoId = event.currentTarget.dataset.id;
            await deletePhoto(photoId);
            document.querySelector(`.miniature[data-id="${photoId}"]`).remove();
        });
    });
}

function openAddPhotoModal() {
    const addPhotoModal = document.createElement('div');
    addPhotoModal.id = 'addPhotoModal';
    addPhotoModal.classList.add('modal');
    addPhotoModal.innerHTML = `
            <div class="modal-content">
                <i id="previewModal" class="fa-solid fa-arrow-left"></i>
                <span class="close">&times;</span>
                <h3>Ajout photo</h3>
                <div id="imageContainer">
                    <i class="fa-solid fa-image"></i>
                    <div id="inputFile">
                        <label for="filetoUpload" class="fileLabel">
                        <span>+ Ajouter une photo</span>
                        <input type="file" id="filetoUpload" name="image" accept="image/png, image/jpeg"
                        class="file-input">
                        </label>
                    </div>
                    <span class="filesize">jpg, png : 4mo max</span>
                    <span id="errorImg"></span>
                </div>
                <div class="inputEdit" id="addTitle">
                    <label for="title">Titre</label>
                    <input type="text" name="title" id="title" class="inputCss" required>
                    <span id="ErrorTitleSubmit" class="errormsg"></span>
                </div>

                <div class=" inputEdit" id="addCategory">
                    <label for="category">Catégorie</label>
                    <select name="category" id="category" data-id="" class="inputCss"></select>
                    <span id="ErrorCategorySubmit" class="errormsg"></span>
                </div>
                <hr class="hr" />
                <form id="addPhoto">
                    <input type="submit" value="Valider">
                </form>
            </div>
    `;

    document.body.appendChild(addPhotoModal);
    addPhotoModal.style.display = 'block';

    // Fermer la modal

    function closeModals() {
        addPhotoModal.style.display = 'none';
        document.body.removeChild(addPhotoModal);

        const mainModal = document.getElementById('editModal');
        if (mainModal) {
            mainModal.style.display = 'none';
            document.body.removeChild(mainModal);
        }
    }

    addPhotoModal.querySelector('.close').addEventListener('click', closeModals);
    
    addPhotoModal.querySelector('#previewModal').addEventListener('click', () => {
        addPhotoModal.style.display = 'none';
        document.body.removeChild(addPhotoModal);
    })


    window.addEventListener('click', (event) => {
        if (event.target === addPhotoModal || event.target === document.getElementById('editModal')) {
            closeModals();
        }
    });
 

    // Gérer la soumission du formulaire pour ajouter une photo
    document.querySelector('#uploadPhoto').addEventListener('submit', async (event) => {
        event.preventDefault();
        const title = document.querySelector('#title').value;
        const imageUrl = document.querySelector('#imageUrl').value;
        await addPhoto({ title, imageUrl });
        addPhotoModal.style.display = 'none';
        document.body.removeChild(addPhotoModal);
    });
}

async function addPhoto(photoData) {
    const response = await fetch('http://localhost:5678/api/works', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(photoData)
    });

    if (response.ok) {
        console.log('Photo ajoutée avec succès');
        // Rechargez la galerie pour afficher la nouvelle photo
        const works = await fetchWorks();
        generateGallery(works);
    } else {
        console.error('Erreur lors de l\'ajout de la photo');
    }
}


async function deletePhoto(photoId) {
    // Logique pour supprimer la photo par ID
    const response = await fetch(`http://localhost:5678/api/works/${photoId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
    });

    if (response.ok) {
        console.log(`Photo ${photoId} supprimée`);
    } else {
        console.error(`Erreur lors de la suppression de la photo ${photoId}`);
    }
}
