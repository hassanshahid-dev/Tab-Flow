//Logout State
document.getElementById('logoutBtn').addEventListener('click', () => {
    chrome.storage.local.remove(['token', 'user'], () => {
        window.location.href = 'Login.html';
    });
});


//CREATE WORKSPACE
document.getElementById("createWorkSpace").addEventListener("click", async () => {
    
    const workspaceName = document.getElementById("workSpaceInput").value.trim();

    if (!workspaceName) {
        alert("Please enter a workspace name");
        return;
    }

    getTabs(async (tabs) => {

        const workspace = await API.createWorkspace(workspaceName, tabs);
        if (workspace.error) {
            alert('Error creating workspace: ' + workspace.error);
            return;
        }
        await Storage.addWorkspace(workspace);
        
        const updatedWorkspaces = await Storage.getWorkspaces();
        displayWorkspaces(updatedWorkspaces);

        document.getElementById("workSpaceInput").value = "";
    });

});


//INITIAL LOAD
(async () => {

    //Login Check
    const data = await chrome.storage.local.get('token');
    if (!data.token) {
        window.location.href = 'login.html';
        return;                            
    }

    try {
        const backendWorkspaces = await API.getWorkspaces();
        
        if (Array.isArray(backendWorkspaces)) {
            await Storage.saveWorkspaces(backendWorkspaces);
            displayWorkspaces(backendWorkspaces);
        }
        else {
            throw new Error('Backend unavailable');
        }

    } catch (error) {
        const local = await Storage.getWorkspaces();
        displayWorkspaces(local);
    }
})();
