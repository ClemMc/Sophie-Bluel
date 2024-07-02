document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('#loginForm');

  form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = document.querySelector('#email').value;
      const password = document.querySelector('#password').value;
      const loginError = document.querySelector('.loginError');
      const passwordError = document.querySelector('.passwordError');

      loginError.textContent = '';
      passwordError.textContent = '';

      if (email === '' || password === '') {
          loginError.textContent = 'Veuillez remplir tous les champs.';
          return;
      }

      if (!email.includes('@')) {
          loginError.textContent = 'Veuillez saisir un email valide.';
          return;
      }

      if (password.length < 6) {
          passwordError.textContent = 'Le mot de passe doit faire 6 caractères minimum.';
          return;
      }

      try {
          const response = await fetch('http://localhost:5678/api/users/login', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                  email: email,
                  password: password,
              })
          });

          const result = await response.json();

          if (response.ok) {
              console.log('Connexion réussie', result);
              localStorage.setItem('isLoggedIn', 'true');
              window.location.href = 'index.html';
          } else {
              loginError.textContent = 'Erreur de connexion: Veuillez réessayer. ';
          }
      } catch (error) {
          loginError.textContent = 'Erreur de réseau: ' + error.message;
      }
  });
});
