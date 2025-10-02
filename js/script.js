// Exemplo de uso da API ViaCEP
fetch('https://viacep.com.br/ws/01001000/json/')
  .then(response => response.json())
  .then(data => console.log(data));

// Função para buscar o CEP
const form = document.getElementById('cep-form');
const resultado = document.getElementById('resultado');
const loader = document.getElementById('loader');

// Adiciona um listener para o evento de submissão do formulário
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const cep = document.getElementById('cep').value.replace(/\D/g, '');

  if (cep.length !== 8) {
    resultado.innerHTML = '<p style="color:red;">CEP inválido. Digite 8 números.</p>';
    return;
  }

  resultado.innerHTML = '<div class="loader"></div>';

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const data = await response.json();

    if (data.erro) {
      resultado.innerHTML = '<p style="color:red;">CEP não encontrado.</p>';
    } else {
      resultado.innerHTML = `
        <p><strong>Logradouro:</strong> ${data.logradouro}</p>
        <p><strong>Bairro:</strong> ${data.bairro}</p>
        <p><strong>Cidade:</strong> ${data.localidade}</p>
        <p><strong>Estado:</strong> ${data.uf}</p>
      `;
    }
  } catch (error) {
    resultado.innerHTML = '<p style="color:red;">Erro ao buscar o CEP.</p>';
  }
});

// validação do campo CEP para aceitar apenas números e ter exatamente 8 dígitos
const cepInput = document.getElementById('cep');

// Adiciona um listener para o evento de input no campo CEP
cepInput.addEventListener('input', () => {
  const cep = cepInput.value.replace(/\D/g, '');
  if (cep.length === 8) {
    cepInput.classList.add('valid');
    cepInput.classList.remove('invalid');
  } else {
    cepInput.classList.add('invalid');
    cepInput.classList.remove('valid');
  }
});

// salvar os CEPs pesquisados no localStorage e exibir em uma lista abaixo do formulário
function salvarHistorico(cep) {
  let historico = JSON.parse(localStorage.getItem('historico')) || [];
  if (!historico.includes(cep)) {
    historico.push(cep);
    localStorage.setItem('historico', JSON.stringify(historico));
  }
}

// Exibir o histórico ao carregar a página
document.addEventListener('DOMContentLoaded', mostrarHistorico);
function mostrarHistorico() {
  const historico = JSON.parse(localStorage.getItem('historico')) || [];
  if (historico.length > 0) {
    resultado.innerHTML += `<h3>Histórico:</h3><ul>${historico.map(c => `<li>${c}</li>`).join('')}</ul>`;
  }
}