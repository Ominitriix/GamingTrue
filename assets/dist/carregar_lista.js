"mode strict";

// Todas as chamadas de seletores
const countPaginacao = document.getElementById("paginacao_count");
const container = document.querySelector(".lista-itens-carregados");
const btn_voltar = document.getElementById("button_voltar");
const btn_proximo = document.getElementById("button_proximo");
const btn_atualizar = document.getElementById("button_atualizar");
const btn_search = document.getElementById("button_search");

// Confere se existe dados salvos, senão cria um array vazio
let listaSalva = localStorage.getItem("listaSalva") || JSON.stringify([]);
console.log(listaSalva);

// let listaSalva = localStorage.clear();
// Verifica se tem dados salvos
verificarListaSalva();
// URL modelo para criar botão de atalho em lista salvas
let url = "";

//Array primaria
let dadosLista;
// Array secundaria para retornar ao valor inicial depois de uma pesquisa
let dadosListaSecundary = "";

// Contador de paginas
let firstPage;
let lastPage;

// divisao de paginas, 16 item em cada
let start;
let end;

// Função para carregar url
async function adicionarUrl() {
  const inputValueUrl = document.getElementById("url_list").value;
  const btn_add = document.getElementById("button_add_list");
  // Evitando muitas repetições
  btn_add.disabled = true;
  //
  // Limpa e adicionar os proximos itens
  container.innerHTML = "";
  //
  if (inputValueUrl === "" || !inputValueUrl.includes(".json")) {
    alert("Campo invalido!");
    btn_add.disabled = false;
    return;
  }
  // Salva a url para usos futuros
  url = inputValueUrl;
  // Carrega todas as informações no DOM
  await carregarUrl(inputValueUrl);
  // Salva informações para criar atalho
  verificarListaSalvaJSON();
  //
  btn_add.disabled = false;
}

// Faz um promise e retorna informações para criação dos itens no DOM
async function carregarUrl(url) {
  const tela_sem_lista = document.getElementById("sem_lista");
  const animacao_carregamento = document.getElementById("carregamento_lista");
  const painel = document.querySelector(".painel-controle");

  // Atribui os valores iniciais toda vez que carrega
  // para que não haja falha ao add uma nova URL ou até a mesma
  firstPage = 1;
  start = 0;
  end = 16;

  try {
    // Animação
    container.style.display = "none";
    animacao_carregamento.classList.add("loadingON");
    tela_sem_lista.classList.add("remove-text");
    //
    let response = await fetch(url);
    let lista = await response.json();
    //
    // bloqueia o carregamento se houver falha na solicitação
    if (!response.ok) {
      throw new Error("Dados invalidos");
    }
    // Atribui o valor primario para que o painel e outras funções funcione bem
    dadosLista = lista;
    //
    // chama função para criar os itens no DOM
    criarLista(dadosLista);
    //
    // Animação
    container.style.display = "flex";
    painel.classList.add("painel-visible");
    btn_search.classList.add("showButton");
    //
  } catch (e) {
    //
    // Animações
    tela_sem_lista.classList.remove("remove-text");
    //
    animacao_carregamento.classList.remove("loadingON");
    //
    painel.classList.remove("painel-visible");
    //
    btn_search.classList.remove("showButton");
    //
    console.log("Error encontrado", e);
  } finally {
    // Animações
    //
    animacao_carregamento.classList.remove("loadingON");
    //
  }
}

// Carrega dados da url e cria os itens do DOM
function criarLista(data) {
  //
  const namePackTitle = document.getElementById("name_pack");
  // Atribuindo nome do pack a barra de navegação
  namePackTitle.textContent = dadosLista.name;
  //
  // Organizando lista
  let organizacaoArray = data.downloads.slice(start, end);

  // Limpa e depois adicionar os proximos itens
  container.innerHTML = "";
  // > depois
  organizacaoArray.forEach((item) => {
    //
    const div = document.createElement("figure");
    div.setAttribute("class", "item");
    //
    div.addEventListener("click", () => {
      window.location.href = item.uris;
    });
    //
    const separador = document.createElement("div");
    //
    const titulo = document.createElement("h3");
    titulo.setAttribute("title", item.title);
    titulo.innerHTML = item.title;
    //
    const descricao = document.createElement("p");
    descricao.innerHTML = item.fileSize;
    //
    const data = document.createElement("p");
    let text = item.uploadDate;
    text = text.replaceAll("-", "/");
    text = text.replaceAll("T", " ");
    text = text.replaceAll("Z", "");
    text = text.replaceAll(".000", "");
    data.innerHTML = text;
    //
    div.appendChild(titulo);
    separador.appendChild(descricao);
    separador.appendChild(data);
    div.appendChild(separador);
    container.appendChild(div);
  });
  // Informação do painel
  lastPage = Math.round(data.downloads.length / 16);
  //
  if (lastPage === 0) lastPage = 1;
  //
  countPaginacao.innerHTML = `${firstPage} / ${lastPage} de ${data.downloads.length}`;
}

// Botao de voltar pagina
btn_voltar.addEventListener("click", () => {
  //
  let verificaExistenciaValor = dadosListaSecundary || dadosLista;
  //
  if (start !== 0) {
    start -= 16;
    end -= 16;
    --firstPage;

    criarLista(verificaExistenciaValor);
  }
});

// Botao de avançar pagina
btn_proximo.addEventListener("click", () => {
  //
  let verificaExistenciaValor = dadosListaSecundary || dadosLista;
  //
  if (firstPage < lastPage) {
    start += 16;
    end += 16;
    ++firstPage;

    criarLista(verificaExistenciaValor);
  }
});

// Botao de atualizar pagina
btn_atualizar.addEventListener("click", () => {
  dadosListaSecundary = "";

  // Atribui os valores iniciais toda vez que carrega
  // para que não haja falha ao add uma nova URL ou até a mesma
  firstPage = 1;
  start = 0;
  end = 16;

  criarLista(dadosLista);
});

// Faz uma busca entre todos os itens
function buscarItens() {
  const value = document.getElementById("search_list").value;

  // Atribui os valores iniciais toda vez que carrega
  // para que não haja falha ao add uma nova URL ou até a mesma
  firstPage = 1;
  start = 0;
  end = 16;

  // Por problemas, a atribuição sera dentro da função
  dadosListaSecundary = {
    downloads: [],
  };

  // pesquisa e salva os valores dentro da lista secundaria
  dadosLista.downloads.filter((nameItem) => {
    if (nameItem.title.toLowerCase().includes(value.toLowerCase())) {
      dadosListaSecundary.downloads.push(nameItem);
    }
  });

  // chama a função para atualizar a lista com novos itens da lista secundaria
  criarLista(dadosListaSecundary);
}

// Função que verifica os valores e salva um novo objeto se inexistente.
// Torna o objeto pronto para leitura e assim cria e carrega um elemento no menu.
function verificarListaSalvaJSON() {
  //
  listaSalva = JSON.parse(listaSalva);
  salvarDadosLista();
  listaSalva = JSON.stringify(listaSalva);
  localStorage.setItem("listaSalva", listaSalva);
  //
}

// Faz uma verificação no nome do pack e cria uma id, assim cria um objeto para ser salvo
function salvarDadosLista() {
  // ListaSalva é a lista onde toda informação de salvamento vai esta
  //
  let namePackDefault = dadosLista.name;
  // Cria um count para as id ao criar um item
  let i = listaSalva.length + 1;
  // Listando nomes iguais e depois adicionando um count a cada item igual
  let listaNomes = [];
  //
  // Separa todos os nomes iguais e salva em uma array
  listaSalva.filter((namePack) => {
    if (namePack.name.toLowerCase().includes(namePackDefault.toLowerCase())) {
      listaNomes.push(namePackDefault);
    }
  });
  //
  // Pega o primeiro resultado que retorna TRUE e adiciona um contador ao seu nome
  if (listaNomes.includes(namePackDefault)) {
    //
    let countNames = listaNomes.length + 1;
    namePackDefault += " " + countNames;
    //
    listaSalva.push({
      id: i,
      name: namePackDefault,
      url: url,
    });
  } else {
    //
    listaSalva.push({
      id: i,
      name: namePackDefault,
      url: url,
    });
  }

  // Chama a função de adicionar ao menu lateral
  criarItemMenu();
}

// Aqui vai adicionar todos os itens que tiverem em listaSalva
function criarItemMenu() {
  //
  const menu_container = document.querySelector(".menu-lista-salvamento");
  //
  menu_container.innerHTML = "";
  //
  listaSalva.forEach((item) => {
    //
    ///gera uma cor aleatoria
    let corAleatoria = gerarCorAleatoria();
    //
    const li = document.createElement("li");
    li.setAttribute("class", "item-lista");
    //
    const button = document.createElement("button");
    button.textContent = item.name;
    //
    setInterval(() => {
      let arcoiris = gerarCorAleatoria();
      button.style.color = arcoiris;
      span.style.color = arcoiris;
    }, 600);
    //
    button.addEventListener("click", () => {
      container.innerHTML = "";
      carregarUrl(item.url);
    });
    //
    const span = document.createElement("span");
    span.textContent = item.name.slice(0, 2);
    span.style.color = corAleatoria;
    //
    button.appendChild(span);
    li.appendChild(button);
    menu_container.appendChild(li);
  });
}

// Atualiza menu com os itens salvos
function verificarListaSalva() {
  if (listaSalva != "[]") {
    //
    listaSalva = JSON.parse(listaSalva);
    criarItemMenu();
    listaSalva = JSON.stringify(listaSalva);
    //
    return;
  }
  console.log("Não há item salvo");
}

function gerarCorAleatoria() {
  // Gera um número hexadecimal aleatório entre 0x000000 e 0xFFFFFF
  let corHex = Math.floor(Math.random() * 0xffffff).toString(16);

  // Garante que a cor sempre tenha 6 dígitos (adiciona zeros à esquerda, se necessário)
  return `#${corHex.padStart(6, "0")}`;
}
