//abre o uma requisição pro banco de dados
let db;
const request = indexedDB.open("ProdutosDB", 3);

let editando = false;
let idEdit = null;

request.onupgradeneeded = (event) => {
  db = event.target.result;

  if (!db.objectStoreNames.contains("produtos")) {
    const objectStore = db.createObjectStore("produtos", {
      keyPath: "id",
      autoIncrement: "true",
    });

    objectStore.createIndex("nome", "nome", { unique: true });
    objectStore.createIndex("preco", "preco", { unique: false });
    objectStore.createIndex("categoria", "categoria", { unique: false });
  }
  console.log("Banco atualizado com sucesso");
};

request.onerror = (event) => {
  console.error("Erro no banco" + event.target.error?.message);
};

request.onsuccess = (event) => {
  db = event.target.result;
  console.log("Banco conectado com sucesso");
  AtualizarTabela();
};

function SalvarProduto() {
  const msg = document.querySelector(".msg");
  msg.innerHTML = "";

  const nomeValor = document.querySelector("#nome-produto").value.trim();
  const precoValor = document.querySelector("#preco-produto").value;
  const categoriaValor = document.querySelector("#categoria").value;

  if (!nomeValor || !precoValor || !categoriaValor) {
    console.log("Campos vazios");
    msg.innerHTML = "Campo vazio preencha todos os campos!";
    return;
  }

  const transacao = db.transaction("produtos", "readwrite");
  const store = transacao.objectStore("produtos");

  if (!editando) {
    const novoProduto = {
      nome: nomeValor,
      preco: Number(precoValor),
      categoria: categoriaValor,
    };

    store.add(novoProduto);

    transacao.oncomplete = () => {
      console.log("Produto adicionado:", novoProduto);
      msg.innerHTML = "Produto adicionado!";
      AtualizarTabela();
      const form = document.querySelector("form");
      form.reset();
    };

    transacao.onerror = () => {
      console.error("Erro ao adicionar produto");
      msg.innerHTML = "Erro ao adicionar produto!";
    };
  } else {
    const index = store.index("nome");
    const request = index.get(nomeValor);

    request.onsuccess = () => {
      const produto = request.result;

      EditarProdutoBanco(idEdit, nomeValor, precoValor, categoriaValor, msg);
    };
  }
}

function EditarProduto(id) {
  editando = true;
  idEdit = id;
  const nomeInput = document.querySelector("#nome-produto");
  const precoInput = document.querySelector("#preco-produto");
  const categoriaInput = document.querySelector("#categoria");

  const transacao = db.transaction("produtos", "readwrite");
  const store = transacao.objectStore("produtos");
  const request = store.get(id);
  request.onerror = (event) => {
    console.error("Erro ao recuperar produto" + event.target.error?.message);
  };
  request.onsuccess = (event) => {
    const produto = event.target.result;

    nomeInput.value = produto.nome;
    precoInput.value = produto.preco;
    categoriaInput.value = produto.categoria;
  };
}

function EditarProdutoBanco(id, nome, preco, categoria, msg) {
  const transacao = db.transaction("produtos", "readwrite");
  const store = transacao.objectStore("produtos");
  const request = store.get(id);

  request.onerror = (event) => {
    console.error("Erro ao recuperar produto" + event.target.error?.message);
  };
  request.onsuccess = (event) => {
    const produto = event.target.result;

    produto.nome = nome;
    produto.preco = preco;
    produto.categoria = categoria;

    const requestUpdate = store.put(produto);

    requestUpdate.onerror = (event) => {
      console.error("Erro ao atualizar produto" + event.target.error?.message);
      msg.innerHTML = "Erro ao Atualizar!";
    };

    requestUpdate.onsuccess = () => {
      console.log("Produto atualizado:", produto);
      msg.innerHTML = "Produto Atualizado!";
    };
  };

  transacao.oncomplete = () => {
    AtualizarTabela();
    editando = false;
    const form = document.querySelector("form");
    form.reset();
  };
}

function DeletarProduto(id) {
  const transacao = db.transaction("produtos", "readwrite");
  const store = transacao.objectStore("produtos");
  const request = store.delete(id);

  request.onerror = (event) => {
    console.error("Erro ao recuperar produto" + event.target.error?.message);
  };
  request.onsuccess = () => {
    console.log("Deletado");
  };
  AtualizarTabela();
}

function DeletarDB() {
  const request = indexedDB.deleteDatabase("ProdutosDB");

  request.onsuccess = () => {
    console.log("Banco deletado com sucesso!");
    location.reload();
  };

  request.onerror = (event) => {
    console.error("Erro ao deletar banco:", event.target.error);
  };

  request.onblocked = () => {
    location.reload();
  };
}

function AtualizarTabela() {
  const tbody = document.querySelector(".table-body");
  tbody.innerHTML = "";

  const transacao = db.transaction("produtos", "readonly");
  const store = transacao.objectStore("produtos");
  const request = store.openCursor();

  request.onsuccess = (event) => {
    const cursor = event.target.result;

    if (cursor) {
      const produto = cursor.value;

      const tr = document.createElement("tr");
      const tdId = document.createElement("td");
      tdId.textContent = produto.id;
      const tdNome = document.createElement("td");
      tdNome.textContent = produto.nome;
      const tdPreco = document.createElement("td");
      tdPreco.textContent = `R$ ${Number(produto.preco).toFixed(2)}`;
      const tdCat = document.createElement("td");
      tdCat.textContent = produto.categoria;

      const editBtn = document.createElement("button");
      editBtn.textContent = "Editar";

      editBtn.classList.add("btn-editar");
      editBtn.onclick = function () {
        EditarProduto(produto.id);
      };

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Deletar";
      deleteBtn.classList.add("btn-deletar");
      deleteBtn.onclick = function () {
        DeletarProduto(produto.id);
      };

      tr.appendChild(tdId);
      tr.appendChild(tdNome);
      tr.appendChild(tdPreco);
      tr.appendChild(tdCat);
      tr.appendChild(editBtn);
      tr.appendChild(deleteBtn);
      tbody.appendChild(tr);

      cursor.continue();
    } else {
      console.log("Fim dos produyos");
    }
  };

  request.onerror = (event) => {
    console.error("Erro no cursor", event);
  };
}
