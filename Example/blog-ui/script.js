const getUsers = async function(){
    const response = await fetch('http://localhost:3000/users')
    return response.json()
}

const showUsers = async function(){
    const users = await getUsers()
    users.forEach(user => {
        document.body.insertAdjacentHTML('beforeend', `<div>${user.last_name}, ${user.first_name}</div>`)
    })
}
