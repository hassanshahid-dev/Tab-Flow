const emailInput = document.getElementById('emailInput');
const passwordInput = document.getElementById('passwordInput');
const authError = document.getElementById('authError');

function showError(msg) {
    authError.textContent = msg;
    authError.style.display = 'block';
}

async function handleAuth(type) {
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if(!email || !password) {
        showError('Please enter email and password');
        return;
    }

    const data = type === 'login'
    ? await API.login(email,password)
    : await API.register(email,password);

    if(data.error) {
        showError(data.error)
        return;
    }

    //Save Token and User data
    chrome.storage.local.set({
        'token' : data.token,
        'user' : data.user
    }, () => {
        window.location.href = 'popup.html';
    });
    
}

document.getElementById('loginBtn')
    .addEventListener('click', () => handleAuth('login'));

document.getElementById('registerBtn')
    .addEventListener('click', () => handleAuth('register'));