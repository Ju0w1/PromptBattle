document.getElementById('gameForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const name = document.getElementById('name').value;

    if(name){
        sessionStorage.setItem('username', name);
        window.location.href = '/lobby';
    }else{
        window.location.href = '/';
    }
});