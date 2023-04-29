const playerSubmit = document.getElementById('playerSubmit');
var nameText1 = document.getElementById('player1');
var nameText2 = document.getElementById('player2');


playerSubmit.addEventListener('click', async () => {
    
   if (await checkForm()) {
       return;
   }

    nameText1 = document.getElementById('player1');
    nameText2 = document.getElementById('player2');
    sessionStorage.setItem('name1', nameText1.value);
    sessionStorage.setItem('name2', nameText2.value);

    if (sessionStorage.getItem('leaderboard')) {

        window.location.href = `http://localhost:3000/?player1=${nameText1.value}&player2=${nameText2.value}&leaderboard=${sessionStorage.getItem('leaderboard')}`;

    } else {
        
        window.location.href = `http://localhost:3000/?player1=${nameText1.value}&player2=${nameText2.value}`;

    }
    

    event.preventDefault();

});


window.onbeforeunload = () => {

    if (window.location.href === 'http://localhost:3000/' || window.location.href === "http://localhost:3000") {
        
        sessionStorage.clear();

    }

}


async function checkForm() {
    const name = document.getElementById('player1');
    const error = document.getElementById('errorMessage');
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
        name.classList.add('error');
        const nameErr1 = document.createElement('li');
        nameErr1.textContent = 'Username must be between 1 and 26 characters.';
        error.appendChild(nameErr1);
    }
  
    // Check for invalid username
    if (!name.value || !/^[a-zA-z0-9]*[a-zA-z][a-zA-z0-9]*$/.test(name.value)) {
      errorsFound = true;
      name.classList.add('error');
      const nameErr = document.createElement('li');
      nameErr.textContent = 'Invalid Username.';
      error.appendChild(nameErr);
    }
  
    if (errorsFound) {
      error.hidden = false;
    } else {
      error.hidden = true;
      name.classList.remove('error');
    }


    return errorsFound;

  }
