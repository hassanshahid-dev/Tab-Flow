// ui.js

function displayWorkspaces(workspaces) {

    const list = document.getElementById('list');
    list.innerHTML = '';

    if (workspaces.length === 0) {
        list.innerHTML = '<p>No workspaces yet.</p>';
        return;
    }

    // Split into active and closed workspaces
    const active = workspaces.filter(ws => ws.isActive);
    const closed = workspaces.filter(ws => !ws.isActive);


    // ========================
    // ACTIVE WORKSPACES
    // ========================
    if (active.length > 0) {
        const activeHeader = document.createElement('p');
        activeHeader.textContent = '🟢 Active';
        activeHeader.classList.add('section-header');
        list.appendChild(activeHeader);

        active.forEach(ws => renderWorkspaceCard(ws, list));
    }


    // ========================
    // CLOSED WORKSPACES
    // ========================
    if (closed.length > 0) {
        const closedHeader = document.createElement('p');
        closedHeader.textContent = '⚪ Closed';
        closedHeader.classList.add('section-header');
        list.appendChild(closedHeader);

        closed.forEach(ws => renderWorkspaceCard(ws, list));
    }

}


function renderWorkspaceCard(ws, list) {

    const li = document.createElement('li');

    // In renderWorkspaceCard, after creating the li element, add:
    if (!ws.isActive) {
        li.classList.add('closed');
    }

    // ========================
    // RAM SAVINGS DISPLAY
    // Rough estimate: ~150MB per tab
    // ========================
    const estimatedRAM = ws.isActive
        ? ''
        : `💾 Saving ~${ws.tabs.length * 150}MB RAM`;

    li.innerHTML = `
        <div class="workspace-header">
            <strong>${ws.name}</strong>
            <span class="tab-count">${ws.tabs.length} tabs</span>
        </div>
        <small>${new Date(ws.createdAt).toLocaleDateString()}</small>
        ${estimatedRAM ? `<p class="ram-savings">${estimatedRAM}</p>` : ''}
        <ul class="tab-list">
            ${ws.tabs.slice(0, 3).map(t => `
                <li class="tab-item" title="${t.url}">
                    <img src="https://www.google.com/s2/favicons?domain=${t.url}" 
                         width="14" height="14" />
                    ${t.title.length > 40 ? t.title.slice(0, 40) + '...' : t.title}
                </li>
            `).join('')}
            ${ws.tabs.length > 3 ? `<li class="tab-item muted">+${ws.tabs.length - 3} more</li>` : ''}
        </ul>
    `;

    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('workspace-buttons');


    // ========================
    // RESTORE BUTTON
    // Only show on closed workspaces
    // ========================
    if (!ws.isActive) {
        const restore = document.createElement('button');
        restore.textContent = 'Restore';
        restore.classList.add('btn-primary');

        restore.addEventListener('click', async () => {
            await restoreWorkspace(ws);
        });

        buttonContainer.appendChild(restore);
    }


    // ========================
    // CLOSE BUTTON
    // Only show on active workspaces
    // ========================
    if (ws.isActive) {
        const close = document.createElement('button');
        close.textContent = 'Close & Save';
        close.classList.add('btn-secondary');

        close.addEventListener('click', async () => {
            await suspendWorkspace(ws);
        });

        buttonContainer.appendChild(close);
    }


    // ========================
    // DELETE BUTTON
    // Always visible
    // ========================
    const del = document.createElement('button');
    del.textContent = 'Delete';
    del.classList.add('btn-danger');

    del.addEventListener('click', async () => {
        if (!confirm('Delete this workspace?')) return;

        await API.deleteWorkspace(ws.id || ws._id);
        const updated = await Storage.deleteWorkspace(ws.id || ws._id);
        displayWorkspaces(updated);
    });

    buttonContainer.appendChild(del);
    li.appendChild(buttonContainer);
    list.appendChild(li);

}


// ========================
// SUSPEND WORKSPACE
// Close tabs in browser, mark inactive
// ========================
async function suspendWorkspace(ws) {

    const workspaceUrls = ws.tabs.map(t => t.url);

    chrome.tabs.query({ currentWindow: true }, async (currentTabs) => {

        const tabsToClose = currentTabs
            .filter(tab => workspaceUrls.includes(tab.url))
            .map(tab => tab.id);

        if (tabsToClose.length > 0) {
            chrome.tabs.remove(tabsToClose);
        }

        const id = ws.id || ws._id;

        // Update backend
        await API.updateWorkspace(id, { isActive: false });

        // Update local
        const updated = await Storage.closeWorkspace(id);
        displayWorkspaces(updated);

    });

}


// ========================
// RESTORE WORKSPACE
// Reopen tabs, mark active
// ========================
async function restoreWorkspace(ws) {

    // Open tabs that aren't already open
    chrome.tabs.query({ currentWindow: true }, async (currentTabs) => {

        const currentUrls = currentTabs.map(tab => tab.url);

        ws.tabs.forEach(tab => {
            if (!currentUrls.includes(tab.url)) {
                chrome.tabs.create({ url: tab.url, active: false });
            }
        });

        const id = ws.id || ws._id;

        // Mark active in backend
        await API.updateWorkspace(id, { isActive: true });

        // Mark active in local
        const updated = await Storage.activateWorkspace(id)

        await Storage.saveWorkspaces(updated);
        displayWorkspaces(updated);

    });

}