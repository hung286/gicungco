(function() {
        const url = new URL(window.location.href);
        if (!url.searchParams.has('v')) {
          const now = new Date();
          const pad = n => String(n).padStart(2, '0');
          const timestamp = 
            String(now.getFullYear()).slice(-2) +
            pad(now.getMonth() + 1) +
            pad(now.getDate()) +
            pad(now.getHours()) +
            pad(now.getMinutes()) +
            pad(now.getSeconds());

          url.searchParams.set('v', timestamp);
          window.history.replaceState(null, '', url.toString());
        }
      })();
