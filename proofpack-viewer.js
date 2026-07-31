(() => {
  const loading = document.getElementById('loading');
  const errorCard = document.getElementById('error');
  const errorMessage = document.getElementById('error-message');
  const viewerShell = document.getElementById('viewer-shell');
  const viewerFrame = document.getElementById('viewer-frame');
  const printButton = document.getElementById('print-button');

  function showError(message) {
    loading.hidden = true;
    viewerShell.style.display = 'none';
    errorCard.style.display = 'block';
    errorMessage.textContent = message || 'This package could not be opened.';
    document.title = 'ProofPack unavailable';
  }

  function isAllowedEndpoint(url) {
    const host = url.hostname.toLowerCase();
    const isSupabaseHost =
      host.endsWith('.supabase.co') || host.endsWith('.supabase.net');
    return (
      url.protocol === 'https:' &&
      isSupabaseHost &&
      url.pathname === '/functions/v1/proof-pack-public'
    );
  }

  async function loadProofPack() {
    const params = new URLSearchParams(window.location.search);
    const token = (params.get('token') || '').trim();
    const endpointValue = (params.get('endpoint') || '').trim();

    if (!/^[a-f0-9]{64}$/i.test(token)) {
      showError('This ProofPack link is incomplete or invalid.');
      return;
    }

    let endpoint;
    try {
      endpoint = new URL(endpointValue);
      if (!isAllowedEndpoint(endpoint)) {
        throw new Error('The endpoint is not an approved ProofPack service.');
      }
    } catch {
      showError('This ProofPack link does not contain a valid package endpoint.');
      return;
    }

    endpoint.searchParams.set('token', token);

    try {
      const response = await fetch(endpoint.toString(), {
        method: 'GET',
        cache: 'no-store',
        credentials: 'omit',
        headers: { Accept: 'application/json' },
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.error || 'The package could not be loaded.');
      }
      if (typeof payload.html !== 'string' || !payload.html.trim()) {
        throw new Error('The package service returned an invalid document.');
      }

      viewerFrame.srcdoc = payload.html;
      loading.hidden = true;
      errorCard.style.display = 'none';
      viewerShell.style.display = 'block';
      document.title = 'ProofPack';
    } catch (error) {
      showError(error instanceof Error ? error.message : 'The package could not be opened.');
    }
  }

  printButton.addEventListener('click', () => {
    try {
      viewerFrame.contentWindow?.focus();
      viewerFrame.contentWindow?.print();
    } catch {
      window.print();
    }
  });

  loadProofPack();
})();
