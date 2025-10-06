// busqueCEP - JavaScript para busca de CEP
document.addEventListener('DOMContentLoaded', function() {
    // Elementos principais
    const form = document.getElementById('cep-form');
    const resultado = document.getElementById('resultado');
    const cepInput = document.getElementById('cep');
    const submitButton = document.querySelector('#cep-form button[type="submit"]');
    
    console.log('🚀 busqueCEP iniciado');

    // Evento de submit do formulário
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await buscarCEP();
    });

    // Evento de clique no botão
    submitButton.addEventListener('click', async (e) => {
        e.preventDefault();
        await buscarCEP();
    });

    // Duplo clique para limpar
    submitButton.addEventListener('dblclick', (e) => {
        e.preventDefault();
        limparBusca();
    });

    // Efeitos visuais no botão
    submitButton.addEventListener('mouseenter', () => {
        if (!submitButton.disabled) {
            submitButton.style.transform = 'translateY(-2px)';
        }
    });

    submitButton.addEventListener('mouseleave', () => {
        submitButton.style.transform = 'translateY(0)';
    });

    // Formatação do CEP durante a digitação
    cepInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        
        // Formata com hífen
        if (value.length > 5) {
            value = value.replace(/(\d{5})(\d{0,3})/, '$1-$2');
        }
        
        e.target.value = value;
        
        // Validação visual
        const cepNumerico = value.replace(/\D/g, '');
        if (cepNumerico.length === 8) {
            cepInput.classList.add('valid');
            cepInput.classList.remove('invalid');
        } else {
            cepInput.classList.add('invalid');
            cepInput.classList.remove('valid');
        }
    });

    // Buscar com Enter
    cepInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            buscarCEP();
        }
    });

    // Função principal de busca
    async function buscarCEP() {
        const cep = cepInput.value.replace(/\D/g, '');
        
        console.log('🔍 Buscando CEP:', cep);

        // Validação
        if (cep.length !== 8) {
            mostrarMensagem('CEP inválido. Digite 8 números.', 'erro');
            cepInput.focus();
            return;
        }

        // Mostra loader e desabilita botão
        resultado.innerHTML = '<div class="loader"></div>';
        desabilitarBotao();

        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            
            if (!response.ok) {
                throw new Error(`Erro na requisição: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('📦 Resposta da API:', data);

            if (data.erro) {
                mostrarMensagem('CEP não encontrado.', 'erro');
            } else {
                exibirEndereco(data);
                salvarHistorico(data);
                mostrarHistorico();
            }
            
        } catch (error) {
            console.error('❌ Erro:', error);
            mostrarMensagem('Erro ao buscar o CEP. Verifique sua conexão.', 'erro');
        } finally {
            habilitarBotao();
        }
    }

    // Controlar estado do botão
    function desabilitarBotao() {
        submitButton.disabled = true;
        submitButton.textContent = 'Buscando...';
        submitButton.style.opacity = '0.7';
        submitButton.style.cursor = 'not-allowed';
    }

    function habilitarBotao() {
        submitButton.disabled = false;
        submitButton.textContent = 'Buscar CEP';
        submitButton.style.opacity = '1';
        submitButton.style.cursor = 'pointer';
    }

    // Exibir mensagens
    function mostrarMensagem(mensagem, tipo) {
        const classe = tipo === 'erro' ? 'mensagem-erro' : 'mensagem-sucesso';
        resultado.innerHTML = `<div class="${classe}">${mensagem}</div>`;
    }

    // Exibir endereço encontrado
    function exibirEndereco(data) {
        resultado.innerHTML = `
            <div class="endereco-encontrado">
                <h3 style="color: var(--cor-primaria); margin-bottom: 20px; text-align: center;">
                    ✅ Endereço Encontrado
                </h3>
                <div class="dados-endereco">
                    <div class="info-item">
                        <span class="label">CEP:</span>
                        <span class="valor">${formatarCEP(data.cep)}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Logradouro:</span>
                        <span class="valor">${data.logradouro || 'Não informado'}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Bairro:</span>
                        <span class="valor">${data.bairro || 'Não informado'}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Cidade:</span>
                        <span class="valor">${data.localidade}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Estado:</span>
                        <span class="valor">${data.uf}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">DDD:</span>
                        <span class="valor">${data.ddd || 'Não informado'}</span>
                    </div>
                </div>
                <button class="btn-nova-busca" onclick="novaBusca()" style="margin-top: 20px; width: 100%; padding: 12px; background: var(--cor-secundaria); color: white; border: none; border-radius: 6px; cursor: pointer; font-family: 'Poppins', sans-serif;">
                    🔄 Nova Busca
                </button>
            </div>
        `;
    }

    // Formatar CEP
    function formatarCEP(cep) {
        if (!cep) return '';
        const cepLimpo = cep.replace(/\D/g, '');
        return cepLimpo.replace(/(\d{5})(\d{3})/, '$1-$2');
    }

    // Limpar busca
    function limparBusca() {
        cepInput.value = '';
        cepInput.focus();
        resultado.innerHTML = '';
        cepInput.classList.remove('valid', 'invalid');
        console.log('🔄 Campo limpo');
    }

    // Histórico de consultas
    function salvarHistorico(dadosCep) {
        let historico = JSON.parse(localStorage.getItem('historicoCeps')) || [];
        
        // Remove duplicatas
        historico = historico.filter(item => item.cep !== dadosCep.cep);
        
        // Adiciona data
        dadosCep.dataConsulta = new Date().toLocaleString('pt-BR');
        historico.unshift(dadosCep);
        
        // Mantém apenas últimos 5
        if (historico.length > 5) {
            historico = historico.slice(0, 5);
        }
        
        localStorage.setItem('historicoCeps', JSON.stringify(historico));
    }

    // Mostrar histórico
    function mostrarHistorico() {
        const historico = JSON.parse(localStorage.getItem('historicoCeps')) || [];
        let historicoContainer = document.getElementById('historico-container');
        
        if (!historicoContainer) {
            historicoContainer = document.createElement('div');
            historicoContainer.id = 'historico-container';
            document.querySelector('main').appendChild(historicoContainer);
        }
        
        if (historico.length > 0) {
            historicoContainer.innerHTML = `
                <div class="historico-section">
                    <h3>📚 Últimas Consultas</h3>
                    <div class="historico-lista">
                        ${historico.map(cep => `
                            <div class="historico-item" onclick="preencherCEP('${cep.cep}')">
                                <div class="historico-cep">${formatarCEP(cep.cep)}</div>
                                <div class="historico-endereco">
                                    ${cep.logradouro || ''} ${cep.bairro ? `- ${cep.bairro}` : ''}
                                </div>
                                <div class="historico-cidade">${cep.localidade} - ${cep.uf}</div>
                                <div class="historico-data">${cep.dataConsulta}</div>
                            </div>
                        `).join('')}
                    </div>
                    <button class="btn-limpar" onclick="limparHistorico()">
                        🗑️ Limpar Histórico
                    </button>
                </div>
            `;
        } else {
            historicoContainer.innerHTML = `
                <div class="historico-section">
                    <h3>📚 Últimas Consultas</h3>
                    <p class="historico-vazio">Nenhuma consulta realizada ainda.</p>
                </div>
            `;
        }
    }

    // Inicialização
    function inicializar() {
        cepInput.placeholder = 'Digite o CEP (ex: 01001-000)';
        cepInput.focus();
        mostrarHistorico();
        submitButton.title = 'Clique para buscar • Duplo clique para limpar';
        
        // Teste da API
        testarAPI();
    }

    // Testar API
    async function testarAPI() {
        try {
            const response = await fetch('https://viacep.com.br/ws/01001000/json/');
            const data = await response.json();
            
            if (data.cep) {
                console.log('✅ API ViaCEP está funcionando!');
            }
        } catch (error) {
            console.error('❌ Erro ao testar API:', error);
        }
    }

    // Inicializar a aplicação
    inicializar();
});

// Funções globais para uso nos eventos HTML
function novaBusca() {
    const cepInput = document.getElementById('cep');
    const resultado = document.getElementById('resultado');
    
    cepInput.value = '';
    cepInput.focus();
    resultado.innerHTML = '';
    cepInput.classList.remove('valid', 'invalid');
}

function preencherCEP(cep) {
    const cepInput = document.getElementById('cep');
    cepInput.value = cep.replace(/(\d{5})(\d{3})/, '$1-$2');
    cepInput.focus();
    cepInput.select();
    cepInput.classList.add('valid');
    cepInput.classList.remove('invalid');
}

function limparHistorico() {
    if (confirm('Tem certeza que deseja limpar o histórico de consultas?')) {
        localStorage.removeItem('historicoCeps');
        
        // Recarregar o histórico
        const historicoContainer = document.getElementById('historico-container');
        if (historicoContainer) {
            historicoContainer.innerHTML = `
                <div class="historico-section">
                    <h3>📚 Últimas Consultas</h3>
                    <p class="historico-vazio">Nenhuma consulta realizada ainda.</p>
                </div>
            `;
        }
        
        // Mostrar mensagem de sucesso
        const resultado = document.getElementById('resultado');
        resultado.innerHTML = '<div class="mensagem-sucesso">Histórico limpo com sucesso!</div>';
        
        setTimeout(() => {
            resultado.innerHTML = '';
        }, 3000);
    }
}

// Adicionar estilos ao documento
const styleSheet = document.createElement('style');
styleSheet.textContent = dynamicStyles;
document.head.appendChild(styleSheet);