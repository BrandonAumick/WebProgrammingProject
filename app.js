// Get DOM elements
const form = document.querySelector('#register-form');
const formErrors = document.querySelector('#form-errors');

document.getElementById("submit").addEventListener("click", function(event) {
    checkForm();
 
    // Prevent default form action. DO NOT REMOVE THIS LINE
    event.preventDefault();
 });

 function checkForm() {
    const name = document.getElementById('name');
    const error = document.getElementById('formErrors');
    error.innerHTML = ''; // clear previous error messages
    let errorsFound = false;
  
    // Check for missing username
    if (!name.value) {
      errorsFound = true;
      name.classList.add('error');
      const nameErr = document.createElement('li');
      nameErr.textContent = 'Missing username.';
      error.appendChild(nameErr);
    }
    // Check for username length
    if (name.value.length < 1 || name.value.length > 26) {
        errorsFound = true;
        password.classList.add('error');
        const passErr1 = document.createElement('li');
        passErr1.textContent = 'Username must be between 1 and 26 characters.';
        error.appendChild(passErr1);
    }
  
    // Check for invalid username
    if (!name.value || !/^[a-zA-Z0-9]{2,5}$/.test(name.value)) {
      errorsFound = true;
      email.classList.add('error');
      const emailErr = document.createElement('li');
      emailErr.textContent = 'Invalid Username.';
      error.appendChild(emailErr);
    }
  
    if (errorsFound) {
      error.classList.remove('hide');
    } else {
      error.classList.add('hide');
      name.classList.remove('error');
    }
  }  