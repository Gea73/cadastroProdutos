
const request = indexedDB.open("ProdutosDB", 3);


request.onupgradeneeded = event => {
    const db = event.target.result;

    if (!db.objectStoreNames.contains("produtos")) {
        db.createObjectStore("produtos", { keyPath: "id", autoIncrement: "true" });
    }
    console.log("Banco atualizado com sucesso");

}


request.onerror = event => {
    console.error("Erro no banco", + event.target.errorCode);
};

let db = null;

request.onsuccess = event => {
    db = event.target.result;
    console.log("Banco conectado com sucesso");
    AtualizarTabela();
};



function SalvarProduto() {
    const msg = document.querySelector('.msg');
    msg.innerHTML = '';
    const nomeValor = document.querySelector("#nome-produto").value.trim();
    const precoValor = document.querySelector("#preco-produto").value;
    const categoriaValor = document.querySelector("#categoria").value;
    if (!nomeValor || !precoValor || !categoriaValor) {
        console.log("Campos vazios")
        msg.innerHTML = 'Campo vazio preencha todos os campos!';
        return;
    }
    const tran = db.transaction("produtos", "readwrite");
    const store = tran.objectStore("produtos");

    const novoProduto = { nome: nomeValor, preco: Number(precoValor), categoria: categoriaValor };

    store.add(novoProduto);

    tran.oncomplete = () => {
        console.log("Produto adicionado:", novoProduto);
        msg.innerHTML = 'Produto adicionado!';
        AtualizarTabela();
    };

    tran.onerror = () => {
        console.error("Erro ao adicionar produto");
        msg.innerHTML = 'Erro ao adicionar produto!';
    };

}

function AtualizarTabela() {
    const tbody = document.querySelector('.table-body');
    tbody.innerHTML = '';

    const tran = db.transaction("produtos", "readonly");
    const store = tran.objectStore("produtos");
    const request = store.openCursor();

    request.onsuccess = (event) => {
        const cursor = event.target.result;

        if (cursor) {
            const produto = cursor.value;

            const tr = document.createElement('tr');
            const tdId = document.createElement('td');
            tdId.textContent = produto.id;
            const tdNome = document.createElement('td');
            tdNome.textContent = produto.nome;
            const tdPreco = document.createElement('td');
            tdPreco.textContent = `R$ ${Number(produto.preco).toFixed(2)}`;
            const tdCat = document.createElement('td');
            tdCat.textContent = produto.categoria;

            tr.appendChild(tdId);
            tr.appendChild(tdNome);
            tr.appendChild(tdPreco);
            tr.appendChild(tdCat);
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