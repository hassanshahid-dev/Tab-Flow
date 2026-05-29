function displayWorkspaces(workspaces) {

    const list = document.getElementById("list");
    list.innerHTML = "";

    //EMPTY STATE
    if (workspaces.length === 0) {
        list.innerHTML = "<p>No workspaces yet.</p>";
        return;
    }

    workspaces.forEach((ws) => {

        const li = document.createElement("li");

        li.innerHTML = `
            <strong>${ws.name}</strong><br>
            Tabs: ${ws.tabs.length}<br>
            Status: ${ws.isActive ? "🟢 Active" : "⚪ Closed"}<br>
            Created: ${new Date(ws.createdAt).toLocaleString()}
            <br><br>
        `;

        const buttonContainer = document.createElement("div");
        buttonContainer.classList.add("workspace-buttons");


        //RESTORE BUTTON
        const restore = document.createElement("button");
        restore.textContent = "Restore";

        restore.addEventListener("click", () => {
            chrome.tabs.query({ currentWindow: true }, (currentTabs) => {
                const currentUrls = currentTabs.map(tab => tab.url);
                ws.tabs.forEach((tab) => {
                    if (!currentUrls.includes(tab.url)) {
                        chrome.tabs.create({ url: tab.url });
                    }
                });
            });
        });


        //CLOSE WORKSPACE BUTTON
        const close = document.createElement("button");
        close.textContent = "Close & Save";

        close.addEventListener("click", async () => {

            const workspaceUrls = ws.tabs.map(t => t.url);

            chrome.tabs.query({ currentWindow: true }, async (currentTabs) => {
                const tabsToClose = currentTabs
                    .filter(tab => workspaceUrls.includes(tab.url))
                    .map(tab => tab.id);

                if (tabsToClose.length > 0) {
                    chrome.tabs.remove(tabsToClose);
                }

                await API.updateWorkspace(ws._id, {isActive : false});

                const updated = await Storage.closeWorkspace(ws._id);
                displayWorkspaces(updated);
            });

        });


        //DELETE BUTTON
        const del = document.createElement("button");
        del.textContent = "Delete";

        del.addEventListener("click", async () => {
            if (!confirm("Delete this workspace?")) return;

            await API.deleteWorkspace(ws._id);
            const updated = await Storage.deleteWorkspace(ws._id);

            displayWorkspaces(updated);

        });


        buttonContainer.appendChild(restore);
        buttonContainer.appendChild(close);
        buttonContainer.appendChild(del);
        li.appendChild(buttonContainer);
        list.appendChild(li);

    });

}