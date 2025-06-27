const login = async (email, password) => {
    const baseUrl = 'http://127.0.0.1:3000/';
    try {
        const response = await axios.post(
          `${baseUrl}api/v1/users/login`,
          {
            email: email,
            password: password,
          },
          {
            withCredentials: true,
          },
        );
        if (response.data.status === 'success') {
          alert('Logged in successfully!');
          window.setTimeout(() => {
            location.assign('/');
          }, 1000);
        }
    } catch (error) {
        console.log(error.response.data)
    }
}

const formElement = document.querySelector('.form');
if (formElement) {
    formElement.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value; 
      login(email, password);
    });
}