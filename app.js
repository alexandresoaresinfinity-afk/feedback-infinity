// ============================================
// Infinity Piercing — Sistema de Feedback
// Frontend (GitHub Pages) → API (Apps Script)
// ============================================

// 👉 URL da API (Web App do Google Sheets)
const API_URL = 'https://script.google.com/macros/s/AKfycbwGNNShOWdoRZGiB0JwNpmXVHmZMwUoYKVofVxZIpqQir7vOkHGthM9dZdWypbMDHIfqA/exec';

// ---------- Conexão com a API ----------

async function apiGet(action) {
  const res = await fetch(API_URL + '?action=' + action);
  return res.json();
}

async function apiPost(action, data) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action: action, data: data })
  });
  return res.json();
}

// ---------- Envio do formulário ----------

document.getElementById('form-feedback')
  .addEventListener('submit', async function (evento) {
    evento.preventDefault();

    const feedback = {
      de: document.getElementById('f-de').value.trim(),
      para: document.getElementById('f-para').value.trim(),
      tipo: 'contínuo',
      competencia: document.getElementById('f-competencia').value,
      o_que_foi_bom: document.getElementById('f-bom').value.trim(),
      o_que_melhorar: document.getElementById('f-melhorar').value.trim(),
      sugestao: document.getElementById('f-sugestao').value.trim(),
      data: new Date().toISOString()
    };

    try {
      const resultado = await apiPost('addFeedback', feedback);
      if (resultado.ok) {
        alert('Feedback enviado com sucesso! 🎉');
        document.getElementById('form-feedback').reset();
        carregarFeed();
      } else {
        alert('Erro da API: ' + resultado.error);
      }
    } catch (erro) {
      alert('Falha de conexão. Detalhe: ' + erro);
    }
  });

// ---------- Exibir o feed ----------

async function carregarFeed() {
  const dados = await apiGet('getFeedbacks');
  const feed = document.getElementById('feed');

  if (!dados.ok || !dados.data || dados.data.length === 0) {
    feed.innerHTML = '<p>Nenhum feedback registrado ainda.</p>';
    return;
  }

  feed.innerHTML = dados.data
    .slice()
    .reverse()
    .map(item => `
      <div class="feedback-item">
        <strong>${item.de}</strong> → <strong>${item.para}</strong>
        <span class="data"> · ${formatarData(item.data)}</span>
        <p>🏅 ${item.competencia}</p>
        <p>✅ ${item.o_que_foi_bom}</p>
        ${item.o_que_melhorar ? '<p>🔧 ' + item.o_que_melhorar + '</p>' : ''}
        ${item.sugestao ? '<p>💡 ' + item.sugestao + '</p>' : ''}
      </div>
    `)
    .join('');
}

function formatarData(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR') + ' ' +
         d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

// Carrega o feed ao abrir a página
carregarFeed();