// Importações necessárias do Firebase (SDK Modular)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";

// Sua configuração do Firebase (mantenha a sua chave)
const firebaseConfig = {
    apiKey: "AIzaSyB-YIjPZc4-onjYNLWhbkuFzpz6zKmPcrE",
    authDomain: "bolao-resultado-marcella.firebaseapp.com",
    projectId: "bolao-resultado-marcella",
    storageBucket: "bolao-resultado-marcella.firebasestorage.app",
    messagingSenderId: "39631056595",
    appId: "1:39631056595:web:c0cfd0f934750802872e26",
    measurementId: "G-TQTQQ4ZYXJ"
};

// Inicializa o Firebase e os serviços
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getDatabase(app, "https://bolao-resultado-marcella-default-rtdb.firebaseio.com/");

// Selecionando elementos da tela
const inputNome = document.getElementById('nomeJogador');
const btnSalvar = document.getElementById('btnSalvar');
const listaBolaoDiv = document.getElementById('listaBolao');

// Evento ao clicar em salvar resposta
btnSalvar.addEventListener('click', () => {
    const nome = inputNome.value.trim();
    
    // Pega todos os checkboxes que estão marcados
    const checkboxesSelecionados = document.querySelectorAll('input[name="escolha"]:checked');

    if (nome === "") {
        alert("Digite o nome do participante!");
        return;
    }

    if (checkboxesSelecionados.length === 0) {
        alert("Selecione pelo menos uma opção de diagnóstico!");
        return;
    }

    // Extrai os valores de todos os checkboxes marcados em um array
    let respostasArray = [];
    checkboxesSelecionados.forEach((checkbox) => {
        respostasArray.push(checkbox.value);
    });

    // Junta as respostas separadas por vírgula (ex: "TDAH, Ansiedade")
    const respostasTexto = respostasArray.join(", ");

    // Remove espaços indesejados do nome para usar como chave no banco de dados
    const chaveLimpa = nome.replace(/\s+/g, '_');

    // Salva no banco de dados na nuvem estruturado por jogador
    set(ref(db, 'bolao/' + chaveLimpa), {
        jogador: nome,
        resposta: respostasTexto
    }).then(() => {
        alert("Palpite salvo com sucesso!");
        inputNome.value = "";
        // Desmarca todos os checkboxes após salvar
        checkboxesSelecionados.forEach((checkbox) => {
            checkbox.checked = false;
        });
    }).catch((error) => {
        alert("Erro ao salvar: " + error.message);
    });
});

// ESCUTA EM TEMPO REAL: Atualiza a tela sempre que alguém envia um dado novo
const dbRef = ref(db, 'bolao');
onValue(dbRef, (snapshot) => {
    const dados = snapshot.val();
    listaBolaoDiv.innerHTML = "";

    if (!dados) {
        listaBolaoDiv.innerHTML = "Nenhum palpite registrado ainda.";
        return;
    }

    // Percorre os dados do Firebase e monta cada jogador em uma linha separada
    let arrayRespostas = [];
    for (let id in dados) {
        let item = dados[id];
        arrayRespostas.push(`${item.jogador} + [${item.resposta}]`);
    }

    // Junta cada item usando uma quebra de linha (<br>) em vez de ponto e vírgula na mesma linha
    listaBolaoDiv.innerHTML = arrayRespostas.join("<br><br>");
});
