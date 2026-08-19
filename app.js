// ===== CONFIGURAÇÃO =====
// AQUI o Admin define quem pode entrar e com qual perfil.
// Formato: nome -> { codigo, perfil }
// Perfis: "Admin", "Lider", "Liderado"
const USUARIOS = {
  "Alexandre Soares": { codigo: "admin123", perfil: "Admin" },
  "Tamires Santana":      { codigo: "lider123", perfil: "Lider" },
  "Vinicius Monteiro":      { codigo: "liderado123", perfil: "Liderado" }
  "Larissa Farias":      { codigo: "liderado123", perfil: "Liderado" }
  "Andrei":      { codigo: "liderado123", perfil: "Liderado" }

};

// ===== URL DO GOOGLE APPS SCRIPT (onde os elogios são salvos) =====
// Troque pela URL do seu Web App (a que termina em /exec)
const API_URL = https://script.google.com/macros/s/AKfycbwGNNShOWdoRZGiB0JwNpmXVHmZMwUoYKVofVxZIpqQir7vOkHGthM9dZdWypbMDHIfqA/exec;

// ===== LOGIN =====
function fazerLogin() {
  const nome = document.getElementById("login-nome").value.trim();
  const codigo = document.getElementById("login-codigo").value.trim();
  const erro = document.getElementById("login-erro");

  const usuario = USUARIOS[nome];

  if (!usuario || usuario.codigo !== codigo) {
    erro.textContent = "Nome ou código incorretos. Tente novamente.";
    return;
  }

  // Guarda quem está logado
  sessionStorage.setItem("usuario", JSON.stringify({ nome, perfil: usuario.perfil }));

  // Mostra o sistema
  document.getElementById("tela-login").classList.add("escondido");
  document.getElementById("sistema").classList.remove("escondido");

  document.getElementById("usuario-nome").textContent = nome;
  document.getElementById("usuario-perfil").textContent = usuario.perfil;

  carregarPessoas();
  carregarElogios();
}

function sair() {
  sessionStorage.removeItem("usuario");
  document.getElementById("sistema").classList.add("escondido");
  document.getElementById("tela-login").classList.remove("escondido");
  document.getElementById("login-nome").value = "";
  document.getElementById("login-codigo").value = "";
  document.getElementById("login-erro").textContent = "";
}

// ===== CARREGAR PESSOAS NO SELECT =====
function carregarPessoas() {
  const select = document.getElementById("e-para");
  select.innerHTML = '<option value="">Selecione a pessoa...</option>';

  const nomes = Object.keys(USUARIOS);
  nomes.forEach(nome => {
    const opt = document.createElement("option");
    opt.value = nome;
    opt.textContent = nome;
    select.appendChild(opt);
  });
}

// ===== ENVIAR ELOGIO =====
document.getElementById("form-elogio").addEventListener("submit", async function (e) {
  e.preventDefault();

  const usuario = JSON.parse(sessionStorage.getItem("usuario"));
  const para = document.getElementById("e-para").value;
  const texto = document.getElementById("e-texto").value.trim();

  if (!para || !texto) {
    alert("Preencha para quem é o elogio e o texto.");
    return;
  }

  const dados = {
    acao: "novo_elogio",
    de: usuario.nome,
    para: para,
    texto: texto,
    data: new Date().toLocaleString("pt-BR")
  };

  try {
    const resposta = await fetch(API_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify(dados)
    });
    alert("Elogio publicado com sucesso! 🌟");
    document.getElementById("e-texto").value = "";
    carregarElogios();
  } catch (erro) {
    alert("Falha de conexão. Detalhe: " + erro);
  }
});

// ===== CARREGAR ELOGIOS =====
async function carregarElogios() {
  const lista = document.getElementById("lista-elogios");
  lista.innerHTML = "<p>Carregando elogios...</p>";

  try {
    const resposta = await fetch(API_URL + "?acao=listar_elogios");
    const dados = await resposta.json();
    lista.innerHTML = "";

    if (!dados || dados.length === 0) {
      lista.innerHTML = "<p>Ainda não há elogios. Seja o primeiro! 🌟</p>";
      return;
    }

    dados.forEach(el => {
      const div = document.createElement("div");
      div.className = "elogio";
      div.innerHTML = `
        <div class="elogio-cabecalho">
          <span>${el.de} → ${el.para}</span>
          <span class="elogio-data">${el.data}</span>
        </div>
        <div class="elogio-texto">${el.texto}</div>
      `;
      lista.appendChild(div);
    });
  } catch (erro) {
    lista.innerHTML = "<p>Não foi possível carregar os elogios.</p>";
  }
}