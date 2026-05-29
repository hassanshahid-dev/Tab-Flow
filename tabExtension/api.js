const BASE_URL = `http://localhost:5000/api`;

const API = {

    //AUTH APIs

    async register(email, password) {
        const res = await fetch(`${BASE_URL}/auth/register`, {
            method : 'POST',
            headers : { 'content-Type' : 'application/json' },
            body : JSON.stringify({ email, password})
        });
        return res.json();
    },

    async login(email, password) {
        const res = await fetch(`${BASE_URL}/auth/login`, {
            method : 'POST',
            headers : { 'content-Type' : 'application/json' },
            body : JSON.stringify( { email, password } )
        });
        return res.json();
    },

    //TOKEN from Local Storage

    async getToken() {
        return new Promise((resolve) => {
            chrome.storage.local.get('token', (data) => {
                resolve(data.token || null);
            });
        });
    },

    //Workspace APIs

    async getWorkspaces() {
        const token = await this.getToken();

        const res = await fetch(`${BASE_URL}/workspaces`, {
            method : 'GET',
            headers : { 'Authorization' : `Bearer ${token}` }
        });
        return res.json();
    },

    async createWorkspace(name, tabs) {
        const token = await this.getToken();

        const res = await fetch(`${BASE_URL}/workspaces`, {
            method : 'POST',
            headers : {
                'content-Type' : 'application/json',
                'Authorization' : `Bearer ${token}` 
            },
            body : JSON.stringify( {name, tabs} )
        });
        return res.json();
    },

    async updateWorkspace(id, data) {
        const token = await this.getToken();

        const res = await fetch(`${BASE_URL}/workspaces/${id}`, {
            method : 'PUT',
            headers : {
                'content-Type' : 'application/json',
                'Authorization' : `Bearer ${token}`
            },
            body : JSON.stringify( {data} )
        });
        return res.json();
    },

    async deleteWorkspace(id) {
    const token = await this.getToken();

    console.log("Deleting:", id);
    console.log("URL:", `${BASE_URL}/workspaces/${id}`);

    const res = await fetch(`${BASE_URL}/workspaces/${id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    console.log("Status:", res.status);

    return res.json();
}
}