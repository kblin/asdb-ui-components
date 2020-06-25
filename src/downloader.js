const MIME_MAP = {
    csv: 'text/csv',
    fasta: 'application/fasta',
    json: 'application/json'
};

function createDownloadOptions(query, type) {
    return {
        method: 'POST',
        cache: 'reload',
        headers: {
            "Content-Type": "application/json",
            Accept: MIME_MAP[type],
        },
        body: JSON.stringify(query),
    };
}


export function fetchDownload(query, type) {
    let options = createDownloadOptions(query, type);
    fetch("/api/v1.0/export", options)
    .then(response => {
        if (!response.ok) {
            console.error(response);
            return;
        }
        return response.blob();
    })
    .then(blob => {
        // create a non-DOM-connected <a> element
        let url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `antismash_db_results.${type}`;

        // set up a click handler that cleans up after itself
        const clickHandler = event => {
            setTimeout(() => {
                URL.revokeObjectURL(url);
                event.target.removeEventListener('click', clickHandler);
            }, 200);
        };

        a.addEventListener('click', clickHandler, false);

        a.click();
    })
}
