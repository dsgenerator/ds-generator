// ==================== LISTA DE SERVIÇOS (PROPOSTAS) ====================
const servicosList = [
    "RADIUS HA (M)", "RADIUS HA", "RADIUS HA (V2)", "Finee PAY Boleto", "FineeVia - Bilhetagem",
    "Finee Pay - Cartão", "TRUST VCM", "SRD", "TR-069", "Backup", "VDS", "STFC", "MVNO", "DRRaS",
    "DNS", "Backup On Premises", "E-MAIL", "ADM GER SERV", "Rede Neutra", "HOSPEDAGEM",
    "Suporte Premium", "SIT Watch", "SIT Logs", "NOC Smart", "NOC Advanced", "NOC Premium",
    "Cloud VM RADIUS HA", "Cloud VM SRD", "Cloud VM ACS", "Cloud VM Staging", "Cloud VM Portal",
    "elleven SaaS OMNI+FIELD", "elleven SaaS OMNI", "elleven SaaS FIELD", "elleven SaaS",
    "elleven On-premises OMNI+FIELD", "elleven On-premises OMNI", "elleven On-premises FIELD",
    "elleven On-premises"
];

// ==================== MÓDULO PROPOSTAS ====================
let currentStep = 1;
let itensProposta = [];
let dadosProposta = {
    empresa: "", validade: "", pontoFocal: "", refUsers: "",
    observacaoGeral: "", observacaoNegociacao: ""
};

// Elementos DOM
const loginScreen = document.getElementById("loginScreen");
const mainLayout = document.getElementById("mainLayout");
const btnLogin = document.getElementById("btnLogin");
const btnLogoutSidebar = document.getElementById("btnLogoutSidebar");
const stepDadosDiv = document.getElementById("stepDados");
const stepItensDiv = document.getElementById("stepItens");
const stepResumoDiv = document.getElementById("stepResumo");
const stepItems = document.querySelectorAll(".step-item");
const empresaInput = document.getElementById("empresaNome");
const validadeInput = document.getElementById("validadeData");
const pontoFocalInput = document.getElementById("pontoFocal");
const refUsersInput = document.getElementById("refUsers");
const observacaoGeralInput = document.getElementById("observacaoGeral");
const observacaoNegociacaoInput = document.getElementById("observacaoNegociacao");
const cancelarDados = document.getElementById("cancelarDados");
const avancarDados = document.getElementById("avancarDados");
const voltarItens = document.getElementById("voltarItens");
const avancarItens = document.getElementById("avancarItens");
const voltarResumo = document.getElementById("voltarResumo");
const imprimirResumo = document.getElementById("imprimirResumo");
const abrirListaServicosBtn = document.getElementById("abrirListaServicosBtn");
const limparItensBtn = document.getElementById("limparItensBtn");
const modalServicos = document.getElementById("modalServicos");
const modalValores = document.getElementById("modalValores");
const closeServicosModal = document.getElementById("closeServicosModal");
const fecharServicosBtn = document.getElementById("fecharServicosBtn");
const closeValoresModal = document.getElementById("closeValoresModal");
const cancelarValoresBtn = document.getElementById("cancelarValoresBtn");
const salvarItemBtn = document.getElementById("salvarItemBtn");
const listaServicosBody = document.getElementById("listaServicosBody");
const servicoSelecionadoNome = document.getElementById("servicoSelecionadoNome");
const adesaoValorInput = document.getElementById("adesaoValor");
const mensalValorInput = document.getElementById("mensalValor");
let pendingServicoNome = null;

function escapeHtml(str) {
    if (!str) return "";
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function formatarDataBR(dataISO) {
    if (!dataISO) return "—";
    const partes = dataISO.split("-");
    if (partes.length !== 3) return dataISO;
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function atualizarStepsUI() {
    stepItems.forEach((item, idx) => {
        const stepNum = idx + 1;
        if (stepNum === currentStep) item.classList.add("active-step-item");
        else item.classList.remove("active-step-item");
    });
    stepDadosDiv.classList.remove("active-step");
    stepItensDiv.classList.remove("active-step");
    stepResumoDiv.classList.remove("active-step");
    if (currentStep === 1) stepDadosDiv.classList.add("active-step");
    if (currentStep === 2) stepItensDiv.classList.add("active-step");
    if (currentStep === 3) stepResumoDiv.classList.add("active-step");
}

function carregarDadosInputs() {
    empresaInput.value = dadosProposta.empresa;
    validadeInput.value = dadosProposta.validade;
    pontoFocalInput.value = dadosProposta.pontoFocal;
    refUsersInput.value = dadosProposta.refUsers;
    if (observacaoGeralInput) observacaoGeralInput.value = dadosProposta.observacaoGeral;
    if (observacaoNegociacaoInput) observacaoNegociacaoInput.value = dadosProposta.observacaoNegociacao;
}

function salvarDadosAtuais() {
    dadosProposta.empresa = empresaInput.value;
    dadosProposta.validade = validadeInput.value;
    dadosProposta.pontoFocal = pontoFocalInput.value;
    dadosProposta.refUsers = refUsersInput.value;
    if (observacaoGeralInput) dadosProposta.observacaoGeral = observacaoGeralInput.value;
    if (observacaoNegociacaoInput) dadosProposta.observacaoNegociacao = observacaoNegociacaoInput.value;
}

function renderTabelaItens() {
    const tbody = document.getElementById("itensTableBody");
    if (!tbody) return;
    if (itensProposta.length === 0) {
        tbody.innerHTML = '<tr class="empty-row"><td colspan="4">Nenhum item adicionado</td></tr>';
        return;
    }
    let html = "";
    itensProposta.forEach((item, idx) => {
        html += `
            <tr>
                <td>${escapeHtml(item.nome)}</td>
                <td>R$ ${parseFloat(item.adesao).toFixed(2)}</td>
                <td>R$ ${parseFloat(item.mensal).toFixed(2)}</td>
                <td><button class="btn-remover" data-index="${idx}">Remover</button></td>
            </tr>
        `;
    });
    tbody.innerHTML = html;
    document.querySelectorAll(".btn-remover").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const index = parseInt(btn.getAttribute("data-index"));
            itensProposta.splice(index, 1);
            renderTabelaItens();
        });
    });
}

function renderResumo() {
    const resumoClienteDiv = document.getElementById("resumoDadosCliente");
    const resumoItensLista = document.getElementById("resumoItensLista");
    const resumoTotalDiv = document.getElementById("resumoTotal");

    let htmlCliente = `
        <strong>Empresa:</strong> ${escapeHtml(dadosProposta.empresa) || "—"}<br>
        <strong>Validade:</strong> ${formatarDataBR(dadosProposta.validade)}<br>
        <strong>Ponto focal:</strong> ${escapeHtml(dadosProposta.pontoFocal) || "—"}<br>
        <strong>Referência users:</strong> ${escapeHtml(dadosProposta.refUsers) || "—"}
    `;
    if (dadosProposta.observacaoGeral && dadosProposta.observacaoGeral.trim() !== "") {
        htmlCliente += `<div class="obs-box"><strong>Observações Gerais:</strong><br>${escapeHtml(dadosProposta.observacaoGeral)}</div>`;
    }
    if (dadosProposta.observacaoNegociacao && dadosProposta.observacaoNegociacao.trim() !== "") {
        htmlCliente += `<div class="obs-box"><strong>Observações da Negociação:</strong><br>${escapeHtml(dadosProposta.observacaoNegociacao)}</div>`;
    }
    resumoClienteDiv.innerHTML = htmlCliente;

    if (itensProposta.length === 0) {
        resumoItensLista.innerHTML = "<p>Nenhum item adicionado.</p>";
        resumoTotalDiv.innerHTML = "<strong>Total: R$ 0,00</strong>";
        return;
    }

    let itensHtml = `<div>`;
    let totalAdesao = 0, totalMensal = 0;
    itensProposta.forEach(item => {
        const adesaoNum = parseFloat(item.adesao) || 0;
        const mensalNum = parseFloat(item.mensal) || 0;
        totalAdesao += adesaoNum;
        totalMensal += mensalNum;
        itensHtml += `
            <div class="item-card">
                <strong>${escapeHtml(item.nome)}</strong>
                <span>- Adesão: R$ ${adesaoNum.toFixed(2)}</span>
                <span>- Mensal: R$ ${mensalNum.toFixed(2)}</span>
            </div>
        `;
    });
    itensHtml += `</div>`;
    resumoItensLista.innerHTML = itensHtml;

    const totalGeral = totalAdesao + totalMensal;
    resumoTotalDiv.innerHTML = `<div style="text-align: right;"><strong>Total da proposta: R$ ${totalGeral.toFixed(2)}</strong></div>`;
}

function popularListaServicos() {
    let html = `<div class="servicos-grid">`;
    servicosList.forEach(serv => {
        html += `<div class="servico-item" data-servico="${escapeHtml(serv)}">${escapeHtml(serv)}</div>`;
    });
    html += `</div>`;
    listaServicosBody.innerHTML = html;
    document.querySelectorAll(".servico-item").forEach(el => {
        el.addEventListener("dblclick", (e) => {
            const nomeServico = el.getAttribute("data-servico");
            pendingServicoNome = nomeServico;
            servicoSelecionadoNome.value = nomeServico;
            adesaoValorInput.value = "0.00";
            mensalValorInput.value = "0.00";
            modalServicos.classList.remove("active-modal");
            modalValores.classList.add("active-modal");
        });
    });
}

function abrirModalServicos() {
    popularListaServicos();
    modalServicos.classList.add("active-modal");
}

function closeAllModals() {
    modalServicos.classList.remove("active-modal");
    modalValores.classList.remove("active-modal");
    const comentarioModal = document.getElementById("modalComentario");
    if (comentarioModal) comentarioModal.classList.remove("active-modal");
}

function salvarItemProposta() {
    if (!pendingServicoNome) return;
    const adesao = parseFloat(adesaoValorInput.value);
    const mensal = parseFloat(mensalValorInput.value);
    const newItem = {
        nome: pendingServicoNome,
        adesao: isNaN(adesao) ? 0 : adesao,
        mensal: isNaN(mensal) ? 0 : mensal
    };
    itensProposta.push(newItem);
    renderTabelaItens();
    pendingServicoNome = null;
    modalValores.classList.remove("active-modal");
}

function cancelarProposta() {
    if (confirm("Deseja cancelar a proposta? Todos os dados não salvos serão perdidos.")) {
        itensProposta = [];
        dadosProposta = { empresa: "", validade: "", pontoFocal: "", refUsers: "", observacaoGeral: "", observacaoNegociacao: "" };
        carregarDadosInputs();
        renderTabelaItens();
        currentStep = 1;
        atualizarStepsUI();
    }
}

function avancarStep1() {
    salvarDadosAtuais();
    if (!dadosProposta.empresa.trim()) {
        alert("Informe o nome da empresa.");
        return false;
    }
    currentStep = 2;
    atualizarStepsUI();
    return true;
}

function voltarStep2() {
    currentStep = 1;
    atualizarStepsUI();
    carregarDadosInputs();
}

function avancarStep2() {
    if (itensProposta.length === 0) {
        alert("Adicione pelo menos um serviço antes de avançar.");
        return;
    }
    if (observacaoNegociacaoInput) {
        dadosProposta.observacaoNegociacao = observacaoNegociacaoInput.value;
    }
    renderResumo();
    currentStep = 3;
    atualizarStepsUI();
}

function voltarStep3() {
    currentStep = 2;
    atualizarStepsUI();
    renderTabelaItens();
}

function imprimirResumoFunc() {
    renderResumo();
    window.print();
}

// ==================== MÓDULO GFC ====================
const GFC_STORAGE_KEY = 'gfc_sales';
let gfcSales = [];
let gfcNextId = 1;
let gfcFiltroVencInicio = '', gfcFiltroVencFim = '', gfcFiltroStatus = '';

const gfcModule = document.getElementById("gfcModule");
const btnNovaVenda = document.getElementById("btnNovaVenda");
const btnReceberComissao = document.getElementById("btnReceberComissao");
const filtroVencInicio = document.getElementById("filtroVencimentoInicio");
const filtroVencFim = document.getElementById("filtroVencimentoFim");
const filtroStatus = document.getElementById("filtroStatus");
const btnAplicarFiltros = document.getElementById("btnAplicarFiltros");
const btnLimparFiltros = document.getElementById("btnLimparFiltros");
const gfcTabelaBody = document.getElementById("gfcTabelaBody");
const selecionarTodosCheck = document.getElementById("selecionarTodos");
const btnRelatorioGfc = document.getElementById("btnRelatorioGfc");

let modalNovaVenda = null, modalEditarVenda = null, modalReceberComissao = null;

function migrarDadosAntigos() {
    let altered = false;
    gfcSales.forEach(v => {
        if (v.percentualComissao !== undefined && (v.percentualAdesao === undefined || v.percentualMensal === undefined)) {
            v.percentualAdesao = v.percentualComissao;
            v.percentualMensal = v.percentualComissao;
            delete v.percentualComissao;
            altered = true;
        }
        if (v.percentualAdesao === undefined) v.percentualAdesao = 5;
        if (v.percentualMensal === undefined) v.percentualMensal = 5;
    });
    if (altered) salvarGfcSales();
}

function carregarGfcSales() {
    const stored = localStorage.getItem(GFC_STORAGE_KEY);
    if (stored) {
        gfcSales = JSON.parse(stored);
        gfcNextId = Math.max(0, ...gfcSales.map(s => s.id), 0) + 1;
        migrarDadosAntigos();
    } else {
        gfcSales = [];
        gfcNextId = 1;
    }
    aplicarFiltros();
}

function salvarGfcSales() {
    localStorage.setItem(GFC_STORAGE_KEY, JSON.stringify(gfcSales));
}

function calcularComissoes(venda) {
    const comissaoAdesao = venda.valorAdesao * (venda.percentualAdesao / 100);
    const comissaoMensal = venda.valorMensal * (venda.percentualMensal / 100);
    return { comissaoAdesao, comissaoMensal };
}

function aplicarFiltros() {
    gfcFiltroVencInicio = filtroVencInicio.value;
    gfcFiltroVencFim = filtroVencFim.value;
    gfcFiltroStatus = filtroStatus.value;

    let dadosFiltrados = [...gfcSales];
    if (gfcFiltroVencInicio) dadosFiltrados = dadosFiltrados.filter(v => v.dataVencimento >= gfcFiltroVencInicio);
    if (gfcFiltroVencFim) dadosFiltrados = dadosFiltrados.filter(v => v.dataVencimento <= gfcFiltroVencFim);
    if (gfcFiltroStatus) dadosFiltrados = dadosFiltrados.filter(v => v.status === gfcFiltroStatus);
    else dadosFiltrados = dadosFiltrados.filter(v => v.status !== 'Não elegível');

    renderizarTabelaGfc(dadosFiltrados);
}

function renderizarTabelaGfc(vendas) {
    if (!vendas.length) {
        gfcTabelaBody.innerHTML = '<tr><td colspan="13">Nenhum registro encontrado.</td></tr>';
        return;
    }
    let html = '';
    vendas.forEach(v => {
        const { comissaoAdesao, comissaoMensal } = calcularComissoes(v);
        const isDisabled = v.status === 'Recebida' || v.status === 'Não elegível';
        html += `
            <tr data-id="${v.id}">
                <td><input type="checkbox" class="selecionarVenda" data-id="${v.id}" ${isDisabled ? 'disabled' : ''}></td>
                <td>${escapeHtml(v.cliente)}</td>
                <td>${escapeHtml(v.cnpj)}</td>
                <td>${escapeHtml(v.servico)}</td>
                <td>R$ ${v.valorAdesao.toFixed(2)}</td>
                <td>R$ ${v.valorMensal.toFixed(2)}</td>
                <td>${formatarDataBR(v.dataVencimento)}</td>
                <td>${v.percentualAdesao}%</td>
                <td>${v.percentualMensal}%</td>
                <td>R$ ${comissaoAdesao.toFixed(2)}</td>
                <td>R$ ${comissaoMensal.toFixed(2)}</td>
                <td>${v.status}</td>
                <td>
                    <button class="btn-editar" data-id="${v.id}" style="margin-right: 5px;">✏️</button>
                    ${v.status === 'Recebida' ? `<button class="btn-delete" data-id="${v.id}">🗑️</button>` : ''}
                </td>
            </tr>
        `;
    });
    gfcTabelaBody.innerHTML = html;
    const checkboxes = document.querySelectorAll('.selecionarVenda:not(:disabled)');
    const todosCheckados = checkboxes.length > 0 && Array.from(checkboxes).every(cb => cb.checked);
    selecionarTodosCheck.checked = todosCheckados;
    document.querySelectorAll('.btn-editar').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(btn.getAttribute('data-id'));
            abrirModalEditarVenda(id);
        });
    });
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(btn.getAttribute('data-id'));
            deletarVenda(id);
        });
    });
    document.querySelectorAll('.selecionarVenda').forEach(cb => {
        cb.addEventListener('change', atualizarSelecionarTodos);
    });
}

function atualizarSelecionarTodos() {
    const checkboxes = document.querySelectorAll('.selecionarVenda:not(:disabled)');
    const todosCheckados = checkboxes.length > 0 && Array.from(checkboxes).every(cb => cb.checked);
    selecionarTodosCheck.checked = todosCheckados;
}

function deletarVenda(id) {
    const venda = gfcSales.find(v => v.id === id);
    if (!venda || venda.status !== 'Recebida') {
        alert('Só é possível excluir registros com status "Recebida".');
        return;
    }
    if (confirm(`Tem certeza que deseja excluir a venda de ${venda.cliente}? Esta ação não pode ser desfeita.`)) {
        gfcSales = gfcSales.filter(v => v.id !== id);
        salvarGfcSales();
        aplicarFiltros();
    }
}

function abrirModalNovaVenda() {
    if (modalNovaVenda) modalNovaVenda.remove();
    modalNovaVenda = document.createElement('div');
    modalNovaVenda.className = 'modal-overlay active-modal';
    modalNovaVenda.innerHTML = `
        <div class="modal-container modal-gfc">
            <div class="modal-header"><h3>Nova venda</h3><button class="close-modal">&times;</button></div>
            <div class="modal-body">
                <div class="form-field"><label>Nome do cliente</label><input type="text" id="gfcCliente" required></div>
                <div class="form-field"><label>CNPJ</label><input type="text" id="gfcCnpj" placeholder="00.000.000/0000-00"></div>
                <div class="form-field"><label>Serviço/Produto</label><input type="text" id="gfcServico" required></div>
                <div class="form-field"><label>Valor de adesão (R$)</label><input type="number" id="gfcAdesao" step="0.01" value="0.00"></div>
                <div class="form-field"><label>Valor mensal (R$)</label><input type="number" id="gfcMensal" step="0.01" value="0.00"></div>
                <div class="form-field"><label>Data de vencimento</label><input type="date" id="gfcVencimento" required></div>
                <div class="form-field"><label>Percentual de comissão sobre adesão (%)</label><input type="number" id="gfcPercentualAdesao" step="0.01" value="5.00" required></div>
                <div class="form-field"><label>Percentual de comissão sobre mensalidade (%)</label><input type="number" id="gfcPercentualMensal" step="0.01" value="5.00" required></div>
            </div>
            <div class="modal-footer"><button class="btn-secondary" id="cancelarNovaVenda">Cancelar</button><button class="btn-primary" id="salvarNovaVenda">Salvar</button></div>
        </div>
    `;
    document.body.appendChild(modalNovaVenda);
    const fechar = () => modalNovaVenda.remove();
    modalNovaVenda.querySelector('.close-modal').addEventListener('click', fechar);
    modalNovaVenda.querySelector('#cancelarNovaVenda').addEventListener('click', fechar);
    modalNovaVenda.querySelector('#salvarNovaVenda').addEventListener('click', () => {
        const cliente = document.getElementById('gfcCliente').value.trim();
        const cnpj = document.getElementById('gfcCnpj').value.trim();
        const servico = document.getElementById('gfcServico').value.trim();
        const adesao = parseFloat(document.getElementById('gfcAdesao').value) || 0;
        const mensal = parseFloat(document.getElementById('gfcMensal').value) || 0;
        const vencimento = document.getElementById('gfcVencimento').value;
        const percAdesao = parseFloat(document.getElementById('gfcPercentualAdesao').value) || 0;
        const percMensal = parseFloat(document.getElementById('gfcPercentualMensal').value) || 0;
        if (!cliente || !servico || !vencimento) { alert('Preencha os campos obrigatórios.'); return; }
        const novaVenda = {
            id: gfcNextId++,
            cliente, cnpj, servico,
            valorAdesao: adesao, valorMensal: mensal,
            dataVencimento: vencimento,
            percentualAdesao: percAdesao, percentualMensal: percMensal,
            status: 'Pendente',
            competenciaRecebimento: null,
            valorRecebido: null,
            fatorAplicado: null
        };
        gfcSales.push(novaVenda);
        salvarGfcSales();
        aplicarFiltros();
        fechar();
    });
}

function abrirModalEditarVenda(id) {
    const venda = gfcSales.find(v => v.id === id);
    if (!venda) return;
    if (modalEditarVenda) modalEditarVenda.remove();
    modalEditarVenda = document.createElement('div');
    modalEditarVenda.className = 'modal-overlay active-modal';
    modalEditarVenda.innerHTML = `
        <div class="modal-container modal-gfc">
            <div class="modal-header"><h3>Editar lançamento #${venda.id}</h3><button class="close-modal">&times;</button></div>
            <div class="modal-body">
                <div class="form-field"><label>Cliente</label><input type="text" id="editCliente" value="${escapeHtml(venda.cliente)}"></div>
                <div class="form-field"><label>CNPJ</label><input type="text" id="editCnpj" value="${escapeHtml(venda.cnpj)}"></div>
                <div class="form-field"><label>Serviço</label><input type="text" id="editServico" value="${escapeHtml(venda.servico)}"></div>
                <div class="form-field"><label>Valor de adesão (R$)</label><input type="number" id="editAdesao" step="0.01" value="${venda.valorAdesao}"></div>
                <div class="form-field"><label>Valor mensal (R$)</label><input type="number" id="editMensal" step="0.01" value="${venda.valorMensal}"></div>
                <div class="form-field"><label>Data de vencimento</label><input type="date" id="editVencimento" value="${venda.dataVencimento}"></div>
                <div class="form-field"><label>Percentual de comissão sobre adesão (%)</label><input type="number" id="editPercentualAdesao" step="0.01" value="${venda.percentualAdesao}"></div>
                <div class="form-field"><label>Percentual de comissão sobre mensalidade (%)</label><input type="number" id="editPercentualMensal" step="0.01" value="${venda.percentualMensal}"></div>
                <div class="form-field"><label>Status</label>
                    <select id="editStatus">
                        <option value="Pendente" ${venda.status === 'Pendente' ? 'selected' : ''}>Pendente</option>
                        <option value="A receber" ${venda.status === 'A receber' ? 'selected' : ''}>A receber</option>
                        <option value="Recebida" ${venda.status === 'Recebida' ? 'selected' : ''}>Recebida</option>
                        <option value="Não elegível" ${venda.status === 'Não elegível' ? 'selected' : ''}>Não elegível</option>
                    </select>
                </div>
                <div class="form-field"><label>Fator de meta (%) (aplica-se apenas às comissões mensais)</label><input type="number" id="editFator" step="0.01" value="100"></div>
                <div id="editCalculo" class="total-info"></div>
            </div>
            <div class="modal-footer"><button class="btn-secondary" id="cancelarEditar">Cancelar</button><button class="btn-primary" id="salvarEditar">Salvar</button></div>
        </div>
    `;
    document.body.appendChild(modalEditarVenda);

    function atualizarCalculo() {
        const adesao = parseFloat(document.getElementById('editAdesao').value) || 0;
        const mensal = parseFloat(document.getElementById('editMensal').value) || 0;
        const percAdesao = parseFloat(document.getElementById('editPercentualAdesao').value) || 0;
        const percMensal = parseFloat(document.getElementById('editPercentualMensal').value) || 0;
        const fator = parseFloat(document.getElementById('editFator').value) || 0;
        const comissaoAdesao = adesao * (percAdesao / 100);
        const comissaoMensal = mensal * (percMensal / 100);
        const comissaoMensalAjustada = comissaoMensal * (fator / 100);
        const div = document.getElementById('editCalculo');
        div.innerHTML = `
            <p><strong>Comissão de adesão:</strong> R$ ${comissaoAdesao.toFixed(2)} (${percAdesao}%)</p>
            <p><strong>Comissão mensal base:</strong> R$ ${comissaoMensal.toFixed(2)} (${percMensal}%)</p>
            <p><strong>Comissão mensal após fator (${fator}%):</strong> R$ ${comissaoMensalAjustada.toFixed(2)}</p>
            <p><strong>Total a receber:</strong> R$ ${(comissaoAdesao + comissaoMensalAjustada).toFixed(2)}</p>
        `;
    }
    const inputs = ['editAdesao', 'editMensal', 'editPercentualAdesao', 'editPercentualMensal', 'editFator'];
    inputs.forEach(id => document.getElementById(id).addEventListener('input', atualizarCalculo));
    atualizarCalculo();

    const fechar = () => modalEditarVenda.remove();
    modalEditarVenda.querySelector('.close-modal').addEventListener('click', fechar);
    modalEditarVenda.querySelector('#cancelarEditar').addEventListener('click', fechar);
    modalEditarVenda.querySelector('#salvarEditar').addEventListener('click', () => {
        venda.cliente = document.getElementById('editCliente').value.trim();
        venda.cnpj = document.getElementById('editCnpj').value.trim();
        venda.servico = document.getElementById('editServico').value.trim();
        venda.valorAdesao = parseFloat(document.getElementById('editAdesao').value) || 0;
        venda.valorMensal = parseFloat(document.getElementById('editMensal').value) || 0;
        venda.dataVencimento = document.getElementById('editVencimento').value;
        venda.percentualAdesao = parseFloat(document.getElementById('editPercentualAdesao').value) || 0;
        venda.percentualMensal = parseFloat(document.getElementById('editPercentualMensal').value) || 0;
        venda.status = document.getElementById('editStatus').value;
        const fator = parseFloat(document.getElementById('editFator').value) || 100;
        if (venda.status === 'Recebida' && (!venda.competenciaRecebimento || !venda.valorRecebido)) {
            const competencia = prompt('Data de competência de recebimento (YYYY-MM-DD):', venda.competenciaRecebimento || '');
            if (!competencia) { alert('Competência obrigatória.'); return; }
            const { comissaoAdesao, comissaoMensal } = calcularComissoes(venda);
            const valorRecebido = comissaoAdesao + (comissaoMensal * (fator / 100));
            venda.competenciaRecebimento = competencia;
            venda.valorRecebido = valorRecebido;
            venda.fatorAplicado = fator;
        } else if (venda.status !== 'Recebida') {
            venda.competenciaRecebimento = null;
            venda.valorRecebido = null;
            venda.fatorAplicado = null;
        }
        salvarGfcSales();
        aplicarFiltros();
        fechar();
    });
}

function abrirModalReceberComissao() {
    const selecionados = Array.from(document.querySelectorAll('.selecionarVenda:checked:not(:disabled)'))
        .map(cb => parseInt(cb.getAttribute('data-id')));
    if (!selecionados.length) { alert('Selecione pelo menos um registro (status Pendente ou A receber).'); return; }
    const vendasSelecionadas = gfcSales.filter(v => selecionados.includes(v.id));
    let totalAdesao = 0, totalMensalBase = 0;
    vendasSelecionadas.forEach(v => {
        const { comissaoAdesao, comissaoMensal } = calcularComissoes(v);
        totalAdesao += comissaoAdesao;
        totalMensalBase += comissaoMensal;
    });
    if (modalReceberComissao) modalReceberComissao.remove();
    modalReceberComissao = document.createElement('div');
    modalReceberComissao.className = 'modal-overlay active-modal';
    modalReceberComissao.innerHTML = `
        <div class="modal-container modal-gfc">
            <div class="modal-header"><h3>Receber comissão em lote</h3><button class="close-modal">&times;</button></div>
            <div class="modal-body">
                <div class="total-info">
                    <p><strong>Total de comissões de adesão (sem fator):</strong> R$ ${totalAdesao.toFixed(2)}</p>
                    <p><strong>Total de comissões mensais (base):</strong> R$ ${totalMensalBase.toFixed(2)}</p>
                </div>
                <div class="form-field"><label>Fator de meta (%) (aplicado apenas às mensais)</label><input type="number" id="fatorLote" step="0.01" value="100"></div>
                <div class="total-info" id="totalFinalLote"></div>
                <div class="form-field"><label>Competência de recebimento</label><input type="date" id="competenciaLote" required></div>
            </div>
            <div class="modal-footer"><button class="btn-secondary" id="cancelarLote">Cancelar</button><button class="btn-primary" id="confirmarLote">Confirmar</button></div>
        </div>
    `;
    document.body.appendChild(modalReceberComissao);
    const fatorInput = modalReceberComissao.querySelector('#fatorLote');
    const totalFinalSpan = modalReceberComissao.querySelector('#totalFinalLote');
    const competenciaInput = modalReceberComissao.querySelector('#competenciaLote');
    function atualizarTotalFinal() {
        const fator = parseFloat(fatorInput.value) || 0;
        const totalMensalAjustado = totalMensalBase * (fator / 100);
        const totalGeral = totalAdesao + totalMensalAjustado;
        totalFinalSpan.innerHTML = `
            <p><strong>Total mensal após fator:</strong> R$ ${totalMensalAjustado.toFixed(2)}</p>
            <p><strong>Total geral a receber:</strong> R$ ${totalGeral.toFixed(2)}</p>
        `;
    }
    fatorInput.addEventListener('input', atualizarTotalFinal);
    atualizarTotalFinal();
    const fechar = () => modalReceberComissao.remove();
    modalReceberComissao.querySelector('.close-modal').addEventListener('click', fechar);
    modalReceberComissao.querySelector('#cancelarLote').addEventListener('click', fechar);
    modalReceberComissao.querySelector('#confirmarLote').addEventListener('click', () => {
        const competencia = competenciaInput.value;
        if (!competencia) { alert('Informe a competência.'); return; }
        const fator = parseFloat(fatorInput.value) || 0;
        const totalMensalAjustado = totalMensalBase * (fator / 100);
        const totalGeral = totalAdesao + totalMensalAjustado;
        vendasSelecionadas.forEach(v => {
            const { comissaoAdesao, comissaoMensal } = calcularComissoes(v);
            const valorRecebido = comissaoAdesao + (comissaoMensal * (fator / 100));
            v.status = 'Recebida';
            v.competenciaRecebimento = competencia;
            v.valorRecebido = valorRecebido;
            v.fatorAplicado = fator;
        });
        salvarGfcSales();
        aplicarFiltros();
        fechar();
        if (confirm('Deseja imprimir o recibo?')) {
            const reciboLinhas = vendasSelecionadas.map(v => 
                `${v.cliente} (${v.cnpj}) - Adesão: R$ ${(v.valorAdesao * (v.percentualAdesao/100)).toFixed(2)} | Mensal ajustada: R$ ${(v.valorMensal * (v.percentualMensal/100) * (fator/100)).toFixed(2)}`
            );
            const win = window.open('', '_blank');
            win.document.write(`
                <html><head><title>Recibo GFC</title></head><body>
                <pre>
RECIBO DE COMISSÃO
Competência: ${competencia}
Fator aplicado: ${fator}% sobre as mensalidades
Total pago: R$ ${totalGeral.toFixed(2)}
----------------------------------------
${reciboLinhas.join('\n')}
                </pre>
                </body></html>
            `);
            win.print();
        }
    });
}

function imprimirRelatorioGfc() {
    const tabela = document.getElementById('gfcTabela');
    if (!tabela) return;
    const cloneTabela = tabela.cloneNode(true);
    cloneTabela.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.remove());
    cloneTabela.querySelectorAll('.btn-editar, .btn-delete').forEach(btn => btn.remove());
    const titulo = 'Generator Factor Commission - Relatório';
    const dataHora = new Date().toLocaleString('pt-BR');
    const conteudo = `
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"><title>Relatório GFC</title>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 2rem; }
            h1 { color: #1e3c72; }
            .info { margin-bottom: 1rem; color: #666; font-size: 0.9rem; }
            table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f1f3f5; }
            .footer { margin-top: 2rem; font-size: 0.8rem; text-align: center; color: #999; }
        </style>
        </head>
        <body>
            <h1>${titulo}</h1>
            <div class="info">Gerado em: ${dataHora}</div>
            ${cloneTabela.outerHTML}
            <div class="footer">DS-Generator - GFC Módulo</div>
        </body>
        </html>
    `;
    const win = window.open('', '_blank');
    win.document.write(conteudo);
    win.document.close();
    win.print();
}

// ==================== MÓDULO GESTÃO DE TAREFAS (COM FILTROS) ====================
const TASK_STORAGE_KEY = 'task_manager_tasks';
let tasks = [];
let taskNextId = 1;
let globalTaskUpdateInterval = null;
let filteredTasks = [];

const tasksModule = document.getElementById("tasksModule");
const btnNovaTarefa = document.getElementById("btnNovaTarefa");
const tasksTableBody = document.getElementById("tasksTableBody");
const taskFilterStatus = document.getElementById("taskFilterStatus");
const taskFilterDataInicio = document.getElementById("taskFilterDataInicio");
const taskFilterDataFim = document.getElementById("taskFilterDataFim");
const btnAplicarFiltrosTasks = document.getElementById("btnAplicarFiltrosTasks");
const btnLimparFiltrosTasks = document.getElementById("btnLimparFiltrosTasks");

let modalNovaTarefa = null;
let modalVerTarefa = null;
let pendingTaskAction = null;

const tiposTarefa = [
    'Intercorrência de Deals',
    'Ação de Deals',
    'Demanda Interna',
    'Organização Pessoal'
];

function migrarCreatedAt() {
    let altered = false;
    tasks.forEach(task => {
        if (!task.createdAt && task.history && task.history.length > 0) {
            task.createdAt = task.history[0].timestamp;
            altered = true;
        }
        if (!task.createdAt) {
            task.createdAt = Date.now();
            altered = true;
        }
    });
    if (altered) salvarTasks();
}

function carregarTasks() {
    const stored = localStorage.getItem(TASK_STORAGE_KEY);
    if (stored) {
        tasks = JSON.parse(stored);
        taskNextId = Math.max(0, ...tasks.map(t => t.id), 0) + 1;
        migrarCreatedAt();
        tasks.forEach(task => {
            if (task.status === 'Em andamento' && task.startTime) {
                const elapsed = Date.now() - task.startTime;
                task.totalSeconds += Math.floor(elapsed / 1000);
                task.startTime = null;
                task.status = 'Em pausa';
                task.history.push({ type: 'pause', timestamp: Date.now(), note: 'Pausado automaticamente ao recarregar a página', elapsed: task.totalSeconds });
            } else if (task.status === 'Em pausa' && task.startTime) {
                task.startTime = null;
            }
        });
        salvarTasks();
    } else {
        tasks = [];
        taskNextId = 1;
    }
    aplicarFiltrosTasks();
    iniciarAtualizacaoTempos();
}

function salvarTasks() {
    localStorage.setItem(TASK_STORAGE_KEY, JSON.stringify(tasks));
}

function formatarTempo(segundos) {
    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    const segs = segundos % 60;
    return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
}

function obterTempoTotal(task) {
    let total = task.totalSeconds;
    if (task.status === 'Em andamento' && task.startTime) {
        total += Math.floor((Date.now() - task.startTime) / 1000);
    }
    return total;
}

function aplicarFiltrosTasks() {
    const statusFiltro = taskFilterStatus.value;
    const dataInicio = taskFilterDataInicio.value;
    const dataFim = taskFilterDataFim.value;

    let filtradas = [...tasks];

    if (statusFiltro) {
        filtradas = filtradas.filter(t => t.status === statusFiltro);
    } else {
        filtradas = filtradas.filter(t => t.status !== 'Encerrada');
    }

    if (dataInicio) {
        const inicio = new Date(dataInicio).setHours(0,0,0,0);
        filtradas = filtradas.filter(t => t.createdAt >= inicio);
    }
    if (dataFim) {
        const fim = new Date(dataFim).setHours(23,59,59,999);
        filtradas = filtradas.filter(t => t.createdAt <= fim);
    }

    filteredTasks = filtradas;
    renderizarTarefas();
}

function renderizarTarefas() {
    if (!filteredTasks.length) {
        tasksTableBody.innerHTML = '<tr><td colspan="5">Nenhuma tarefa encontrada.</td></tr>';
        return;
    }

    let html = '';
    filteredTasks.forEach(task => {
        const tempoTotal = obterTempoTotal(task);
        html += `
            <tr data-id="${task.id}">
                <td>${escapeHtml(task.title)}</td>
                <td>${escapeHtml(task.requester)}</td>
                <td>${task.status}</td>
                <td>${formatarTempo(tempoTotal)}</td>
                <td>
                    ${task.status === 'Pendente' ? `<button class="btn-start" data-id="${task.id}">▶️ Iniciar</button>` : ''}
                    ${task.status === 'Em andamento' ? `<button class="btn-pause" data-id="${task.id}">⏸️ Pausar</button>` : ''}
                    ${task.status === 'Em pausa' ? `<button class="btn-resume" data-id="${task.id}">▶️ Retomar</button>` : ''}
                    ${(task.status === 'Em andamento' || task.status === 'Em pausa') ? `<button class="btn-end" data-id="${task.id}">⏹️ Encerrar</button>` : ''}
                    <button class="btn-view" data-id="${task.id}">👁️ Ver</button>
                    <button class="btn-delete-task" data-id="${task.id}">🗑️ Apagar</button>
                </td>
            </tr>
        `;
    });
    tasksTableBody.innerHTML = html;

    document.querySelectorAll('.btn-start').forEach(btn => {
        btn.addEventListener('click', () => iniciarTarefa(parseInt(btn.getAttribute('data-id'))));
    });
    document.querySelectorAll('.btn-pause').forEach(btn => {
        btn.addEventListener('click', () => abrirModalComentario(parseInt(btn.getAttribute('data-id')), 'pause'));
    });
    document.querySelectorAll('.btn-resume').forEach(btn => {
        btn.addEventListener('click', () => retomarTarefa(parseInt(btn.getAttribute('data-id'))));
    });
    document.querySelectorAll('.btn-end').forEach(btn => {
        btn.addEventListener('click', () => abrirModalComentario(parseInt(btn.getAttribute('data-id')), 'end'));
    });
    document.querySelectorAll('.btn-view').forEach(btn => {
        btn.addEventListener('click', () => abrirModalVerTarefa(parseInt(btn.getAttribute('data-id'))));
    });
    document.querySelectorAll('.btn-delete-task').forEach(btn => {
        btn.addEventListener('click', () => deletarTarefa(parseInt(btn.getAttribute('data-id'))));
    });
}

function iniciarAtualizacaoTempos() {
    if (globalTaskUpdateInterval) clearInterval(globalTaskUpdateInterval);
    globalTaskUpdateInterval = setInterval(() => {
        const linhas = document.querySelectorAll('#tasksTableBody tr[data-id]');
        linhas.forEach(linha => {
            const id = parseInt(linha.getAttribute('data-id'));
            const task = tasks.find(t => t.id === id);
            if (task && task.status === 'Em andamento') {
                const tempoTotal = obterTempoTotal(task);
                const tdTempo = linha.querySelector('td:nth-child(4)');
                if (tdTempo) tdTempo.textContent = formatarTempo(tempoTotal);
            }
        });
    }, 1000);
}

function iniciarTarefa(id) {
    const task = tasks.find(t => t.id === id);
    if (!task || task.status !== 'Pendente') return;
    task.status = 'Em andamento';
    task.startTime = Date.now();
    task.history.push({ type: 'start', timestamp: task.startTime, note: 'Tarefa iniciada', elapsed: task.totalSeconds });
    salvarTasks();
    aplicarFiltrosTasks();
}

function pausarTarefa(id, comentario) {
    const task = tasks.find(t => t.id === id);
    if (!task || task.status !== 'Em andamento') return;
    if (task.startTime) {
        const elapsed = Date.now() - task.startTime;
        task.totalSeconds += Math.floor(elapsed / 1000);
        task.startTime = null;
    }
    task.status = 'Em pausa';
    const tempoAtual = task.totalSeconds;
    task.history.push({ type: 'pause', timestamp: Date.now(), note: comentario, elapsed: tempoAtual });
    salvarTasks();
    aplicarFiltrosTasks();
}

function retomarTarefa(id) {
    const task = tasks.find(t => t.id === id);
    if (!task || task.status !== 'Em pausa') return;
    task.status = 'Em andamento';
    task.startTime = Date.now();
    task.history.push({ type: 'resume', timestamp: task.startTime, note: 'Tarefa retomada', elapsed: task.totalSeconds });
    salvarTasks();
    aplicarFiltrosTasks();
}

function encerrarTarefa(id, comentario) {
    const task = tasks.find(t => t.id === id);
    if (!task || (task.status !== 'Em andamento' && task.status !== 'Em pausa')) return;
    if (task.startTime) {
        const elapsed = Date.now() - task.startTime;
        task.totalSeconds += Math.floor(elapsed / 1000);
        task.startTime = null;
    }
    task.status = 'Encerrada';
    task.endTime = Date.now();
    const tempoAtual = task.totalSeconds;
    task.history.push({ type: 'end', timestamp: task.endTime, note: comentario, elapsed: tempoAtual });
    salvarTasks();
    aplicarFiltrosTasks();
}

function deletarTarefa(id) {
    if (confirm('Tem certeza que deseja excluir esta tarefa permanentemente?')) {
        tasks = tasks.filter(t => t.id !== id);
        salvarTasks();
        aplicarFiltrosTasks();
    }
}

function abrirModalComentario(taskId, action) {
    pendingTaskAction = { taskId, action };
    const modal = document.getElementById('modalComentario');
    const titulo = document.getElementById('modalComentarioTitulo');
    titulo.innerText = action === 'pause' ? 'Comentário - Pausar tarefa' : 'Comentário - Encerrar tarefa';
    document.getElementById('comentarioTexto').value = '';
    modal.classList.add('active-modal');
}

function fecharModalComentario() {
    document.getElementById('modalComentario').classList.remove('active-modal');
    pendingTaskAction = null;
}

function salvarComentario() {
    const comentario = document.getElementById('comentarioTexto').value.trim();
    if (!comentario) {
        alert('O comentário é obrigatório.');
        return;
    }
    if (pendingTaskAction) {
        const { taskId, action } = pendingTaskAction;
        if (action === 'pause') {
            pausarTarefa(taskId, comentario);
        } else if (action === 'end') {
            encerrarTarefa(taskId, comentario);
        }
    }
    fecharModalComentario();
}

function abrirModalNovaTarefa() {
    if (modalNovaTarefa) modalNovaTarefa.remove();
    modalNovaTarefa = document.createElement('div');
    modalNovaTarefa.className = 'modal-overlay active-modal';
    modalNovaTarefa.innerHTML = `
        <div class="modal-container modal-gfc">
            <div class="modal-header"><h3>Adicionar tarefa</h3><button class="close-modal">&times;</button></div>
            <div class="modal-body">
                <div class="form-field"><label>Título da tarefa *</label><input type="text" id="taskTitle" required></div>
                <div class="form-field"><label>Solicitante *</label><input type="text" id="taskRequester" required></div>
                <div class="form-field"><label>Tipo de tarefa *</label>
                    <select id="taskType">
                        ${tiposTarefa.map(t => `<option value="${t}">${t}</option>`).join('')}
                    </select>
                </div>
                <div class="form-field"><label>Descrição</label><textarea id="taskDesc" rows="4" style="text-align: justify;"></textarea></div>
            </div>
            <div class="modal-footer"><button class="btn-secondary" id="cancelarNovaTarefa">Cancelar</button><button class="btn-primary" id="salvarNovaTarefa">Salvar</button></div>
        </div>
    `;
    document.body.appendChild(modalNovaTarefa);
    const fechar = () => modalNovaTarefa.remove();
    modalNovaTarefa.querySelector('.close-modal').addEventListener('click', fechar);
    modalNovaTarefa.querySelector('#cancelarNovaTarefa').addEventListener('click', fechar);
    modalNovaTarefa.querySelector('#salvarNovaTarefa').addEventListener('click', () => {
        const title = document.getElementById('taskTitle').value.trim();
        const requester = document.getElementById('taskRequester').value.trim();
        const type = document.getElementById('taskType').value;
        const description = document.getElementById('taskDesc').value.trim();
        if (!title || !requester) {
            alert('Preencha o título e o solicitante.');
            return;
        }
        const novaTarefa = {
            id: taskNextId++,
            title, requester, type, description,
            status: 'Pendente',
            totalSeconds: 0,
            startTime: null,
            createdAt: Date.now(),
            history: [{ type: 'create', timestamp: Date.now(), note: 'Tarefa criada', elapsed: 0 }]
        };
        tasks.push(novaTarefa);
        salvarTasks();
        aplicarFiltrosTasks();
        fechar();
    });
}

function abrirModalVerTarefa(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    if (modalVerTarefa) modalVerTarefa.remove();

    const tempoTotal = obterTempoTotal(task);
    const descricaoJustificada = task.description ? `<div style="text-align: justify;">${escapeHtml(task.description)}</div>` : '<em>Sem descrição</em>';
    const historicoHtml = task.history.map(h => {
        const data = new Date(h.timestamp).toLocaleString('pt-BR');
        const tempo = h.elapsed !== undefined ? ` (tempo acumulado: ${formatarTempo(h.elapsed)})` : '';
        return `<p>${data} - ${h.type.toUpperCase()}: ${escapeHtml(h.note)}${tempo}</p>`;
    }).join('');

    modalVerTarefa = document.createElement('div');
    modalVerTarefa.className = 'modal-overlay active-modal';
    modalVerTarefa.innerHTML = `
        <div class="modal-container modal-gfc" style="max-width: 600px;">
            <div class="modal-header"><h3>Detalhes da tarefa</h3><button class="close-modal">&times;</button></div>
            <div class="modal-body">
                <p><strong>Título:</strong> ${escapeHtml(task.title)}</p>
                <p><strong>Solicitante:</strong> ${escapeHtml(task.requester)}</p>
                <p><strong>Tipo:</strong> ${escapeHtml(task.type)}</p>
                <p><strong>Status:</strong> ${task.status}</p>
                <p><strong>Tempo total:</strong> ${formatarTempo(tempoTotal)}</p>
                <p><strong>Descrição:</strong></p>
                ${descricaoJustificada}
                <hr>
                <p><strong>Histórico:</strong></p>
                <div style="max-height: 200px; overflow-y: auto;">${historicoHtml}</div>
            </div>
            <div class="modal-footer">
                ${task.status === 'Encerrada' ? `<button class="btn-primary" id="imprimirDoModal">🖨️ Imprimir</button>` : ''}
                <button class="btn-secondary" id="fecharModalVer">Fechar</button>
            </div>
        </div>
    `;
    document.body.appendChild(modalVerTarefa);
    const fechar = () => modalVerTarefa.remove();
    modalVerTarefa.querySelector('.close-modal').addEventListener('click', fechar);
    modalVerTarefa.querySelector('#fecharModalVer').addEventListener('click', fechar);
    if (task.status === 'Encerrada') {
        modalVerTarefa.querySelector('#imprimirDoModal').addEventListener('click', () => {
            imprimirTarefa(task);
            fechar();
        });
    }
}

function imprimirTarefa(task) {
    const tempoTotal = obterTempoTotal(task);
    const descricaoJustificada = task.description ? `<div style="text-align: justify;">${escapeHtml(task.description)}</div>` : '<em>Sem descrição</em>';
    const historicoHtml = task.history.map(h => {
        const data = new Date(h.timestamp).toLocaleString('pt-BR');
        const tempo = h.elapsed !== undefined ? ` (tempo acumulado: ${formatarTempo(h.elapsed)})` : '';
        return `<li>${data} - ${h.type.toUpperCase()}: ${escapeHtml(h.note)}${tempo}</li>`;
    }).join('');
    const conteudo = `
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"><title>Relatório de Tarefa</title>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 2rem; }
            h1 { color: #1e3c72; }
            .info { margin-bottom: 1rem; color: #666; font-size: 0.9rem; }
            .desc { text-align: justify; margin: 1rem 0; }
            .history { margin-top: 1rem; border-top: 1px solid #ccc; padding-top: 1rem; }
        </style>
        </head>
        <body>
            <h1>Relatório de Tarefa</h1>
            <p><strong>Título:</strong> ${escapeHtml(task.title)}</p>
            <p><strong>Solicitante:</strong> ${escapeHtml(task.requester)}</p>
            <p><strong>Tipo:</strong> ${escapeHtml(task.type)}</p>
            <p><strong>Status:</strong> ${task.status}</p>
            <p><strong>Tempo total:</strong> ${formatarTempo(tempoTotal)}</p>
            <p><strong>Descrição:</strong></p>
            <div class="desc">${descricaoJustificada}</div>
            <div class="history">
                <strong>Histórico de execução:</strong>
                <ul>${historicoHtml}</ul>
            </div>
        </body>
        </html>
    `;
    const win = window.open('', '_blank');
    win.document.write(conteudo);
    win.document.close();
    win.print();
}

// ==================== NAVEGAÇÃO E INICIALIZAÇÃO ====================
function mostrarModuloProposta() {
    document.getElementById('propostaModule').classList.add('active-module');
    document.getElementById('gfcModule').classList.remove('active-module');
    document.getElementById('tasksModule').classList.remove('active-module');
    document.querySelectorAll('.sidebar-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector('.sidebar-btn[data-module="proposta"]').classList.add('active');
    if (globalTaskUpdateInterval) clearInterval(globalTaskUpdateInterval);
    atualizarStepsUI();
}

function mostrarModuloGfc() {
    document.getElementById('propostaModule').classList.remove('active-module');
    document.getElementById('gfcModule').classList.add('active-module');
    document.getElementById('tasksModule').classList.remove('active-module');
    document.querySelectorAll('.sidebar-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector('.sidebar-btn[data-module="gfc"]').classList.add('active');
    if (globalTaskUpdateInterval) clearInterval(globalTaskUpdateInterval);
    carregarGfcSales();
}

function mostrarModuloTarefas() {
    document.getElementById('propostaModule').classList.remove('active-module');
    document.getElementById('gfcModule').classList.remove('active-module');
    document.getElementById('tasksModule').classList.add('active-module');
    document.querySelectorAll('.sidebar-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector('.sidebar-btn[data-module="tarefas"]').classList.add('active');
    carregarTasks();
}

// Eventos
btnLogin.addEventListener("click", () => {
    const user = document.getElementById("loginUser").value.trim();
    const pass = document.getElementById("loginPassword").value;
    if (user === "" || pass === "") { alert("Preencha usuário e senha."); return; }
    loginScreen.style.display = "none";
    mainLayout.style.display = "flex";
    mostrarModuloProposta();
    itensProposta = [];
    dadosProposta = { empresa: "", validade: "", pontoFocal: "", refUsers: "", observacaoGeral: "", observacaoNegociacao: "" };
    carregarDadosInputs();
    renderTabelaItens();
    currentStep = 1;
    atualizarStepsUI();
});

btnLogoutSidebar.addEventListener("click", () => {
    mainLayout.style.display = "none";
    loginScreen.style.display = "flex";
    document.getElementById("loginUser").value = "";
    document.getElementById("loginPassword").value = "";
    if (globalTaskUpdateInterval) clearInterval(globalTaskUpdateInterval);
});

document.querySelectorAll('.sidebar-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const module = btn.getAttribute('data-module');
        if (module === 'proposta') mostrarModuloProposta();
        else if (module === 'gfc') mostrarModuloGfc();
        else if (module === 'tarefas') mostrarModuloTarefas();
    });
});

cancelarDados.addEventListener("click", cancelarProposta);
avancarDados.addEventListener("click", avancarStep1);
voltarItens.addEventListener("click", voltarStep2);
avancarItens.addEventListener("click", avancarStep2);
voltarResumo.addEventListener("click", voltarStep3);
imprimirResumo.addEventListener("click", imprimirResumoFunc);
abrirListaServicosBtn.addEventListener("click", abrirModalServicos);
closeServicosModal.addEventListener("click", closeAllModals);
fecharServicosBtn.addEventListener("click", closeAllModals);
closeValoresModal.addEventListener("click", closeAllModals);
cancelarValoresBtn.addEventListener("click", () => { pendingServicoNome = null; closeAllModals(); });
salvarItemBtn.addEventListener("click", salvarItemProposta);
if (limparItensBtn) {
    limparItensBtn.addEventListener("click", () => {
        if (itensProposta.length === 0) { alert("Não há itens para limpar."); return; }
        if (confirm("Tem certeza que deseja remover TODOS os itens da proposta?")) { itensProposta = []; renderTabelaItens(); }
    });
}
closeAllModals();

btnNovaVenda.addEventListener("click", abrirModalNovaVenda);
btnReceberComissao.addEventListener("click", abrirModalReceberComissao);
btnAplicarFiltros.addEventListener("click", aplicarFiltros);
btnLimparFiltros.addEventListener("click", () => {
    filtroVencInicio.value = '';
    filtroVencFim.value = '';
    filtroStatus.value = '';
    aplicarFiltros();
});
selecionarTodosCheck.addEventListener("change", (e) => {
    document.querySelectorAll('.selecionarVenda:not(:disabled)').forEach(cb => cb.checked = e.target.checked);
});
if (btnRelatorioGfc) btnRelatorioGfc.addEventListener("click", imprimirRelatorioGfc);

btnNovaTarefa.addEventListener("click", abrirModalNovaTarefa);
document.getElementById('cancelarComentario').addEventListener('click', fecharModalComentario);
document.getElementById('salvarComentario').addEventListener('click', salvarComentario);
document.getElementById('closeComentarioModal').addEventListener('click', fecharModalComentario);
btnAplicarFiltrosTasks.addEventListener("click", aplicarFiltrosTasks);
btnLimparFiltrosTasks.addEventListener("click", () => {
    taskFilterStatus.value = "";
    taskFilterDataInicio.value = "";
    taskFilterDataFim.value = "";
    aplicarFiltrosTasks();
});