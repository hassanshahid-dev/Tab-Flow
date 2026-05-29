const Storage = {

    async getWorkspaces() {
        return new Promise((resolve) => {
            chrome.storage.local.get("workSpaces", (data) => {
                resolve(data.workSpaces || []);
            });
        });
    },

    async saveWorkspaces(workspaces) {
        return new Promise((resolve) => {
            chrome.storage.local.set({ workSpaces: workspaces }, resolve);
        });
    },

    async addWorkspace(newWorkspace) {
        const workspaces = await this.getWorkspaces();
        workspaces.push(newWorkspace);
        await this.saveWorkspaces(workspaces);
        return workspaces;
    },

    async deleteWorkspace(id) {
        const workspaces = await this.getWorkspaces();
        const updated = workspaces.filter(ws => ws._id !== id);
        await this.saveWorkspaces(updated);
        return updated;
    },

    async closeWorkspace(id) {
        const workspaces = await this.getWorkspaces();
        const updated = workspaces.map(ws =>
            ws._id === id ? { ...ws, isActive: false } : ws
        );
        await this.saveWorkspaces(updated);
        return updated;
    },

    async activateWorkspace(id) {
        const workspaces = await this.getWorkspaces();
        const updated = workspaces.map(ws =>
            ws._id === id ? { ...ws, isActive : true } : ws
        );
        await this.saveWorkspaces(updated);
        return updated;
    }

};