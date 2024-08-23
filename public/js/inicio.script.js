document.getElementById('gameForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const name = document.getElementById('name').value;

    console.log(name)

    if(name){
        localStorage.setItem('username', name);
        window.location.href = '/lobby';
    }else{
        window.location.href = '/';
    }
});