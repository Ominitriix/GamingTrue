"mode strict";

/* Mapeamento de script

*! Script usado para separar dar parte principal 

* adicionarItemMenu() usado para apagar informações do localstorage
** popover event usado para identificar o popover especifico quando aberto

*/

const lista_ajuste = document.querySelector(".ajuste-lista");
const popover = document.getElementById("popover_settings");
//
// cria uma lista quando o popover for aberto
function adicionarItemMenu() {
  // converte objeto salvo
  let lista = localStorage.getItem("listaSalva");
  lista = JSON.parse(lista);
  //
  lista_ajuste.innerHTML = "";
  //
  // carrega todos os objetos
  lista.forEach((item, index) => {
    //
    const li = document.createElement("li");
    li.textContent = item.name;
    //
    const button = document.createElement("button");
    button.setAttribute("title", "botão de apagar item do menu");
    button.type = "button";
    button.innerHTML = `<i class="fi fi-rr-trash-xmark"></i>`;
    // Faz um evento de eliminar informações salvas
    button.addEventListener("click", () => {
      //
      // Ao ser criado retorna informações do objeto salvo
      let lista = localStorage.getItem("listaSalva");
      let listaNova = JSON.parse(lista);
      //
      listaNova.splice(index, 1);
      //
      localStorage.setItem("listaSalva", JSON.stringify(listaNova));
      //
      // Atualiza Itens do Menu
      adicionarItemMenu();
      //
    });
    //
    li.appendChild(button);
    lista_ajuste.appendChild(li);
  });
  lista = JSON.stringify(lista);
  localStorage.setItem("listaSalva", lista);
}

popover.addEventListener("beforetoggle", (event) => {
  if (event.newState === "open") {
    adicionarItemMenu();
  } else {
    window.location.reload();
  }
});
