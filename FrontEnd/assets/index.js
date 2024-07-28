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
            removePhotoFromDOM(photoId);
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
            <form id="uploadPhoto" enctype="multipart/form-data">
            <div id="imageContainer">
                <div id="previewContainer">
                    <i class="fa-solid fa-image"></i>
                    <div id="inputFile">
                        <label for="filetoUpload" class="fileLabel">
                        <span>+ Ajouter une photo</span>
                        <input type="file" id="filetoUpload" name="image" accept="image/png, image/jpeg" class="file-input">
                        </label>
                    </div>
                    
                    <span class="filesize">jpg, png : 4mo max</span>
                    <span id="errorImg" class="errormsg"></span>
                </div>
            </div>
            <div class="inputEdit" id="addTitle">
                <label for="title">Titre</label>
                <input type="text" name="title" id="title" class="inputCss" required>
                <span id="ErrorTitleSubmit" class="errormsg"></span>
            </div>

            <div class="inputEdit" id="addCategory">
                <label for="category">Catégorie</label>
                <select name="category" id="category" data-id="" class="inputCss"></select>
                <span id="ErrorCategorySubmit" class="errormsg"></span>
            </div>
            <hr class="hr" />
                <input type="submit" value="Valider" id="submitPhoto">
            </form>
        </div>
    `;

    document.body.appendChild(addPhotoModal);
    addPhotoModal.style.display = 'block';

    allCategories();

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
    });

    window.addEventListener('click', (event) => {
        if (event.target === addPhotoModal || event.target === document.getElementById('editModal')) {
            closeModals();
        }
    });

    document.querySelector('#filetoUpload').addEventListener('change', imagePreview);
    
document.querySelector('#uploadPhoto').addEventListener('submit', async (event) => {
    event.preventDefault();

    const errorImg = document.getElementById('errorImg');
    const errorTitleSubmit = document.getElementById('ErrorTitleSubmit');
    const errorCategorySubmit = document.getElementById('ErrorCategorySubmit');

    if (errorImg) {
        errorImg.textContent = '';
    }
    if (errorTitleSubmit) {
        errorTitleSubmit.textContent = '';
    }
    if (errorCategorySubmit) {
        errorCategorySubmit.textContent = '';
    }

    const title = document.querySelector('#title').value;
    const category = document.querySelector('#category').value;
    const image = file ? file : null;
    let valid = true;

    if (!title) {
        if (errorTitleSubmit) {
            errorTitleSubmit.textContent = 'Veuillez saisir un titre.';
        }
        valid = false;
    }

    if (!category) {
        if (errorCategorySubmit) {
            errorCategorySubmit.textContent = 'Veuillez sélectionner une catégorie.';
        }
        valid = false;
    }

    if (!image) {
        if (errorImg) {
            errorImg.textContent = 'Veuillez sélectionner une image.';
        }
        valid = false;
    }

    if (!valid) {
        return;
    }

    await addPhoto({ title, category, image });

    const addPhotoModal = document.getElementById('addPhotoModal');
    if (addPhotoModal) {
        addPhotoModal.style.display = 'none';
        document.body.removeChild(addPhotoModal);
    }
});
    
    
}

let file;
function imagePreview(event) {
    file = event.target.files[0];
    const previewContainer = document.getElementById('previewContainer');
    const inputFile = document.getElementById('inputFile');
    const fileSizeInfo = document.querySelector('.filesize');
    const errorImg = document.getElementById('errorImg');
    
    previewContainer.innerHTML = '';

    if (file) {
        if (file.size > 4 * 1024 * 1024) {
            errorImg.textContent = 'Le fichier dépasse la taille maximale de 4Mo.';
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = document.createElement('img');
            img.src = e.target.result;
            previewContainer.appendChild(img);

            inputFile.style.display = 'none';
            fileSizeInfo.style.display = 'none';
            errorImg.textContent = '';
        };
        reader.readAsDataURL(file);
    }
}

async function allCategories() {
    const categories = await fetchCategories();
    const categorySelect = document.getElementById('category');

    const emptyOption = document.createElement('option');
    emptyOption.value = '';
    emptyOption.textContent = '';
    categorySelect.appendChild(emptyOption);

    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        categorySelect.appendChild(option);
    });
}

async function addPhoto(photoData) {
    const formData = new FormData();
    formData.append('title', photoData.title);
    formData.append('category', photoData.category);
    formData.append('image', photoData.image);
    try {
        const response = await fetch('http://localhost:5678/api/works', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: formData
        });

        if (response.ok) {
            const works = await fetchWorks();
            generateGallery(works);
            const data = await response.json()
            addWorkToModal(data)
        } else {
            console.error('Erreur lors de l\'ajout de la photo');
            const errorMsg = await response.text();
            console.error('Message d\'erreur:', errorMsg);
        }
    } catch (error) {
        console.error('Erreur de connexion:', error);
    }
}
function addWorkToModal(work) {
    const photoList = document.querySelector('#photoList');
    const miniature = document.createElement('div');
    miniature.classList.add('miniature');
    miniature.dataset.id = work.id;
    miniature.innerHTML = `
        <img src="${work.imageUrl}" alt="${work.title}">
        <button class="delete-photo" data-id="${work.id}">
            <i class="fa fa-trash"></i>
        </button>
    `;

    photoList.appendChild(miniature);
    miniature.querySelector('.delete-photo').addEventListener('click', async (event) => {
        const photoId = event.currentTarget.dataset.id;
        await deletePhoto(photoId);
        removePhotoFromDOM(photoId);
    });
}

function insertPhotoIntoDOM(work) {
    const gallery = document.querySelector(".gallery");
    const figure = document.createElement('figure');
    figure.setAttribute('data-id', work.id);
    figure.innerHTML = `
        <img src="${work.imageUrl}" alt="${work.title}">
        <figcaption>${work.title}</figcaption>
    `;
    gallery.appendChild(figure);
}

async function deletePhoto(photoId) {
    try {
        const response = await fetch(`http://localhost:5678/api/works/${photoId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
        });

        if (response.ok) {
            removePhotoFromDOM(photoId);
        } else {
            console.error(`Erreur lors de la suppression de la photo ${photoId}`);
            const errorMsg = await response.text();
            console.error('Message d\'erreur:', errorMsg);
        }
    } catch (error) {
        console.error('Erreur de connexion:', error);
    }
}

function removePhotoFromDOM(photoId) {
    const photoMiniature = document.querySelector(`.miniature[data-id="${photoId}"]`);
    if (photoMiniature) {
        photoMiniature.remove();
    }

    const galleryItem = document.querySelector(`.gallery figure[data-id="${photoId}"]`);
    if (galleryItem) {
        galleryItem.remove();
    }
}
