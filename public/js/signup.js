const signup = async (name, email, password, confirmPassword) => {
    const baseUrl = 'http://127.0.0.1:3000/';
  try {
    const response = await axios.post(
      `${baseUrl}api/v1/users/signup`,
      {
        name: name,
        email: email,
        password: password,
        confirmPassword: confirmPassword,
      },
      {
        withCredentials: true,
      },
    );
    if (response.data.status === 'success') {
      alert('Signup successful!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1000);
    }
  } catch (error) {
    console.log(error.response.data.message);
  }
};

const singUpForm = document.querySelector('.form');
if (singUpForm) {
  singUpForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = `${document.getElementById('firstName').value} ${document.getElementById('lastName').value}`;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    // const role = document.getElementById('role').value;
    signup(name, email, password, confirmPassword);
  });
}
