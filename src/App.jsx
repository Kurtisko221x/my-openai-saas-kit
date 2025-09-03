// frontend/src/App.jsx
import React, { useState, useEffect } from 'react';
import './App.css'; // Môžeš upraviť alebo použiť napr. Tailwind CSS

function App() {
  const [prompt, setPrompt] = useState('');
  const [generatedText, setGeneratedText] = useState('');
  const [history, setHistory] = useState([]);
  const [user, setUser] = useState(null); // Pre informácie o prihlásenom užívateľovi

  // Funkcia na overenie prihlásenia (použije Aswa)
  useEffect(() => {
    async function fetchUser() {
      const response = await fetch('/.auth/me'); // Aswa endpoint
      const data = await response.json();
      if (data && data.clientPrincipal) {
        setUser(data.clientPrincipal);
      }
    }
    fetchUser();
  }, []);

  const handleGenerate = async () => {
    if (!user) {
      alert('Prosím, prihláste sa pre generovanie obsahu.');
      return;
    }
    setGeneratedText('Generujem...');
    try {
      // TODO: Neskôr tu bude volanie na našu Azure Function
      const response = await fetch('/api/generate', { // Endpoint na našu Azure Function
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });
      const data = await response.json();
      setGeneratedText(data.text || 'Chyba pri generovaní.');
      // TODO: Neskôr aktualizovať históriu
      setHistory(prev => [{ prompt, generatedText: data.text, timestamp: new Date().toLocaleString() }, ...prev]);
    } catch (error) {
      console.error('Chyba pri generovaní:', error);
      setGeneratedText('Nastala chyba pri generovaní.');
    }
  };

  // TODO: Neskôr funkcia na načítanie histórie z backendu
  const fetchHistory = async () => {
    if (!user) return;
    try {
      const response = await fetch('/api/history');
      const data = await response.json();
      setHistory(data);
    } catch (error) {
      console.error('Chyba pri načítaní histórie:', error);
    }
  };

  // Načítanie histórie pri prihlásení
  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user]);


  return (
    <div className="container">
      <header className="header">
        <h1>AI Génius</h1>
        {user ? (
          <div>
            <span>Vitaj, {user.userDetails}!</span>{' '}
            <a href="/.auth/logout">Odhlásiť sa</a>
          </div>
        ) : (
          <div>
            <a href="/.auth/login/github">Prihlásiť sa s GitHub</a> {/* Príklad pre GitHub */}
            <a href="/.auth/login/google">Prihlásiť sa s Google</a> {/* Príklad pre Google */}
          </div>
        )}
      </header>

      <main className="main-content">
        <section className="generator-section">
          <h2>Generátor nápadov</h2>
          <textarea
            className="prompt-input"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Popíšte, čo by ste chceli generovať (napr. '5 nápadov na SaaS pre malé firmy')..."
            rows="5"
          ></textarea>
          <button className="generate-button" onClick={handleGenerate} disabled={!user}>
            Generovať
          </button>
          {generatedText && (
            <div className="output-box">
              <h3>Výsledok:</h3>
              <p>{generatedText}</p>
            </div>
          )}
        </section>

        <section className="history-section">
          <h2>Moja História</h2>
          {history.length === 0 ? (
            <p>Zatiaľ žiadne generácie.</p>
          ) : (
            <div className="history-list">
              {history.map((item, index) => (
                <div key={index} className="history-item">
                  <p><strong>Prompt:</strong> {item.prompt}</p>
                  <p><strong>Výsledok:</strong> {item.generatedText}</p>
                  <small>{item.timestamp}</small>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;