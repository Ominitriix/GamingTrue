"mode strict";

/* Mapeamento do script

* verificarListaSalva(funciton) Atalho para criação de dado e leitura do localstorage.
---------------------------------------------------------------------------------------------------
* adicionarURL() faz um assicrono até a estrutura ser contruida, aguarda até completar;
** carregarURL() faz uma requisição usando fetch para que retorne um Json e controla animações;
*** criarLista() nessa parte faz uma interação no objeto retornado no FETCH e criar itens no DOM.
---------------------------------------------------------------------------------------------------
*! Instanciei 2 objetos, o primeiro representa o que irá armazenar o objeto retornado no fetch. 
  O segundo vai conter uma replica do objeto primário. porém apenas com dados feitos de uma
  busca feita pela função buscarItens.

* butões de controle de paginação, todos os dois confere qual objeto esta sendo usado.
* botão de atualizar, retorna ao objeto primário e sua posição em paginas
---------------------------------------------------------------------------------------------------
* buscarItens() atribui ao objeto secundario a replica com o itens desejados
---------------------------------------------------------------------------------------------------
* salvarDadosLista() recebe informações do objeto primario como o nome e url para usar como um 
  atalho para usos posteriores.
** criarItemMenu() faz a leitura de objetos salvos no localstorage e adciona ao menu lateral.
---------------------------------------------------------------------------------------------------
* GerarCorAleatória() apenas um detalhe para se destrair

*/

// Confere se o navegador tem suporte ao Localstorage
function storageAvailable(type) {
  try {
    var storage = window[type],
      x = "__storage_test__";
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch (e) {
    return (
      e instanceof DOMException &&
      // everything except Firefox
      (e.code === 22 ||
        // Firefox
        e.code === 1014 ||
        // test name field too, because code might not be present
        // everything except Firefox
        e.name === "QuotaExceededError" ||
        // Firefox
        e.name === "NS_ERROR_DOM_QUOTA_REACHED") &&
      // acknowledge QuotaExceededError only if there's something already stored
      storage.length !== 0
    );
  }
}

if (!storageAvailable("localStorage")) {
  document.body.style.display = "none";
  throw new Error("Seu navegador não tem suporte ao site.");
}


// Todas as chamadas de seletores
const countPaginacao = document.getElementById("paginacao_count");
const container = document.querySelector(".lista-itens-carregados");
const btn_voltar = document.getElementById("button_voltar");
const btn_proximo = document.getElementById("button_proximo");
const btn_atualizar = document.getElementById("button_atualizar");
const btn_adicionar = document.getElementById("button_add_list");
const btn_menu_search = document.getElementById("button_menu_search");
const btn_search = document.getElementById("button_search");

// let listaSalva = localStorage.clear();
// Confere se existe dados salvos, senão cria um array vazio
let listaSalva = localStorage.getItem("listaSalva") || JSON.stringify([]);

// URL modelo para criar botão de atalho em lista salvas
let url = "";

//Array primaria
let dadosLista;
// Array secundaria para retornar ao valor inicial depois de uma pesquisa
let dadosListaSecundary = "";

// Contador de paginas
let firstPage;
let lastPage;

// divisao de paginas, 16 item em cada. Começa em 0 / 16
let start;
let end;

// Verifica se tem dados salvos
adicionarItemSalvoMenu();

// Adiciona ao menu os itens salvos
function adicionarItemSalvoMenu() {
  if (listaSalva !== "[]") {
    //
    listaSalva = JSON.parse(listaSalva);
    criarItemMenu();
    listaSalva = JSON.stringify(listaSalva);
    //
    return;
  }
  console.log("Não há item salvo");
}

function salvarListaJson() {
  //
  listaSalva = JSON.parse(listaSalva);
  //
  salvarDadosLista();
  //
  listaSalva = JSON.stringify(listaSalva);
  //
  localStorage.setItem("listaSalva", listaSalva);
}

// Função para carregar url
async function adicionarURL() {
  const inputValueUrl = document.getElementById("url_list").value;

  // Evitando muitas repetições
  btn_adicionar.disabled = true;

  // Limpa e adicionar os proximos itens
  container.innerHTML = "";

  //
  if (!inputValueUrl || !inputValueUrl.includes(".json")) {
    alert("Campo invalido!");
    btn_adicionar.disabled = false;
    return;
  }

  // Salva a url para usos futuros
  url = inputValueUrl;

  // Carrega todas as informações no DOM
  await carregarURL(inputValueUrl);

  // Salva informações para criar atalho
  salvarListaJson();
  //
  btn_adicionar.disabled = false;
}

btn_adicionar.addEventListener("click", adicionarURL);

// Faz um promise e retorna informações para criação dos itens no DOM
async function carregarURL(url) {
  const tela_sem_lista = document.getElementById("sem_lista");
  const animacao_carregamento = document.getElementById("carregamento_lista");
  const painel = document.querySelector(".painel-controle");
  const visibilidade = {
    show: "flex",
    hide: "none",
  };

  // Atribui os valores iniciais toda vez que carrega
  // para que não haja falha ao add uma nova URL ou até a mesma
  firstPage = 1;
  start = 0;
  end = 16;

  try {
    // Animação
    container.style.display = visibilidade.hide;
    animacao_carregamento.style.display = "grid";
    tela_sem_lista.style.display = visibilidade.hide;
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
    container.style.display = visibilidade.show;
    painel.style.display = visibilidade.show;
    btn_menu_search.style.display = visibilidade.show;
    //
  } catch (e) {
    //
    // Animações
    tela_sem_lista.style.display = "grid";
    //
    animacao_carregamento.style.display = visibilidade.hide;
    //
    painel.style.display = visibilidade.hide;
    //
    btn_menu_search.style.display = visibilidade.hide;
    //
    console.log("Error encontrado", e);
  } finally {
    // Animações
    //
    animacao_carregamento.style.display = visibilidade.hide;
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
  if (lastPage === 0) {
    lastPage = 1;
  }
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

// Faz uma busca dos itens
btn_search.addEventListener("click", buscarItens);

// Faz uma verificação no nome do pack e cria uma id, assim cria um objeto para ser salvo
function salvarDadosLista() {
  //
  // ListaSalva é a lista onde toda informação de salvamento vai esta
  let namePackDefault = dadosLista.name;
  //
  // Listando nomes iguais e depois adicionando um count a cada item igual
  let listaNomesRepetidos = [];
  //
  // Separa todos os nomes iguais e salva em uma array
  listaSalva.filter((namePack) => {
    if (namePack.name.toLowerCase().includes(namePackDefault.toLowerCase())) {
      listaNomesRepetidos.push(namePackDefault);
    }
  });
  //
  // Pega o primeiro resultado que retorna TRUE e adiciona um contador ao seu nome
  if (listaNomesRepetidos.length !== 0) {
    //
    let countNames = listaNomesRepetidos.length + 1;
    namePackDefault += " " + countNames;
    //
    listaSalva.push({
      name: namePackDefault,
      url: url,
    });
  } else {
    //
    listaSalva.push({
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
    }, 1000);
    //
    button.addEventListener("click", () => {
      container.innerHTML = "";
      carregarURL(item.url);
    });
    //
    const span = document.createElement("span");
    span.textContent = item.name.slice(0, 2);
    //
    button.appendChild(span);
    li.appendChild(button);
    menu_container.appendChild(li);
  });
}

function gerarCorAleatoria() {
  // Gera um número hexadecimal aleatório entre 0x000000 e 0xFFFFFF
  let corHex = Math.floor(Math.random() * 0xffffff).toString(16);

  // Garante que a cor sempre tenha 6 dígitos (adiciona zeros à esquerda, se necessário)
  return `#${corHex.padStart(6, "0")}`;
}
