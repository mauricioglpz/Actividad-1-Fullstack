class Tarea {
    constructor(id, titulo, descripcion) {
        this.id = id
        this.titulo = titulo
        this.descripcion = descripcion
    }
}

let TOKEN = localStorage.getItem('token') || null

class GestorDeTareas {
    constructor() {
        this.taskListElement = document.getElementById('taskList')
        this.inputElement = document.getElementById('taskInput')

        if (TOKEN) {
            this.cargarTareas()
        }
    }

    async cargarTareas() {
        try {
            const res = await fetch('http://localhost:3000/api/tareas', {
                headers: {
                    Authorization: `Bearer ${TOKEN}`
                }
            })

            if (!res.ok) throw new Error()

            const tareas = await res.json()
            this.render(tareas)
        } catch {
            console.log('No autorizado')
        }
    }

    async agregarTarea(nombre) {
        if (!TOKEN) {
            alert('Debes iniciar sesión')
            return
        }

        if (nombre.trim() === '') return

        await fetch('http://localhost:3000/api/tareas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${TOKEN}`
            },
            body: JSON.stringify({
                titulo: nombre,
                descripcion: 'Agendada desde la página web'
            })
        })

        this.inputElement.value = ''
        this.cargarTareas()
    }

    async eliminarTarea(id) {
        await fetch(`http://localhost:3000/api/tareas/${id}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${TOKEN}`
            }
        })

        this.cargarTareas()
    }

    render(tareas) {
        this.taskListElement.innerHTML = ''

        tareas.forEach(tarea => {
            const li = document.createElement('li')
            li.className = 'course-col'
            li.style.display = 'flex'
            li.style.justifyContent = 'space-between'
            li.style.alignItems = 'center'
            li.style.marginBottom = '15px'

            li.innerHTML = `
                <span>${tarea.titulo}</span>
                <button onclick="gestor.eliminarTarea(${tarea.id})"
                    style="color:red;border:none;background:none;cursor:pointer;">
                    <i class="fa fa-trash"></i>
                </button>
            `

            this.taskListElement.appendChild(li)
        })
    }
}

const gestor = new GestorDeTareas()

document.getElementById('addTaskBtn').addEventListener('click', () => {
    gestor.agregarTarea(document.getElementById('taskInput').value)
})

document.getElementById('taskInput').addEventListener('keypress', e => {
    if (e.key === 'Enter') gestor.agregarTarea(e.target.value)
})

async function login() {
    const usuario = document.getElementById('email').value
    const password = document.getElementById('password').value

    try {
        const res = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario, password })
        })

        const data = await res.json()

        if (data.token) {
            TOKEN = data.token
            localStorage.setItem('token', TOKEN)
            document.getElementById('loginMsg').innerText = 'Sesión iniciada correctamente'
            gestor.cargarTareas()
        } else {
            document.getElementById('loginMsg').innerText = 'Credenciales incorrectas'
        }
    } catch {
        document.getElementById('loginMsg').innerText = 'Servidor no disponible'
    }
}

async function register() {
    const usuario = document.getElementById('email').value
    const password = document.getElementById('password').value

    try {
        const res = await fetch('http://localhost:3000/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario, password })
        })

        const data = await res.json()
        document.getElementById('loginMsg').innerText = data.mensaje
    } catch {
        document.getElementById('loginMsg').innerText = 'Servidor no disponible'
    }
}
