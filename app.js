// ===== URL DO GOOGLE APPS SCRIPT =====
const API_URL = https://alexandresoaresinfinity-afk.github.io/feedback-infinity/;

// ===== USUÁRIOS (guardados no navegador) =====
function pegarUsuarios() {
  const dados = localStorage.getItem("usuarios");
  return dados ? JSON.parse(dados) : {};
}

function salvarUsuarios(usuarios) {
  localStorage.setItem("usuarios", JSON.stringify(usuarios));
}

// Cria o Admin padrão na primeira vez (sem precisar do console)
function garantirAdmin() {
  const usuarios = pegarUsuarios();
  if (Object.keys(usuarios).length === 0) {
    usuarios["Alexandre Soares"] = { codigo: "admin123", perfil: "Admin" };
    salvarUsuarios(usuarios);
  }
}

// ===== LOGIN =====
function fazerLogin() {
  const nome = document.getElementById("login-nome").value.trim();
  const codigo = document.getElementById("login-codigo").value.trim();
  const erro = document.getElementById("login-erro");

  const usuarios = pegarUsuarios();
  const usuario = usuarios[nome];

  if (!usuario || usuario.codigo !== codigo) {
    erro.textContent = "Nome ou código incorretos. Tente novamente.";
    return;
  }

  sessionStorage.setItem("usuario", JSON.stringify({ nome, perfil: usuario.perfil }));

  document.getElementById("tela-login").classList.add("escondido");
  document.getElementById("sistema").classList.remove("escondido");

  document.getElementById("usuario-nome").textContent = nome;
  document.getElementById("usuario-perfil").textContent = usuario.perfil;

  if (usuario.perfil === "Admin") {
    document.getElementById("area-cadastro").classList.remove("escondido");
    mostrarUsuarios();
  }

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

// ===== CADASTRO DE USUÁRIOS =====
document.getElementById("form-cadastro").addEventListener("submit", function (e) {
  e.preventDefault();
  const nome = document.getElementById("c-nome").value.trim();
  const codigo = document.getElementById("c-codigo").value.trim();
  const perfil = document.getElementById("c-perfil").value;
  if (!nome || !codigo) { alert("Preencha o nome e o código."); return; }
  const usuarios = pegarUsuarios();
  usuarios[nome] = { codigo, perfil };
  salvarUsuarios(usuarios);
  document.getElementById("c-nome").value = "";
  document.getElementById("c-codigo").value = "";
  alert("Usuário cadastrado! ✅");
  mostrarUsuarios();
  carregarPessoas();
});

function mostrarUsuarios() {
  const lista = document.getElementById("lista-usuarios");
  const usuarios = pegarUsuarios();
  lista.innerHTML = "";
  Object.keys(usuarios).forEach(nome => {
    const div = document.createElement("div");
    div.className = "usuario-item";
    div.innerHTML = `<span class="usuario-nome">${nome}</span><span class="usuario-perfil">${usuarios[nome].perfil}</span>`;
    lista.appendChild(div);
  });
}

function carregarPessoas() {
  const select = document.getElementById("e-para");
  select.innerHTML = '<option value="">Selecione a pessoa...</option>';
  const usuarios = pegarUsuarios();
  Object.keys(usuarios).forEach(nome => {
    const opt = document.createElement("option");
    opt.value = nome;
    opt.textContent = nome;
    select.appendChild(opt);
  });
}

// ===== ELOGIO =====
document.getElementById("form-elogio").addEventListener("submit", async function (e) {
  e.preventDefault();
  const usuario = JSON.parse(sessionStorage.getItem("usuario"));
  const para = document.getElementById("e-para").value;
  const texto = document.getElementById("e-texto").value.trim();
  if (!para || !texto) { alert("Preencha para quem e o texto."); return; }
  const dados = { acao: "novo_elogio", de: usuario.nome, para, texto, data: new Date().toLocaleString("pt-BR") };
  try {
    await fetch(API_URL, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain" }, body: JSON.stringify(dados) });
    alert("Elogio publicado! 🌟");
    document.getElementById("e-texto").value = "";
    carregarElogios();
  } catch (erro) {
    alert("Falha de conexão. Detalhe: " + erro);
  }
});

async function carregarElogios() {
  const lista = document.getElementById("lista-elogios");
  lista.innerHTML = "<p>Carregando elogios...</p>";
  try {
    const resposta = await fetch(API_URL + "?acao=listar_elogios");
    const dados = await resposta.json();
    lista.innerHTML = "";
    if (!dados || dados.length === 0) { lista.innerHTML = "<p>Ainda não há elogios. Seja o primeiro! 🌟</p>"; return; }
    dados.forEach(el => {
      const div = document.createElement("div");
      div.className = "elogio";
      div.innerHTML = `<div class="elogio-cabecalho"><span>${el.de} → ${el.para}</span><span class="elogio-data">${el.data}</span></div><div class="elogio-texto">${el.texto}</div>`;
      lista.appendChild(div);
    });
  } catch (erro) {
    lista.innerHTML = "<p>Não foi possível carregar os elogios.</p>";
  }
}

// ===== INICIO =====
garantirAdmin();