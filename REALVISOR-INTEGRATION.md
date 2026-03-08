# Realvisor API Integrace - nemorenta.cz

## Přehled
Projekt nemorenta.cz je připraven pro integraci s Realvisor API pomocí Vercel serverless funkce.

## Vercel Serverless API

### Soubor: `/api/submit-lead.js`
- ✅ Vytvořeno
- Endpoint: `/api/submit-lead`
- Metoda: POST
- Bezpečně volá Realvisor API s API klíčem ze serveru

## Environment Variables pro Vercel

V Vercel Dashboard → Settings → Environment Variables přidej:

```
Name:  REALVISOR_API_KEY
Value: [API klíč od Realvisoru]
Scope: Production, Preview, Development
```

## Integrace formuláře

Až dostaneš kód formuláře od Realvisoru, proveď následující:

### 1. Najdi formulář v `index.html`
Hledej sekci s `id="formular"` nebo kontaktní formulář

### 2. Uprav JavaScript pro odeslání
Formulář by měl volat `/api/submit-lead` místo přímého Realvisor API:

```javascript
// Konfigurace
const REALVISOR_CONFIG = {
    apiUrl: '/api/submit-lead',
};

// Odeslání formuláře
async function handleFormSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;

    // Collect form data
    const formData = {
        name: form.name.value,
        phone: form.phone.value,
        email: form.email.value || undefined,
        // ... další pole podle formuláře
    };

    // Split name into firstName and lastName
    const nameParts = formData.name.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || undefined;

    // Prepare payload for Realvisor API
    const payload = {
        firstName: firstName,
        lastName: lastName,
        phone: formData.phone,
        email: formData.email,
        message: formData.note,
        data: {
            source: 'nemorenta.cz',
            pageUrl: window.location.href,
            referrer: document.referrer,
            timestamp: new Date().toISOString(),
        },
    };

    btn.innerHTML = 'Odesílám...';
    btn.disabled = true;

    try {
        const response = await fetch(REALVISOR_CONFIG.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Chyba při odesílání');
        }

        const result = await response.json();
        console.log('Form submitted successfully:', result);

        // Success state
        btn.innerHTML = 'Odesláno! Ozveme se vám.';
        btn.style.background = '#22c55e';

        setTimeout(() => {
            form.reset();
            btn.innerHTML = originalText;
            btn.disabled = false;
            btn.style.background = '';
        }, 4000);

    } catch (error) {
        console.error('Form submission error:', error);

        // Error state
        btn.innerHTML = 'Chyba při odesílání. Zkuste znovu.';
        btn.style.background = '#ef4444';

        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.disabled = false;
            btn.style.background = '';
        }, 3000);
    }
}
```

## Barevné schéma nemorenta.cz
- **Hlavní modrá**: `#2D5A87`
- **Hover modrá**: `#1a3d61`
- **Tmavá**: `#0f1d35`
- **Text**: `#333333`
- **Text light**: `#666666`

## Deployment checklist

- [ ] Nastavit `REALVISOR_API_KEY` v Vercel
- [ ] Pushnout změny do GitHubu
- [ ] Vercel automaticky redeploy
- [ ] Otestovat formulář na produkci
- [ ] Zkontrolovat, že leady přicházejí do Realvisoru

## Blog integrace
✅ Blog je připraven a stylován na nemorenta.cz design
- `/blog/index.html` - seznam článků
- `/blog/detail.html` - detail článku
- `/blog/posts.json` - prázdný, připraven na články
