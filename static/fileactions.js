const download = (drive, path) => {
    const link = document.createElement('a');
    link.href = `/files/raw?drive=${drive}&path=${path}`;
    link.download = decodeURIComponent(path).split('/').pop();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

async function shareFile(drive, path) {
    try {
        let expiresin = prompt('Share link expiration in seconds (default 3600):');

        // sanitize input
        expiresin = parseInt(expiresin);
        if (isNaN(expiresin) || expiresin <= 0) {
            expiresin = 3600;
        }

        const res = await fetch('/files/share', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ drive, path, expiresin })
        });

        if (!res.ok) {
            throw new Error('Failed to create share link');
        }

        const data = await res.json();

        if (!data.shareId) {
            throw new Error('Invalid response from server');
        }

        const url = `${window.location.origin}/s/${data.shareId}`;

        setTimeout(async () => {
            
        try {
            await navigator.clipboard.writeText(url);
            alert(`Share link copied to clipboard! Link: ${url}`);
        } catch (err) {
            console.error(err);
                    alert(`Share link: ${url}`);
        }
        }, 500);
    } catch (err) {
        console.error(err);
        alert('Error creating share link');
    }
}

const currentDrive = new URLSearchParams(window.location.search).get('drive');

const ctx_delete = () => {
    if(confirm('Are you sure you want to delete this file?')) {
        fetch('/file', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ drive: currentDrive, path: selPath })
        }).then(() => location.reload());
    }
};

const ctx_share = () => {
    shareFile(currentDrive, selPath);
};

const ctx_download = () => {
    download(currentDrive, selPath);
};

const ctx_rename = () => {
    const newName = prompt('Enter new name:');
    if (!newName) return;

    fetch('/file/rename', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ drive: currentDrive, path: selPath, newName })
    }).then(() => location.reload());
};

const ctx_move = () => {
    const newPath = prompt('Enter new path (excluding filename):');
    if (!newPath) return;

    fetch('/file/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ drive: currentDrive, path: selPath, newPath })
    }).then(() => location.reload());
};

const ctx_copy_path = () => {
    const fullPath = location.origin + `/files/raw?drive=${currentDrive}&path=${encodeURIComponent(selPath)}`;
    navigator.clipboard.writeText(fullPath).then(() => {
        alert(`Path copied to clipboard: ${fullPath}`);
    }).catch(err => {
        console.error(err);
        alert(`Failed to copy path. Path: ${fullPath}`);
    });
};

const ctx_open = () => {
    const url = location.origin + `/file?drive=${currentDrive}&path=${encodeURIComponent(selPath)}`;
    window.open(url, '_blank');
};
