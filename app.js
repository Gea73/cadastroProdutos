
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
};



function SalvarProduto() {

      const produtoValor = document.querySelector("#produto").value.trim();
    const precoValor = document.querySelector("#preco").value;
    if (!produtoValor || !precoValor) {
        console.log("Campos vazios")
        return;
    }
    const tran = db.transaction("produtos", "readwrite");
    const store = tran.objectStore("produtos");

    const novoProduto = { produto: produtoValor, preco: Number(precoValor) };

    store.add(novoProduto);

    tran.oncomplete = () => {
        console.log("Produto adicionado:", novoProduto);
    };

    tran.onerror = () => {
        console.error("Erro ao adicionar produto");
    };

}