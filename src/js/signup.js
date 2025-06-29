import axios from 'axios';

const baseUrl = process.env.PUBLIC_BASE_URL;

export const initSignup = () => {
  document.addEventListener('DOMContentLoaded', function () {
    const avatarFile = document.getElementById('avatarFile');
    const avatarPreview = document.getElementById('avatarPreview');
    const roleRadios = document.querySelectorAll('input[name="role"]');
    const adminModal = document.getElementById('adminModal');
    const adminSecretInput = document.getElementById('adminSecretInput');
    const confirmSecretBtn = document.getElementById('confirmSecret');
    const cancelSecretBtn = document.getElementById('cancelSecret');
    const secretCodeInput = document.getElementById('secretCode');
    const signupForm = document.getElementById('signupForm');
    const radioItems = document.querySelectorAll('.radio-item');

    if (!signupForm) return;

    let selectedAdminRole = false;

    avatarFile?.addEventListener('change', function (e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
          avatarPreview.style.backgroundImage = `url(${e.target.result})`;
          avatarPreview.classList.add('has-image');
          avatarPreview.innerHTML = '';
        };
        reader.readAsDataURL(file);
      }
    });

    avatarPreview?.addEventListener('click', function () {
      avatarFile.click();
    });

    roleRadios.forEach((radio) => {
      radio.addEventListener('change', function () {
        radioItems.forEach((item) => item.classList.remove('selected'));
        this.closest('.radio-item').classList.add('selected');

        if (this.value === 'admin') {
          selectedAdminRole = true;
          showAdminModal();
        } else {
          selectedAdminRole = false;
          secretCodeInput.value = '';
        }
      });
    });

    document.querySelector('.radio-item')?.classList.add('selected');

    function showAdminModal() {
      adminModal.classList.add('show');
      adminSecretInput.focus();
    }

    function hideAdminModal() {
      adminModal.classList.remove('show');
      adminSecretInput.value = '';
    }

    confirmSecretBtn?.addEventListener('click', function () {
      const secretCode = adminSecretInput.value.trim();
      if (secretCode) {
        secretCodeInput.value = secretCode;
        hideAdminModal();
      } else {
        adminSecretInput.style.borderColor = '#dc2626';
        adminSecretInput.focus();
      }
    });

    cancelSecretBtn?.addEventListener('click', function () {
      document.getElementById('user').checked = true;
      document.querySelector('.radio-item')?.classList.add('selected');
      document
        .querySelector('input[value="admin"]')
        ?.closest('.radio-item')
        ?.classList.remove('selected');
      selectedAdminRole = false;
      secretCodeInput.value = '';
      hideAdminModal();
    });

    adminModal?.addEventListener('click', function (e) {
      if (e.target === adminModal) {
        cancelSecretBtn?.click();
      }
    });

    adminSecretInput?.addEventListener('keypress', function (e) {
      if (e.key === 'Enter') {
        confirmSecretBtn?.click();
      }
    });

    const signup = async (
      name,
      email,
      password,
      confirmPassword,
      role,
      secretCode,
      avatarFile,
    ) => {
      
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('password', password);
      formData.append('confirmPassword', confirmPassword);
      formData.append('role', role);
      formData.append('secretCode', secretCode);
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      try {
        const response = await axios.post(
          `${baseUrl}api/v1/users/signup`,
          formData,
          {
            withCredentials: true,
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          },
        );

        if (response.data.status === 'success') {
          alert('Signup successful!');
          setTimeout(() => {
            location.assign('/');
          }, 1000);
        }
      } catch (error) {
        console.log(error.response?.data?.message || error.message);
      }
    };

    signupForm?.addEventListener('submit', function (e) {
      e.preventDefault();

      const firstName = document.getElementById('firstName').value.trim();
      const lastName = document.getElementById('lastName').value.trim();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
      const role =
        document.querySelector('input[name="role"]:checked')?.value || 'user';
      const secretCode = secretCodeInput.value.trim();
      const avatarInput = document.getElementById('avatarFile');
      const avatarFile = avatarInput?.files[0];

      if (role === 'admin' && !secretCode) {
        showAdminModal();
        return;
      }

      const fullName = `${firstName} ${lastName}`;
      signup(
        fullName,
        email,
        password,
        confirmPassword,
        role,
        secretCode,
        avatarFile,
      );
    });
  });
};
