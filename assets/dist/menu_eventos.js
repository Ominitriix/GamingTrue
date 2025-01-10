const lista_ajuste = document.querySelector(".ajuste-lista");
const btn_settings = document.getElementById("button_settings");
//
function criarListaURLSalvas() {
  let lista = localStorage.getItem("listaSalva");
  lista_ajuste.innerHTML = "";
  //
  let array = JSON.parse(lista);
  //
  array.forEach((item, index) => {
    //
    const li = document.createElement("li");
    li.textContent = item.name;
    //
    const button = document.createElement("button");
    button.setAttribute("title", "botão de apagar item do menu");
    button.type = "button";
    button.innerHTML = `<i class="fi fi-rr-trash-xmark"></i>`;
    // Evento do butão
    button.addEventListener("click", () => {
      let listaAtualizada = localStorage.getItem("listaSalva");
      //
      let atualizarArray = JSON.parse(listaAtualizada);
      //
      atualizarArray.splice(index, 1);
      console.log(atualizarArray);
      //
      atualizarArray = JSON.stringify(atualizarArray);
      //
      localStorage.setItem("listaSalva", atualizarArray);
      //
      // Atualizar lista Salva no DOM
      criarListaURLSalvas();
    });
    //
    li.appendChild(button);
    lista_ajuste.appendChild(li);
  });
  array = JSON.stringify(array);
  localStorage.setItem("listaSalva", array);
}

btn_settings.addEventListener("click", criarListaURLSalvas);
