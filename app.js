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

// Cria o Admin padrão na primeira vez
function garantirAdmin() {
  const usuarios = pegarUsuarios();
  if (Object.keys(usuarios).length === 0) {
    usuarios["Alexandre Soares"] = { codigo: "admin123", perfil: "Admin" };
    salvarUsuarios(usuarios);
  }
}

// ===== NAVEGAÇÃO ENTRE ABAS =====
function mostrarAba(idAba, botao) {
  // Esconde todas as abas
  document.querySelectorAll(".aba").forEach(aba => aba.classList.add("escondido"));
  // Mostra a aba escolhida
  document.getElementById(idAba).classList.remove("escondido");
  // Marca o botão do menu como ativo
  document.querySelectorAll(".menu-item").forEach(item => item.classList.remove("ativo"));
  if (botao) botao.classList.add("ativo");
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

  // Só o Admin vê a aba de cadastro
  const abaCadastro = document.getElementById("aba-cadastro");
  const botaoCadastro = document.querySelector('.menu-item[onclick*="aba-cadastro"]');
  if (usuario.perfil === "Admin") {
    abaCadastro.classList.remove("escondido");
    botaoCadastro.style.display = "block";
    mostrarUsuarios();
  } else {
    abaCadastro.classList.add("escondido");
    botaoCadastro.style.display = "none";
  }

  // Mostra a primeira aba (Feedbacks)
  mostrarAba("aba-feedbacks", document.querySelector('.menu-item[onclick*="aba-feedbacks"]'));

  carregarPessoas();
  carregarElogios();
  carregarFeedbacks();
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

// ===== CARREGAR PESSOAS NOS SELECTS =====
function carregarPessoas() {
  const usuarios = pegarUsuarios();
  const nomes = Object.keys(usuarios);

  // Select de feedback
  const selF = document.getElementById("f-para");
  selF.innerHTML = '<option value="">Selecione a pessoa...</option>';
  nomes.forEach(nome => {
    const opt = document.createElement("option");
    opt.value = nome;
    opt.textContent = nome;
    selF.appendChild(opt);
  });

  // Select de elogio
  const selE = document.getElementById("e-para");
  selE.innerHTML = '<option value="">Selecione a pessoa...</option>';
  nomes.forEach(nome => {
    const opt = document.createElement("option");
    opt.value = nome;
    opt.textContent = nome;
    selE.appendChild(opt);
  });
}

// ===== ENVIAR FEEDBACK =====
document.getElementById("form-feedback").addEventListener("submit", async function (e) {
  e.preventDefault();
  const usuario = JSON.parse(sessionStorage.getItem("usuario"));
  const para = document.getElementById("f-para").value;
  const bom = document.getElementById("f-bom").value.trim();
  const melhorar = document.getElementById("f-melhorar").value.trim();
  if (!para || !bom) { alert("Preencha para quem e o que foi bom."); return; }
  const dados = { acao: "novo_feedback", de: usuario.nome, para, bom, melhorar, data: new Date().toLocaleString("pt-BR") };
  try {
    await fetch(API_URL, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain" }, body: JSON.stringify(dados) });
    alert("Feedback enviado! ✅");
    document.getElementById("f-bom").value = "";
    document.getElementById("f-melhorar").value = "";
    carregarFeedbacks();
  } catch (erro) {
    alert("Falha de conexão. Detalhe: " + erro);
  }
});

// ===== CARREGAR FEEDBACKS =====
async function carregarFeedbacks() {
  const lista = document.getElementById("lista-feedbacks");
  lista.innerHTML = "<p>Carregando feedbacks...</p>";
  try {
    const resposta = await fetch(API_URL + "?acao=listar_feedbacks");
    const dados = await resposta.json();
    lista.innerHTML = "";
    if (!dados || dados.length === 0) { lista.innerHTML = "<p>Ainda não há feedbacks.</p>"; return; }
    dados.forEach(fb => {
      const div = document.createElement("div");
      div.className = "feedback-item";
      div.innerHTML = `
        <div class="feedback-cabecalho">
          <span>${fb.de} → ${fb.para}</span>
          <span class="feedback-data">${fb.data}</span>
        </div>
        <div class="feedback-texto"><strong>Bom:</strong> ${fb.bom}</div>
        ${fb.melhorar ? `<div class="feedback-texto"><strong>Melhorar:</strong> ${fb.melhorar}</div>` : ""}
      `;
      lista.appendChild(div);
    });
  } catch (erro) {
    lista.innerHTML = "<p>Não foi possível carregar os feedbacks.</p>";
  }
}

// ===== ENVIAR ELOGIO =====
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

// ===== CARREGAR ELOGIOS =====
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