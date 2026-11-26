document.addEventListener("DOMContentLoaded", () => {
    atualizarStatusLoja();
    setInterval(atualizarStatusLoja, 1000);

    configurarCalendarioAgendamento();
    configurarCalculoServico();
    configurarMascaras();
    configurarFormularios();
});

function atualizarStatusLoja() {
    const barraStatus = document.getElementById("status-funcionamento");
    if (!barraStatus) return;

    const agora = new Date();
    const diaSemana = agora.getDay();
    const hora = agora.getHours();
    const minutos = String(agora.getMinutes()).padStart(2, "0");
    const segundos = String(agora.getSeconds()).padStart(2, "0");
    const dataFormatada = agora.toLocaleDateString("pt-BR");

    const aberto = diaSemana >= 1 && diaSemana <= 6 && hora >= 8 && hora < 19;

    const badge = aberto
        ? `<span class="badge-status status-aberto">● Aberto Agora</span>`
        : `<span class="badge-status status-fechado">● Fechado (Abre Seg-Sáb às 08h)</span>`;

    barraStatus.innerHTML = `${badge} <span>Gravataí/RS • ${dataFormatada} às ${String(hora).padStart(2, "0")}:${minutos}:${segundos}</span>`;
}

function configurarCalendarioAgendamento() {
    const inputData = document.getElementById("dataAgendamento");
    const avisoData = document.getElementById("aviso-data");
    if (!inputData) return;

    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, "0");
    const dia = String(hoje.getDate()).padStart(2, "0");
    inputData.min = `${ano}-${mes}-${dia}`;

    inputData.addEventListener("change", () => {
        if (!inputData.value) return;
        const [y, m, d] = inputData.value.split("-").map(Number);
        const dataSelecionada = new Date(y, m - 1, d);

        if (dataSelecionada.getDay() === 0) {
            avisoData.textContent = "Não realizamos atendimentos aos domingos. Por favor, escolha de segunda a sábado.";
            avisoData.classList.remove("d-none");
            inputData.value = "";
        } else {
            avisoData.classList.add("d-none");
        }
    });
}

function configurarCalculoServico() {
    const radiosServico = document.querySelectorAll('input[name="servico"]');
    const radiosModalidade = document.querySelectorAll('input[name="modalidade"]');
    const visorValor = document.getElementById("valor-estimado");
    const enderecoTelebuscaInfo = document.getElementById("info-telebusca");

    if (!visorValor) return;

    function recalcular() {
        let precoBase = 0;
        let taxaTelebusca = 0;

        radiosServico.forEach((radio) => {
            if (radio.checked) {
                precoBase = parseFloat(radio.dataset.preco || 0);
            }
        });

        radiosModalidade.forEach((radio) => {
            if (radio.checked) {
                taxaTelebusca = parseFloat(radio.dataset.taxa || 0);
                if (enderecoTelebuscaInfo) {
                    if (radio.value === "Tele-Busca") {
                        enderecoTelebuscaInfo.classList.remove("d-none");
                    } else {
                        enderecoTelebuscaInfo.classList.add("d-none");
                    }
                }
            }
        });

        const total = precoBase + taxaTelebusca;
        visorValor.textContent = total.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
        });
    }

    radiosServico.forEach((r) => r.addEventListener("change", recalcular));
    radiosModalidade.forEach((r) => r.addEventListener("change", recalcular));
    recalcular();
}

function configurarMascaras() {
    const cpfInput = document.getElementById("cpf");
    if (cpfInput) {
        cpfInput.addEventListener("input", (e) => {
            let v = e.target.value.replace(/\D/g, "").slice(0, 11);
            v = v.replace(/(\d{3})(\d)/, "$1.$2");
            v = v.replace(/(\d{3})(\d)/, "$1.$2");
            v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
            e.target.value = v;
        });
    }

    const telInput = document.getElementById("telefone");
    if (telInput) {
        telInput.addEventListener("input", (e) => {
            let v = e.target.value.replace(/\D/g, "").slice(0, 11);
            if (v.length > 10) {
                v = v.replace(/^(\d{2})(\d{5})(\d{4}).*/, "($1) $2-$3");
            } else if (v.length > 5) {
                v = v.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, "($1) $2-$3");
            } else if (v.length > 2) {
                v = v.replace(/^(\d{2})(\d{0,5})/, "($1) $2");
            }
            e.target.value = v;
        });
    }
}

function configurarFormularios() {
    const formAgendamento = document.getElementById("form-agendamento");
    if (formAgendamento) {
        formAgendamento.addEventListener("submit", (e) => {
            e.preventDefault();

            const nomeCliente = document.getElementById("nomeCliente").value;
            const nomePet = document.getElementById("nomePet").value;
            const racaPet = document.getElementById("racaPet").value;
            const servico = document.querySelector('input[name="servico"]:checked').value;
            const modalidade = document.querySelector('input[name="modalidade"]:checked').value;
            const dataAg = document.getElementById("dataAgendamento").value.split("-").reverse().join("/");
            const horaAg = document.getElementById("horaAgendamento").value;
            const valorTotal = document.getElementById("valor-estimado").textContent;
            const protocolo = "AF-" + Math.floor(100000 + Math.random() * 900000);

            const caixaConfirmacao = document.getElementById("confirmacao-agendamento");
            caixaConfirmacao.innerHTML = `
                <h4>Agendamento Confirmado! Protocolo #${protocolo}</h4>
                <p><strong>Tutor(a):</strong> ${nomeCliente} | <strong>Pet:</strong> ${nomePet} (${racaPet})</p>
                <p><strong>Serviço:</strong> ${servico} • <strong>Modalidade:</strong> ${modalidade}</p>
                <p><strong>Data e Horário:</strong> ${dataAg} às ${horaAg} • <strong>Total:</strong> ${valorTotal}</p>
                <p class="mb-0">Enviamos os detalhes para o seu e-mail e WhatsApp cadastrados.</p>
            `;
            caixaConfirmacao.classList.remove("d-none");
            caixaConfirmacao.focus();
            formAgendamento.reset();
            configurarCalculoServico();
        });
    }

    const formContato = document.getElementById("form-contato");
    if (formContato) {
        formContato.addEventListener("submit", (e) => {
            e.preventDefault();
            const nome = document.getElementById("nome").value;
            const feedback = document.getElementById("feedback-contato");
            feedback.innerHTML = `<strong>Mensagem enviada com sucesso!</strong> Obrigado pelo contato, ${nome}. Nossa equipe responderá em breve.`;
            feedback.classList.remove("d-none");
            feedback.focus();
            formContato.reset();
        });
    }
}