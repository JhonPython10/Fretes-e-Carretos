let currentStep = 1;
const totalSteps = 9;

let dataIndefinida = false;

const ENDERECO_BASE =
  'Rua 7 de Setembro, 38, Bairro da Paz, Salvador, BA, Brasil';

// Substitua pela sua chave real. Não publique este arquivo com a chave preenchida.
const GOOGLE_MAPS_API_KEY = 'AIzaSyCVOtyZSUV_1bme-3nJd7fepUKCrLDPnkg';

function showStep(step) {
  document.querySelectorAll('.step').forEach((elemento) => {
    elemento.classList.remove('active');
  });

  const etapaAtual = document.getElementById(`step-${step}`);

  if (etapaAtual) {
    etapaAtual.classList.add('active');
  }

  const progresso = (step / totalSteps) * 100;

  document.getElementById('progress-fill').style.width = `${progresso}%`;

  document.getElementById('step-indicator').innerText =
    `Etapa ${step} de ${totalSteps}`;

  currentStep = step;

  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
}

function nextStep() {
  if (currentStep < totalSteps) {
    showStep(currentStep + 1);
  }
}

function prevStep() {
  if (currentStep > 1) {
    showStep(currentStep - 1);
  }
}

function irParaEtapa(numeroDaEtapa) {
  showStep(numeroDaEtapa);
}

function validarEtapa2() {
  const nome = document.getElementById('nome').value.trim();
  const telefone = document.getElementById('telefone').value.trim();

  if (nome === '') {
    alert('Digite seu nome antes de continuar.');
    document.getElementById('nome').focus();
    return;
  }

  if (telefone === '') {
    alert('Digite seu número de WhatsApp antes de continuar.');
    document.getElementById('telefone').focus();
    return;
  }

  nextStep();
}

function selecionarDataIndefinida() {
  const campoData = document.getElementById('dataFrete');
  const botao = document.getElementById('btn-data-indefinida');
  const mensagem = document.getElementById('data-selecionada');

  dataIndefinida = !dataIndefinida;

  if (dataIndefinida) {
    campoData.value = '';
    campoData.disabled = true;

    botao.classList.add('selected');
    mensagem.innerText = 'Você informou que ainda não definiu a data.';
  } else {
    campoData.disabled = false;

    botao.classList.remove('selected');
    mensagem.innerText = '';
  }
}

function validarEtapa3() {
  const data = document.getElementById('dataFrete').value;

  if (data === '' && !dataIndefinida) {
    alert('Escolha uma data ou selecione "Ainda não defini a data".');
    return;
  }

  nextStep();
}

let contadorParadas = 0;

function configurarBuscaCep(prefixo) {
  const campoCep = document.getElementById(`${prefixo}-cep`);
  const status = document.getElementById(`${prefixo}-status-cep`);

  if (!campoCep) return;

  campoCep.addEventListener('blur', () => buscarCep(prefixo));
  campoCep.addEventListener('keydown', (evento) => {
    if (evento.key === 'Enter') {
      evento.preventDefault();
      buscarCep(prefixo);
    }
  });

  async function buscarCep() {
    const cep = campoCep.value.replace(/\D/g, '');

    if (!cep) {
      if (status) status.textContent = '';
      return;
    }

    if (cep.length !== 8) {
      if (status) status.textContent = 'Digite um CEP válido com 8 números.';
      return;
    }

    if (status) status.textContent = 'Consultando CEP...';

    try {
      const resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`);

      if (!resposta.ok) throw new Error('Falha na consulta');

      const dados = await resposta.json();

      if (dados.erro) {
        if (status)
          status.textContent =
            'CEP não encontrado. Confira ou preencha o endereço manualmente.';
        return;
      }

      const rua = document.getElementById(`${prefixo}-rua`);
      const bairro = document.getElementById(`${prefixo}-bairro`);
      const cidade = document.getElementById(`${prefixo}-cidade`);
      const estado = document.getElementById(`${prefixo}-estado`);

      if (rua && dados.logradouro) rua.value = dados.logradouro;
      if (bairro && dados.bairro) bairro.value = dados.bairro;
      if (cidade && dados.localidade) cidade.value = dados.localidade;
      if (estado && dados.uf) estado.value = dados.uf;

      if (status) {
        status.textContent =
          'Endereço preenchido pelo CEP. Informe o número da casa.';
      }
    } catch (erro) {
      console.error('Erro ao consultar ViaCEP:', erro);
      if (status)
        status.textContent =
          'Não foi possível consultar o CEP. Preencha o endereço manualmente.';
    }
  }
}

function configurarBuscaCepParada(numero) {
  configurarBuscaCep(`parada-${numero}`);
}

function adicionarParada() {
  contadorParadas += 1;

  const numero = contadorParadas;
  const parada = document.createElement('div');

  parada.className = 'parada-item';
  parada.dataset.parada = numero;

  parada.innerHTML = `
    <hr />
    <h3 class="section-subtitle">Parada ${numero}</h3>

    <label for="parada-${numero}-cep">CEP (opcional)</label>
<input
  type="text"
  id="parada-${numero}-cep"
  placeholder="Ex.: 40000-000"
  inputmode="numeric"
  autocomplete="postal-code"
/>
<p id="parada-${numero}-status-cep" class="helper-note" aria-live="polite"></p>

    <label for="parada-${numero}-rua">Rua</label>
    <input
      type="text"
      id="parada-${numero}-rua"
      placeholder="Ex.: Rua das Flores"
    />

    <label for="parada-${numero}-numero">Número</label>
    <input
      type="text"
      id="parada-${numero}-numero"
      placeholder="Ex.: 123"
    />

    <label for="parada-${numero}-bairro">Bairro</label>
    <input
      type="text"
      id="parada-${numero}-bairro"
      placeholder="Ex.: Centro"
    />

    <label for="parada-${numero}-cidade">Cidade</label>
<input
  type="text"
  id="parada-${numero}-cidade"
  value="Salvador"
  placeholder="Ex.: Feira de Santana"
/>

<label for="parada-${numero}-estado">Estado (UF)</label>
<input
  type="text"
  id="parada-${numero}-estado"
  value="BA"
  maxlength="2"
  placeholder="Ex.: BA"
/>

    <button
      type="button"
      class="btn-secondary"
      onclick="removerParada(${numero})"
    >
      Remover parada ${numero}
    </button>
  `;

  document.getElementById('paradas-container').appendChild(parada);

  configurarBuscaCepParada(numero);
}

configurarBuscaCep('origem');
configurarBuscaCep('destino');

function removerParada(numero) {
  const parada = document.querySelector(
    `.parada-item[data-parada="${numero}"]`,
  );

  if (parada) {
    parada.remove();
  }
}

function obterEnderecosParadas() {
  return [...document.querySelectorAll('.parada-item')].map((parada) => {
    const numero = parada.dataset.parada;

    const rua = document.getElementById(`parada-${numero}-rua`).value.trim();
    const numeroEndereco = document
      .getElementById(`parada-${numero}-numero`)
      .value.trim();
    const bairro = document
      .getElementById(`parada-${numero}-bairro`)
      .value.trim();

    const cidade = document
      .getElementById(`parada-${numero}-cidade`)
      .value.trim();
    const estado = document
      .getElementById(`parada-${numero}-estado`)
      .value.trim();

    return {
      numero,
      rua,
      numeroEndereco,
      bairro,
      cidade,
      estado,
      endereco: [
        [rua, numeroEndereco].filter(Boolean).join(', '),
        bairro,
        cidade,
        estado,
      ]
        .filter(Boolean)
        .join(' — '),
    };
  });
}

function montarEnderecoMaps(prefixo) {
  const rua = document.getElementById(`${prefixo}-rua`).value.trim();
  const numero = document.getElementById(`${prefixo}-numero`).value.trim();
  const bairro = document.getElementById(`${prefixo}-bairro`).value.trim();
  const cidade = document.getElementById(`${prefixo}-cidade`).value.trim();
  const estado = document.getElementById(`${prefixo}-estado`).value.trim();

  if (!rua || !bairro || !cidade || !estado) {
    return '';
  }

  const endereco = numero ? `${rua}, ${numero}` : rua;

  return `${endereco}, ${bairro}, ${cidade}, ${estado}, Brasil`;
}

function montarEnderecoParadaMaps(parada) {
  if (!parada.rua || !parada.bairro || !parada.cidade || !parada.estado) {
    return '';
  }

  const endereco = parada.numeroEndereco
    ? `${parada.rua}, ${parada.numeroEndereco}`
    : parada.rua;

  return `${endereco}, ${parada.bairro}, ${parada.cidade}, ${parada.estado}, Brasil`;
}

async function calcularRotaAutomatica() {
  const statusEl = document.getElementById('status-rota-maps');
  const botaoCalcular = document.getElementById('btn-calcular-estimativa');

  if (botaoCalcular) {
    botaoCalcular.disabled = true;
  }

  const origemEndereco = montarEnderecoMaps('origem');
  const destinoEndereco = montarEnderecoMaps('destino');

  if (!origemEndereco || !destinoEndereco) {
    if (statusEl) {
      statusEl.textContent =
        'Endereços incompletos. Volte à Etapa 4 e confira os campos.';
    }
    return;
  }

  const paradas = obterEnderecosParadas();

  const enderecosParadas = paradas
    .filter((parada) => parada.rua && parada.bairro)
    .map((parada) => montarEnderecoParadaMaps(parada));

  const intermediates = [
    { address: origemEndereco },
    ...enderecosParadas.map((endereco) => ({ address: endereco })),
    { address: destinoEndereco },
  ];

  const corpoRequisicao = {
    origin: { address: ENDERECO_BASE },
    destination: { address: ENDERECO_BASE },
    intermediates,
    travelMode: 'DRIVE',
    routingPreference: 'TRAFFIC_AWARE',
    units: 'METRIC',
  };

  if (statusEl) {
    statusEl.textContent = 'Calculando a rota, aguarde um instante...';
  }

  try {
    const resposta = await fetch(
      'https://routes.googleapis.com/directions/v2:computeRoutes',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
          'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters',
        },
        body: JSON.stringify(corpoRequisicao),
      },
    );

    if (!resposta.ok) {
      const detalhe = await resposta.text();
      console.error('Erro Routes API:', resposta.status, detalhe);
      throw new Error(`Erro Routes API ${resposta.status}: ${detalhe}`);
    }

    const dados = await resposta.json();

    if (!dados.routes || dados.routes.length === 0) {
      throw new Error('Nenhuma rota encontrada.');
    }

    const rota = dados.routes[0];
    const distanciaKm = rota.distanceMeters / 1000;
    const duracaoSegundos = parseInt(rota.duration.replace('s', ''), 10);
    const duracaoMinutos = Math.round(duracaoSegundos / 60);

    document.getElementById('distancia-total').value = distanciaKm.toFixed(1);
    document.getElementById('tempo-percurso').value = duracaoMinutos;

    if (statusEl) {
      statusEl.textContent = 'Rota calculada. Você já pode continuar.';
    }

    if (botaoCalcular) {
      botaoCalcular.disabled = false;
    }
  } catch (erro) {
    console.error('Falha ao calcular a rota:', erro);

    if (statusEl) {
      statusEl.textContent =
        'Não foi possível calcular a rota. Abra o console do navegador para ver o erro detalhado.';
    }
  } finally {
    if (botaoCalcular) {
      botaoCalcular.disabled = false;
    }
  }
}

function validarEtapa4() {
  const origemRua = document.getElementById('origem-rua').value.trim();
  const origemBairro = document.getElementById('origem-bairro').value.trim();
  const destinoRua = document.getElementById('destino-rua').value.trim();
  const destinoBairro = document.getElementById('destino-bairro').value.trim();

  if (origemRua === '') {
    alert('Informe a rua de saída.');
    document.getElementById('origem-rua').focus();
    return;
  }

  if (origemBairro === '') {
    alert('Informe o bairro de saída.');
    document.getElementById('origem-bairro').focus();
    return;
  }

  if (destinoRua === '') {
    alert('Informe a rua de destino.');
    document.getElementById('destino-rua').focus();
    return;
  }

  if (destinoBairro === '') {
    alert('Informe o bairro de destino.');
    document.getElementById('destino-bairro').focus();
    return;
  }

  const paradas = obterEnderecosParadas();

  for (const parada of paradas) {
    if (!parada.rua || !parada.bairro) {
      alert(
        `Preencha a rua e o bairro da parada ${parada.numero}, ou remova essa parada.`,
      );

      document.getElementById(`parada-${parada.numero}-rua`).focus();

      return;
    }
  }

  preencherResumo();
  nextStep();
}

function formatarData(data) {
  const partes = data.split('-');

  if (partes.length !== 3) {
    return data;
  }

  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function preencherResumo() {
  const nome = document.getElementById('nome').value;
  const telefone = document.getElementById('telefone').value;
  const data = document.getElementById('dataFrete').value;

  const origemRua = document.getElementById('origem-rua').value;
  const origemNumero = document.getElementById('origem-numero').value;
  const origemBairro = document.getElementById('origem-bairro').value;

  const destinoRua = document.getElementById('destino-rua').value;
  const destinoNumero = document.getElementById('destino-numero').value;
  const destinoBairro = document.getElementById('destino-bairro').value;

  document.getElementById('resumo-cliente').innerText =
    `${nome} — WhatsApp: ${telefone}`;

  if (dataIndefinida) {
    document.getElementById('resumo-data').innerText =
      'Ainda não defini a data';
  } else {
    document.getElementById('resumo-data').innerText = formatarData(data);
  }

  const origemCompleta = [
    origemRua,
    origemNumero ? `, ${origemNumero}` : '',
    ` — ${origemBairro}`,
  ].join('');

  const destinoCompleto = [
    destinoRua,
    destinoNumero ? `, ${destinoNumero}` : '',
    ` — ${destinoBairro}`,
  ].join('');

  const textoParadas = obterEnderecosParadas()
    .map((parada, indice) => `Parada ${indice + 1}: ${parada.endereco}`)
    .join('\n');

  document.getElementById('resumo-locais').innerText =
    `Saída: ${origemCompleta}\n` +
    (textoParadas ? `${textoParadas}\n` : '') +
    `Destino: ${destinoCompleto}`;
}

const itensCatalogo = {
  sala: [
    'Sofá',
    'Rack',
    'TV',
    'Mesa',
    'Cadeira',
    'Estante',
    'Tapete',
    'Poltrona',
    'Painel',
    'Sapateira',
    'Caixas/sacolas',
  ],

  quarto: [
    'Cama',
    'Colchão',
    'Guarda-roupa montado',
    'Guarda-roupa desmontado',
    'Cômoda',
    'Criado-mudo',
    'Espelho',
    'Baú',
    'Cadeira de computador',
    'Escrivaninha',
    'Computador',
    'Caixas/sacolas',
    'Ventilador',
    'Ar Condicionado',
  ],

  cozinha: [
    'Geladeira',
    'Fogão',
    'Micro-ondas',
    'Mesa',
    'Cadeira',
    'Armário',
    'Botijão',
    'Air fryer',
    'Forno elétrico',
    'Freezer vertical',
    'Freezer horizontal',
    'Caixas/sacolas',
  ],

  'area-servico': [
    'Máquina de lavar',
    'Centrífuga',
    'Tanquinho',
    'Freezer',
    'Varal',
    'Cesto',
    'Caixas/sacolas',
  ],

  banheiro: ['Armário', 'Espelho', 'Box', 'Acessórios', 'Caixas/sacolas'],

  garagem: [
    'Bicicleta',
    'Ferramentas',
    'Pneus',
    'Motor',
    'Escada',
    'Caixas/sacolas',
  ],

  escritorio: [
    'Mesa de escritório',
    'Cadeira de escritório',
    'Computador',
    'Impressora',
    'Arquivo',
    'Estante',
    'Armário',
    'Gaveteiro',
    'Caixas/sacolas',
  ],

  loja: [
    'Expositor',
    'Balcão',
    'Prateleira',
    'Manequim',
    'Vitrine',
    'Arara',
    'Caixa registradora',
    'Mercadorias em caixas',
    'Palete',
    'Mesas',
    'Cadeiras',
    'Caixas/sacolas',
  ],

  construcao: [
    'Caixa de piso de 30 kg',
    'Caixa de piso de 45 kg',
    'Saco de argamassa',
    'Saco de cimento',
    'Saco de areia',
    'Tijolos',
    'Palete de tijolos',
    'Telha de barro',
    'Telha de concreto',
    'Telha Eternit',
    'Telha de zinco',
    'Telha plástica',
    'Calha de zinco',
    'Calha plástica',
    'Vergalhão',
    'Cano PVC',
    'Tinta',
    'Rejunte',
    'Massa corrida',
    'Gesso',
    'Blocos',
    'Madeira',
    'Porta',
    'Janela',
    'Ferramentas',
  ],

  descarte: [
    'Saco de entulho pequeno',
    'Saco de entulho médio',
    'Saco de entulho grande',
    'Restos de obra — volume pequeno',
    'Restos de obra — volume médio',
    'Restos de obra — volume alto',
    'Móvel para descarte',
    'Eletrodoméstico para descarte',
    'Madeira',
    'Papelão',
    'Metal',
    'Materiais misturados',
  ],

  especiais: [
    'Animal pequeno',
    'Animal médio',
    'Animal grande',
    'Planta pequena',
    'Planta média',
    'Planta grande',
    'Vidro',
    'Espelho grande',
    'Instrumento musical',
    'Objeto frágil',
    'Objeto com óleo',
    'Objeto com tinta',
  ],
};

const itensSelecionados = {};

const categoriaPesoItens = {
  // Leves — 1 minuto
  TV: 'leve',
  Cadeira: 'leve',
  Tapete: 'leve',
  Poltrona: 'leve',
  Ventilador: 'leve',
  'Forno elétrico': 'leve',
  'Caixas/sacolas': 'leve',
  'Criado-mudo': 'leve',
  Espelho: 'leve',
  Computador: 'leve',
  Botijão: 'leve',
  'Micro-ondas': 'leve',
  Tanquinho: 'leve',
  Sapateira: 'leve',
  Acessórios: 'leve',
  Cesto: 'leve',
  'Produtos de limpeza': 'leve',
  Varal: 'leve',
  Ferramentas: 'leve',
  Gaveteiro: 'leve',
  'Caixa registradora': 'leve',
  Arara: 'leve',
  Manequim: 'leve',
  'Saco de argamassa': 'leve',
  'Saco de cimento': 'leve',
  'Saco de areia': 'leve',
  Rejunte: 'leve',
  Tinta: 'leve',
  'Massa corrida': 'leve',
  Gesso: 'leve',
  'Cano PVC': 'leve',
  Vergalhão: 'leve',
  'Calha plástica': 'leve',
  'Calha de zinco': 'leve',
  'Telha plástica': 'leve',
  'Telha de zinco': 'leve',
  'Telha Eternit': 'leve',
  'Saco de entulho pequeno': 'leve',
  'Saco de entulho médio': 'leve',
  'Saco de entulho grande': 'leve',
  Papelão: 'leve',
  Metal: 'leve',
  'Materiais misturados': 'leve',
  'Animal pequeno': 'leve',
  'Planta pequena': 'leve',
  Vidro: 'leve',
  'Objeto frágil': 'leve',
  'Objeto com óleo': 'leve',
  'Objeto com tinta': 'leve',
  'Instrumento musical': 'leve',
  'Air fryer': 'leve',

  // Médios — 4 minutos
  Mesa: 'medio',
  Fogão: 'medio',
  Rack: 'medio',
  Painel: 'medio',
  Colchão: 'medio',
  Cama: 'medio',
  Baú: 'medio',
  Escrivaninha: 'medio',
  'Máquina de lavar': 'medio',
  Box: 'medio',
  Armário: 'medio',
  'Cadeira de computador': 'medio',
  'Cadeira de escritório': 'medio',
  'Mesa de escritório': 'medio',
  Impressora: 'medio',
  Arquivo: 'medio',
  Estante: 'medio',
  'Caixa de piso de 30 kg': 'medio',
  'Freezer vertical': 'medio',
  'Freezer horizontal': 'medio',
  Bicicleta: 'medio',
  Pneus: 'medio',
  Motor: 'medio',
  Escada: 'medio',
  Expositor: 'medio',
  Balcão: 'medio',
  Prateleira: 'medio',
  Vitrine: 'medio',
  Palete: 'medio',
  Porta: 'medio',
  Janela: 'medio',
  Madeira: 'medio',
  Blocos: 'medio',
  'Telha de barro': 'medio',
  'Telha de concreto': 'medio',
  'Restos de obra — volume pequeno': 'medio',
  'Restos de obra — volume médio': 'medio',
  'Móvel para descarte': 'medio',
  'Eletrodoméstico para descarte': 'medio',
  'Animal médio': 'medio',
  'Planta média': 'medio',
  'Espelho grande': 'medio',
  'Mercadorias em caixas': 'medio',
  Mesas: 'medio',
  Cadeiras: 'medio',

  // Pesados — 8 minutos
  Sofá: 'pesado',
  Geladeira: 'pesado',
  'Guarda-roupa montado': 'pesado',
  'Guarda-roupa desmontado': 'pesado',
  Cômoda: 'pesado',
  Freezer: 'pesado',
  'Caixa de piso de 45 kg': 'pesado',
  Tijolos: 'pesado',
  'Palete de tijolos': 'pesado',
  'Restos de obra — volume alto': 'pesado',
  'Animal grande': 'pesado',
  'Planta grande': 'pesado',
  'Ar Condicionado': 'pesado',
  Centrífuga: 'pesado',

  // Extra pesados — 16 minutos (cadastrar conforme necessidade)
};

document
  .getElementById('catalogo-itens')
  .addEventListener('click', (evento) => {
    const botao = evento.target.closest('.quantity-button');

    if (!botao) {
      return;
    }

    const nomeItem = botao.getAttribute('data-item');
    const variacao = parseInt(botao.getAttribute('data-variacao'), 10);

    alterarQuantidade(nomeItem, variacao);

    const idSpan = `qtd-${criarIdSeguro(nomeItem)}`;
    const spanQuantidade = document.getElementById(idSpan);

    if (spanQuantidade) {
      spanQuantidade.innerText = itensSelecionados[nomeItem] || 0;
    }

    atualizarListaSelecionados();
  });

function continuarParaItens() {
  showStep(6);
}

function mostrarCategoria(categoria) {
  const catalogo = document.getElementById('catalogo-itens');
  const itens = itensCatalogo[categoria];

  if (!itens) {
    catalogo.innerHTML = `
      <p class="error-message">
        Não foi possível carregar essa categoria.
      </p>
    `;
    return;
  }

  catalogo.innerHTML = '';

  const botaoMudarCategoria = document.createElement('button');
  botaoMudarCategoria.type = 'button';
  botaoMudarCategoria.className = 'floating-category-button';
  botaoMudarCategoria.textContent = 'Mudar categoria';

  botaoMudarCategoria.addEventListener('click', () => {
    document.querySelector('.category-grid').scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  });

  catalogo.appendChild(botaoMudarCategoria);

  itens.forEach((nomeItem) => {
    const quantidadeAtual = itensSelecionados[nomeItem] || 0;

    const itemElement = document.createElement('div');
    itemElement.className = 'item-card';

    const idSpan = `qtd-${criarIdSeguro(nomeItem)}`;

    itemElement.innerHTML = `
      <span class="item-name">${nomeItem}</span>

      <div class="quantity-controls">
        <button
          type="button"
          class="quantity-button"
          data-item="${nomeItem}"
          data-variacao="-1"
          aria-label="Diminuir ${nomeItem}"
        >
          −
        </button>

        <span id="${idSpan}">${quantidadeAtual}</span>

        <button
          type="button"
          class="quantity-button"
          data-item="${nomeItem}"
          data-variacao="1"
          aria-label="Aumentar ${nomeItem}"
        >
          +
        </button>
      </div>
    `;

    catalogo.appendChild(itemElement);
  });

  catalogo.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  });
}

function criarIdSeguro(texto) {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '-')
    .toLowerCase();
}

function alterarQuantidade(nomeItem, variacao) {
  const quantidadeAtual = itensSelecionados[nomeItem] || 0;
  const novaQuantidade = quantidadeAtual + variacao;

  if (novaQuantidade <= 0) {
    delete itensSelecionados[nomeItem];
  } else {
    itensSelecionados[nomeItem] = novaQuantidade;
  }

  const idQuantidade = `quantidade-${criarIdSeguro(nomeItem)}`;
  const elementoQuantidade = document.getElementById(idQuantidade);

  if (elementoQuantidade) {
    elementoQuantidade.innerText = itensSelecionados[nomeItem] || 0;
  }

  atualizarListaSelecionados();
}

function atualizarListaSelecionados() {
  const lista = document.getElementById('lista-itens-selecionados');
  const nomesItens = Object.keys(itensSelecionados);

  if (nomesItens.length === 0) {
    lista.innerHTML = `
      <p class="empty-message">
        Nenhum item selecionado ainda.
      </p>
    `;
    return;
  }

  lista.innerHTML = '';

  nomesItens.forEach((nomeItem) => {
    const quantidade = itensSelecionados[nomeItem];

    const item = document.createElement('div');
    item.className = 'selected-item-row';

    item.innerHTML = `
      <span>${nomeItem}</span>
      <strong>${quantidade}x</strong>
    `;

    lista.appendChild(item);
  });
}

function validarEtapa6() {
  const quantidadeItens = Object.keys(itensSelecionados).length;

  if (quantidadeItens === 0) {
    alert('Selecione pelo menos um item para continuar.');
    return;
  }

  showStep(7);
}

function validarEtapa7() {
  const camposObrigatorios = [
    ['acesso-origem', 'Selecione o acesso no local de saída.'],
    ['escada-origem', 'Informe a escada ou elevador na saída.'],
    ['acesso-destino', 'Selecione o acesso no local de destino.'],
    ['escada-destino', 'Informe a escada ou elevador no destino.'],
    ['ajudantes', 'Selecione se o serviço será com ou sem ajudantes.'],
  ];

  for (const [id, mensagem] of camposObrigatorios) {
    const campo = document.getElementById(id);

    if (!campo.value) {
      alert(mensagem);
      campo.focus();
      return;
    }
  }

  preencherRevisaoCompleta();
  showStep(8);
}

const seletorAjudantes = document.getElementById('ajudantes');
const textoUmAjudante = document.getElementById('texto-um-ajudante');
const textoSemAjudantes = document.getElementById('texto-sem-ajudantes');

if (seletorAjudantes) {
  seletorAjudantes.addEventListener('change', () => {
    const valor = seletorAjudantes.value;

    if (textoUmAjudante) {
      textoUmAjudante.hidden = valor !== '1';
    }

    if (textoSemAjudantes) {
      textoSemAjudantes.hidden = valor !== 'sem';
    }
  });
}

function obterTextoSelecionado(id) {
  const campo = document.getElementById(id);

  if (!campo || campo.selectedIndex < 0) {
    return 'Não informado';
  }

  return campo.options[campo.selectedIndex].text;
}

function montarEndereco(prefixo) {
  const rua = document.getElementById(`${prefixo}-rua`).value.trim();
  const numero = document.getElementById(`${prefixo}-numero`).value.trim();
  const bairro = document.getElementById(`${prefixo}-bairro`).value.trim();
  const cidade = document.getElementById(`${prefixo}-cidade`).value.trim();
  const estado = document.getElementById(`${prefixo}-estado`).value.trim();

  const ruaComNumero = [rua, numero].filter(Boolean).join(', ');

  return [ruaComNumero, bairro, cidade, estado].filter(Boolean).join(' — ');
}

function preencherRevisaoCompleta() {
  const nome = document.getElementById('nome').value.trim();
  const telefone = document.getElementById('telefone').value.trim();
  const data = document.getElementById('dataFrete').value;

  document.getElementById('revisao-cliente').textContent =
    `${nome} — WhatsApp: ${telefone}`;

  document.getElementById('revisao-data').textContent = dataIndefinida
    ? 'Ainda não defini a data'
    : formatarData(data);

  const textoParadas = obterEnderecosParadas()
    .map((parada, indice) => `Parada ${indice + 1}: ${parada.endereco}`)
    .join('\n');

  document.getElementById('revisao-enderecos').textContent =
    `Saída: ${montarEndereco('origem')}\n` +
    (textoParadas ? `${textoParadas}\n` : '') +
    `Destino: ${montarEndereco('destino')}`;

  const nomesItens = Object.keys(itensSelecionados);

  const textoItens = nomesItens.length
    ? nomesItens
        .map((nomeItem) => `${nomeItem}: ${itensSelecionados[nomeItem]}`)
        .join('\n')
    : 'Nenhum item selecionado';

  const observacoes = document.getElementById('observacoes-itens').value.trim();

  document.getElementById('revisao-itens').textContent = observacoes
    ? `${textoItens}\n\nObservações: ${observacoes}`
    : textoItens;

  const andaresOrigem = document.getElementById('andares-origem').value || '0';

  const andaresDestino =
    document.getElementById('andares-destino').value || '0';

  const valorAjudantes = document.getElementById('ajudantes').value;

  let textoAjudantes;

  if (valorAjudantes === 'com') {
    textoAjudantes = 'Com ajudantes';
  } else if (valorAjudantes === '1') {
    textoAjudantes =
      '1 ajudante apenas — se precisar de mais pessoas, ' +
      'deverá haver gente no local';
  } else {
    textoAjudantes = 'Sem ajudantes — apenas transporte do material';
  }

  document.getElementById('revisao-acesso').textContent =
    `Saída: ${obterTextoSelecionado('acesso-origem')}\n` +
    `Andares na saída: ${andaresOrigem}\n` +
    `Escada/elevador na saída: ${obterTextoSelecionado('escada-origem')}\n\n` +
    `Destino: ${obterTextoSelecionado('acesso-destino')}\n` +
    `Andares no destino: ${andaresDestino}\n` +
    `Escada/elevador no destino: ${obterTextoSelecionado('escada-destino')}\n\n` +
    textoAjudantes;
}

function continuarDaRevisao() {
  showStep(9);
  calcularRotaAutomatica();
}

const TEMPO_POR_CATEGORIA = {
  leve: 0.7,
  medio: 4,
  pesado: 8,
  extraPesado: 16,
};

const VALOR_POR_KM = 1.77;
const VALOR_HORA_MOTORISTA = 35;
const VALOR_HORA_PAI = 40;
const VALOR_HORA_AJUDANTE = 20;
const MARGEM_NEGOCIACAO = 0.25;

function calcularEstimativa() {
  const distanciaKm = Number(document.getElementById('distancia-total').value);

  const tempoPercursoMinutos = Number(
    document.getElementById('tempo-percurso').value,
  );

  if (
    document.getElementById('distancia-total').value === '' ||
    !Number.isFinite(distanciaKm) ||
    distanciaKm < 0
  ) {
    alert('Informe uma distância válida em quilômetros.');
    document.getElementById('distancia-total').focus();
    return;
  }

  if (
    document.getElementById('tempo-percurso').value === '' ||
    !Number.isFinite(tempoPercursoMinutos) ||
    tempoPercursoMinutos < 0
  ) {
    alert('Informe um tempo de percurso válido em minutos.');
    document.getElementById('tempo-percurso').focus();
    return;
  }

  const nomesItens = Object.keys(itensSelecionados);

  if (nomesItens.length === 0) {
    alert('Nenhum item foi selecionado.');
    return;
  }

  const itensSemCategoria = nomesItens.filter(
    (nomeItem) => !categoriaPesoItens[nomeItem],
  );

  if (itensSemCategoria.length > 0) {
    alert(
      'Estes itens ainda não têm uma categoria de peso cadastrada:\n\n' +
        itensSemCategoria.join('\n'),
    );
    return;
  }

  const totalUnidades = nomesItens.reduce(
    (total, nomeItem) => total + Number(itensSelecionados[nomeItem] || 0),
    0,
  );

  const andaresOrigem = Number(
    document.getElementById('andares-origem').value || 0,
  );

  const andaresDestino = Number(
    document.getElementById('andares-destino').value || 0,
  );

  const totalAndares = andaresOrigem + andaresDestino;
  const valorEscolhaAjudantes = document.getElementById('ajudantes').value;

  let quantidadeAjudantes = 0;

  if (valorEscolhaAjudantes === 'sem') {
    quantidadeAjudantes = 0;
  } else if (valorEscolhaAjudantes === '1') {
    quantidadeAjudantes = 1;
  } else if (valorEscolhaAjudantes === 'com') {
    quantidadeAjudantes = totalUnidades >= 20 && totalAndares > 4 ? 3 : 2;
  } else {
    alert('Selecione a opção de ajudantes na Etapa 7.');
    return;
  }

  const tempoPorAcesso = {
    porta: 0,
    perto: 0.5,
    distante: 2,
    corredor: 1.5,
    fundo: 2,
  };

  const acessoOrigem = document.getElementById('acesso-origem').value;

  const acessoDestino = document.getElementById('acesso-destino').value;

  if (
    tempoPorAcesso[acessoOrigem] === undefined ||
    tempoPorAcesso[acessoDestino] === undefined
  ) {
    alert('Confira as opções de acesso na Etapa 7.');
    return;
  }

  const tipoEscadaOrigem = document.getElementById('escada-origem').value;

  const tipoEscadaDestino = document.getElementById('escada-destino').value;

  const minutosPorLance = {
    larga: 1.7,
    normal: 2,
    estreita: 2.5,
  };

  function calcularAcréscimoVertical(tipo, andares) {
    if (tipo === 'elevador') {
      return 1.5;
    }

    if (tipo === 'nao-se-aplica') {
      return 0;
    }

    if (minutosPorLance[tipo] !== undefined) {
      return minutosPorLance[tipo] * andares;
    }

    return null;
  }

  const acrescimoVerticalOrigem = calcularAcréscimoVertical(
    tipoEscadaOrigem,
    andaresOrigem,
  );

  const acrescimoVerticalDestino = calcularAcréscimoVertical(
    tipoEscadaDestino,
    andaresDestino,
  );

  if (acrescimoVerticalOrigem === null || acrescimoVerticalDestino === null) {
    alert('Confira as opções de escada ou elevador na Etapa 7.');
    return;
  }

  let tempoManuseioMinutos = 0;

  for (const nomeItem of nomesItens) {
    const quantidade = Number(itensSelecionados[nomeItem] || 0);
    const categoria = categoriaPesoItens[nomeItem];
    const tempoBase = TEMPO_POR_CATEGORIA[categoria];

    if (tempoBase === undefined) {
      alert(`A categoria de peso de "${nomeItem}" não é reconhecida.`);
      return;
    }

    const acrescimoPorItem =
      tempoBase +
      tempoPorAcesso[acessoOrigem] +
      tempoPorAcesso[acessoDestino] +
      acrescimoVerticalOrigem +
      acrescimoVerticalDestino;

    tempoManuseioMinutos += acrescimoPorItem * quantidade;
  }

  const tempoTotalMinutos = tempoManuseioMinutos + tempoPercursoMinutos;

  const valorHoraEquipe =
    VALOR_HORA_MOTORISTA +
    VALOR_HORA_PAI +
    quantidadeAjudantes * VALOR_HORA_AJUDANTE;

  const custoCarro = distanciaKm * VALOR_POR_KM;

  const custoMotoristaEPai =
    (tempoTotalMinutos / 60) * (VALOR_HORA_MOTORISTA + VALOR_HORA_PAI);

  const custoPorAjudanteCalculado =
    (tempoTotalMinutos / 60) * VALOR_HORA_AJUDANTE;

  const custoAjudantes = dadosCustoAjudantes(
    quantidadeAjudantes,
    custoPorAjudanteCalculado,
  );

  const custoEquipe = custoMotoristaEPai + custoAjudantes;
  const subtotal = custoCarro + custoEquipe;
  const valorMargem = subtotal * MARGEM_NEGOCIACAO;
  const valorEstimado = subtotal + valorMargem;

  exibirEstimativa({
    distanciaKm,
    tempoPercursoMinutos,
    tempoManuseioMinutos,
    tempoTotalMinutos,
    totalUnidades,
    quantidadeAjudantes,
    valorHoraEquipe,
    custoCarro,
    custoEquipe,
    subtotal,
    valorMargem,
    valorEstimado,
  });
}

function dadosCustoAjudantes(quantidadeAjudantes, custoCalculadoPorAjudante) {
  if (quantidadeAjudantes === 0) {
    return 0;
  }

  const custoMinimoPorAjudante = 35;

  return (
    quantidadeAjudantes *
    Math.max(custoCalculadoPorAjudante, custoMinimoPorAjudante)
  );
}

function exibirEstimativa(dados) {
  const formatarTempo = (minutos) => {
    const horas = Math.floor(minutos / 60);
    const minutosRestantes = Math.round(minutos % 60);

    if (horas === 0) {
      return `${minutosRestantes} min`;
    }

    if (minutosRestantes === 0) {
      return `${horas} h`;
    }

    return `${horas} h ${minutosRestantes} min`;
  };

  const distanciaParaCodigo = Math.round(dados.distanciaKm);
  const horasParaCodigo = Math.round(dados.tempoTotalMinutos / 60);
  const codigoRota = `${distanciaParaCodigo}-${horasParaCodigo}`;
  const codigoValidacao = gerarCodigoValidacao(dados.valorEstimado);
  const codigoCompleto = `${codigoRota}/${codigoValidacao}`;

  const quantidadeEquipeTotal = 2 + dados.quantidadeAjudantes;
  const nomesEquipe =
    dados.quantidadeAjudantes === 0
      ? 'motorista e responsável pela carga'
      : `${dados.quantidadeAjudantes} ajudante(s), motorista e responsável pela carga`;

  const custoCalculadoPorAjudante =
    (dados.tempoTotalMinutos / 60) * VALOR_HORA_AJUDANTE;

  const custoAjudantes = dadosCustoAjudantes(
    dados.quantidadeAjudantes,
    custoCalculadoPorAjudante,
  );

  // Informações exibidas ao cliente
  document.getElementById('codigo-orcamento').textContent =
    `Código do orçamento: ${codigoCompleto}`;

  document.getElementById('est-tempo-total').textContent = formatarTempo(
    dados.tempoTotalMinutos,
  );

  document.getElementById('est-valor-final').textContent = formatarMoeda(
    dados.valorEstimado,
  );

  document.getElementById('est-custo-ajudantes').textContent =
    dados.quantidadeAjudantes > 0
      ? `Custo dos ajudantes: ${formatarMoeda(custoAjudantes)}`
      : 'Estimativa sem ajudantes.';

  // Detalhamento calculado, mantido para o painel administrativo futuro
  document.getElementById('est-total-itens').textContent = dados.totalUnidades;

  document.getElementById('est-tempo-manuseio').textContent = formatarTempo(
    dados.tempoManuseioMinutos,
  );

  document.getElementById('est-tempo-percurso').textContent = formatarTempo(
    dados.tempoPercursoMinutos,
  );

  document.getElementById('est-equipe').textContent =
    `${quantidadeEquipeTotal} pessoas: ${nomesEquipe}`;

  document.getElementById('est-valor-hora').textContent =
    `${formatarMoeda(dados.valorHoraEquipe)}/h`;

  document.getElementById('est-custo-carro').textContent = formatarMoeda(
    dados.custoCarro,
  );

  document.getElementById('est-custo-equipe').textContent = formatarMoeda(
    dados.custoEquipe,
  );

  document.getElementById('est-subtotal').textContent = formatarMoeda(
    dados.subtotal,
  );

  document.getElementById('est-margem').textContent = formatarMoeda(
    dados.valorMargem,
  );

  ultimaEstimativa = dados;

  document.getElementById('resultado-estimativa').hidden = false;
  document.getElementById('decisao-estimativa').hidden = false;
  document.getElementById('bloco-desconto').hidden = true;

  document.getElementById('resultado-estimativa').scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  });

  document.getElementById('resultado-estimativa').scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  });
  // Inicia timer de inatividade APÓS exibir a estimativa
  iniciarTimerInatividade();
}

const DESCONTO_NEGOCIACAO = 0.1;
const NUMERO_WHATSAPP_EMPRESA = '5571992259196'; // substitua pelo número real, com DDI e DDD
const URL_APPS_SCRIPT =
  'https://script.google.com/macros/s/AKfycbzsmc90SM4X26x4lQQV8eX5v9uZTbZWUNS7Ovqeh_5m0Qj8HLJCSN1YrA_SNJABBzc/exec';

let ultimaEstimativa = null;

function formatarMoeda(valor) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);
}

function montarResumoParaWhatsApp(status, valorTexto) {
  const nome = document.getElementById('nome')?.value.trim() || 'Não informado';
  const telefone =
    document.getElementById('telefone')?.value.trim() || 'Não informado';
  const codigo =
    document.getElementById('codigo-orcamento')?.textContent.trim() ||
    'Não informado';
  const data = document.getElementById('dataFrete')?.value || '';

  const textoData = dataIndefinida
    ? 'Ainda não definida'
    : data
      ? formatarData(data)
      : 'Não informada';

  const nomesItens = Object.keys(itensSelecionados || {});
  const textoItens = nomesItens.length
    ? nomesItens
        .map((nomeItem) => `• ${nomeItem}: ${itensSelecionados[nomeItem]}`)
        .join('\n')
    : 'Nenhum item informado';

  const observacoes =
    document.getElementById('observacoes-itens')?.value.trim() || 'Nenhuma';

  const valorAjudantes = document.getElementById('ajudantes')?.value || '';
  let textoAjudantes = 'Não informado';

  if (valorAjudantes === 'com') {
    textoAjudantes = 'Com ajudantes';
  } else if (valorAjudantes === '1') {
    textoAjudantes =
      '1 ajudante apenas; cliente deverá disponibilizar mais pessoas no local, se necessário';
  } else if (valorAjudantes === 'sem') {
    textoAjudantes = 'Sem ajudantes';
  }

  const podeTerPedagio =
    document.getElementById('pode-ter-pedagio')?.value || '';

  let textoPedagio = 'Não informado; motorista deve verificar.';

  if (podeTerPedagio === 'sim') {
    textoPedagio =
      'Cliente sinaliza que pode haver pedágio; motorista deve confirmar. O valor não está incluído na estimativa.';
  } else if (podeTerPedagio === 'nao') {
    textoPedagio =
      'Cliente acredita que não há pedágio; motorista deve confirmar. O valor não está incluído na estimativa.';
  }

  const linhasParadas = obterEnderecosParadas().map(
    (parada, indice) => `Parada ${indice + 1} — endereço: *${parada.endereco}*`,
  );

  const detalhesAcesso = [
    `Saída — endereço: *${montarEndereco('origem')}*`,
    ...linhasParadas,
    `Destino — endereço: *${montarEndereco('destino')}*`,
    '',
    `Saída — veículo: *${obterTextoSelecionado('acesso-origem')}*`,
    `Saída — andares: *${document.getElementById('andares-origem')?.value || '0'}*`,
    `Saída — escada/elevador: *${obterTextoSelecionado('escada-origem')}*`,
    '',
    `Destino — veículo: *${obterTextoSelecionado('acesso-destino')}*`,
    `Destino — andares: *${document.getElementById('andares-destino')?.value || '0'}*`,
    `Destino — escada/elevador: *${obterTextoSelecionado('escada-destino')}*`,
  ].join('\n');

  return [
    `*${status.toLocaleUpperCase('pt-BR')}*`,
    '',
    `Nome: *${nome}*`,
    `WhatsApp: *${telefone}*`,
    `Data do frete: *${textoData}*`,
    codigo,
    `Valor estimado: *${valorTexto}*`,
    '',
    `Pedágio: *${textoPedagio}*`,
    '',
    'Materiais e itens:',
    textoItens,
    '',
    'Acessos e condições:',
    detalhesAcesso,
    '',
    `Ajudantes: *${textoAjudantes}*`,
    `Observações: *${observacoes}*`,
  ].join('\n');
}

function abrirWhatsApp(mensagem) {
  const url = `https://wa.me/${NUMERO_WHATSAPP_EMPRESA}?text=${encodeURIComponent(mensagem)}`;

  window.open(url, '_blank');
}

function mostrarOpcaoDesconto() {
  if (!ultimaEstimativa) {
    return;
  }

  const valorComDesconto =
    ultimaEstimativa.valorEstimado * (1 - DESCONTO_NEGOCIACAO);

  ultimaEstimativa.valorComDesconto = valorComDesconto;

  document.getElementById('est-valor-desconto').textContent =
    formatarMoeda(valorComDesconto);

  document.getElementById('decisao-estimativa').hidden = true;
  document.getElementById('bloco-desconto').hidden = false;

  document.getElementById('bloco-desconto').scrollIntoView({
    behavior: 'smooth',
    block: 'center',
  });
}

function gerarCodigoValidacao(valor) {
  const valorInteiro = Math.floor(valor);
  const valorMais1 = valorInteiro + 1;
  return `91${valorMais1}0096`;
}

function enviarParaSheets(dados) {
  fetch(URL_APPS_SCRIPT, {
    method: 'POST',
    body: JSON.stringify(dados),
  })
    .then((resposta) => resposta.json())
    .then((resultado) => {
      console.log('Frete registrado na Sheets:', resultado);
    })
    .catch((erro) => {
      console.error('Erro ao registrar na Sheets:', erro);
    });
}

function aceitarEstimativa(comDesconto) {
  pararTimerInatividade();

  if (!ultimaEstimativa) {
    return;
  }

  const valor = comDesconto
    ? ultimaEstimativa.valorComDesconto
    : ultimaEstimativa.valorEstimado;

  const distanciaParaCodigo = Math.round(ultimaEstimativa.distanciaKm);
  const horasParaCodigo = Math.round(ultimaEstimativa.tempoTotalMinutos / 60);
  const codigoRota = `${distanciaParaCodigo}-${horasParaCodigo}`;
  const codigoValidacao = gerarCodigoValidacao(valor);
  const codigoCompleto = `${codigoRota}/${codigoValidacao}`;

  const mensagem = montarResumoParaWhatsApp(
    comDesconto ? 'Aceitou com desconto' : 'Aceitou o valor estimado',
    formatarMoeda(valor),
  );

  const mensagemComCodigo =
    mensagem + `\n\n🔐 Código de validação: ${codigoValidacao}`;

  const nomesItens = Object.keys(itensSelecionados);
  const quantidadeTotal = nomesItens.reduce(
    (total, nomeItem) => total + Number(itensSelecionados[nomeItem] || 0),
    0,
  );

  enviarParaSheets({
    tipo: 'agendado',
    cliente: document.getElementById('nome').value.trim(),
    telefone: document.getElementById('telefone').value.trim(),
    itens: nomesItens.join(', '),
    quantidadeItens: quantidadeTotal,
    distanciaKm: ultimaEstimativa.distanciaKm,
    tempoPercursoMinutos: ultimaEstimativa.tempoPercursoMinutos,
    tempoManuseioMinutos: ultimaEstimativa.tempoManuseioMinutos,
    tempoTotalMinutos: ultimaEstimativa.tempoTotalMinutos,
    custoCarro: ultimaEstimativa.custoCarro,
    custoEquipe: ultimaEstimativa.custoEquipe,
    custoAjudantes: ultimaEstimativa.custoAjudantes || 0,
    subtotal: ultimaEstimativa.subtotal,
    valorMargem: ultimaEstimativa.valorMargem,
    valorOrcado: ultimaEstimativa.valorEstimado,
    descontoAplicado: comDesconto ? 'Sim' : 'Não',
    valorFinal: valor,
    codigoOrcamento: codigoCompleto,
  });

  abrirWhatsApp(mensagemComCodigo);
}

function encerrarAtendimento() {
  pararTimerInatividade();

  if (!ultimaEstimativa) {
    return;
  }

  const mensagem = montarResumoParaWhatsApp(
    'Não aceitou (nem com desconto)',
    `Valor estimado: ${formatarMoeda(ultimaEstimativa.valorEstimado)} | ` +
      `Valor com desconto: ${formatarMoeda(ultimaEstimativa.valorComDesconto)}`,
  );

  // Registra na aba Rejeitados
  enviarRejeicao();

  // Abre WhatsApp
  abrirWhatsApp(mensagem);
}

function enviarRejeicao() {
  if (!ultimaEstimativa) {
    return;
  }

  const distanciaParaCodigo = Math.round(ultimaEstimativa.distanciaKm);
  const horasParaCodigo = Math.round(ultimaEstimativa.tempoTotalMinutos / 60);
  const codigoRota = `${distanciaParaCodigo}-${horasParaCodigo}`;
  const codigoValidacao = gerarCodigoValidacao(ultimaEstimativa.valorEstimado);
  const codigoCompleto = `${codigoRota}/${codigoValidacao}`;

  const nomesItens = Object.keys(itensSelecionados);
  const quantidadeTotal = nomesItens.reduce(
    (total, nomeItem) => total + Number(itensSelecionados[nomeItem] || 0),
    0,
  );

  fetch(URL_APPS_SCRIPT, {
    method: 'POST',
    body: JSON.stringify({
      tipo: 'rejeicao',
      cliente: document.getElementById('nome').value.trim(),
      telefone: document.getElementById('telefone').value.trim(),
      itens: nomesItens.join(', '),
      quantidadeItens: quantidadeTotal,
      distanciaKm: ultimaEstimativa.distanciaKm,
      tempoPercursoMinutos: ultimaEstimativa.tempoPercursoMinutos,
      tempoManuseioMinutos: ultimaEstimativa.tempoManuseioMinutos,
      tempoTotalMinutos: ultimaEstimativa.tempoTotalMinutos,
      custoCarro: ultimaEstimativa.custoCarro,
      custoEquipe: ultimaEstimativa.custoEquipe,
      custoAjudantes: ultimaEstimativa.custoAjudantes || 0,
      subtotal: ultimaEstimativa.subtotal,
      valorMargem: ultimaEstimativa.valorMargem,
      valorOrcado: ultimaEstimativa.valorEstimado,
      codigoOrcamento: codigoCompleto,
    }),
  })
    .then((resposta) => resposta.json())
    .then((resultado) => {
      console.log('Rejeição registrada na Sheets:', resultado);
    })
    .catch((erro) => {
      console.error('Erro ao registrar rejeição:', erro);
    });
}

let timerInatividade = null;
let tempoRestanteInatividade = 180; // 3 minutos em segundos

function iniciarTimerInatividade() {
  // Limpa timer anterior se existir
  if (timerInatividade) {
    clearInterval(timerInatividade);
  }

  tempoRestanteInatividade = 180;

  timerInatividade = setInterval(() => {
    tempoRestanteInatividade--;

    // Em 2,5 minutos (150 segundos), mostra o modal
    if (tempoRestanteInatividade === 150) {
      mostrarModalInatividade();
    }

    // Em 0 segundos, registra como inativo
    if (tempoRestanteInatividade === 0) {
      clearInterval(timerInatividade);
      registrarComoInativo();
    }
  }, 1000);
}

function pararTimerInatividade() {
  if (timerInatividade) {
    clearInterval(timerInatividade);
    timerInatividade = null;
  }
}

function mostrarModalInatividade() {
  const modal = document.createElement('div');
  modal.id = 'modal-inatividade';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
  `;

  modal.innerHTML = `
    <div style="
      background: white;
      padding: 40px;
      border-radius: 8px;
      text-align: center;
      max-width: 400px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    ">
      <h2 style="margin: 0 0 20px 0; font-size: 24px;">Ainda está aí?</h2>
      <p style="margin: 0 0 30px 0; color: #666; font-size: 16px;">
        Para salvar seu orçamento, você precisa clicar em "Aceitar". Senão, o orçamento não será salvo.
      </p>
      <button onclick="responderInatividade()" style="
        background: #007bff;
        color: white;
        border: none;
        padding: 12px 30px;
        font-size: 16px;
        border-radius: 4px;
        cursor: pointer;
        width: 100%;
      ">
        Ok, entendi
      </button>
    </div>
  `;

  document.body.appendChild(modal);
}

function responderInatividade() {
  const modal = document.getElementById('modal-inatividade');
  if (modal) {
    modal.remove();
  }

  // Reinicia o timer
  iniciarTimerInatividade();
}

function registrarComoInativo() {
  const distanciaParaCodigo = Math.round(ultimaEstimativa.distanciaKm);
  const horasParaCodigo = Math.round(ultimaEstimativa.tempoTotalMinutos / 60);
  const codigoRota = `${distanciaParaCodigo}-${horasParaCodigo}`;
  const codigoValidacao = gerarCodigoValidacao(ultimaEstimativa.valorEstimado);
  const codigoCompleto = `${codigoRota}/${codigoValidacao}`;

  const nomesItens = Object.keys(itensSelecionados);
  const quantidadeTotal = nomesItens.reduce(
    (total, nomeItem) => total + Number(itensSelecionados[nomeItem] || 0),
    0,
  );

  fetch(URL_APPS_SCRIPT, {
    method: 'POST',
    body: JSON.stringify({
      tipo: 'inativo',
      cliente: document.getElementById('nome').value.trim(),
      telefone: document.getElementById('telefone').value.trim(),
      itens: nomesItens.join(', '),
      quantidadeItens: quantidadeTotal,
      distanciaKm: ultimaEstimativa.distanciaKm,
      tempoPercursoMinutos: ultimaEstimativa.tempoPercursoMinutos,
      tempoManuseioMinutos: ultimaEstimativa.tempoManuseioMinutos,
      tempoTotalMinutos: ultimaEstimativa.tempoTotalMinutos,
      custoCarro: ultimaEstimativa.custoCarro,
      custoEquipe: ultimaEstimativa.custoEquipe,
      custoAjudantes: ultimaEstimativa.custoAjudantes || 0,
      subtotal: ultimaEstimativa.subtotal,
      valorMargem: ultimaEstimativa.valorMargem,
      valorOrcado: ultimaEstimativa.valorEstimado,
      codigoOrcamento: codigoCompleto,
    }),
  })
    .then((resposta) => resposta.json())
    .then((resultado) => {
      console.log('Cliente registrado como inativo:', resultado);
    })
    .catch((erro) => {
      console.error('Erro ao registrar inativo:', erro);
    });

  const modal = document.getElementById('modal-inatividade');
  if (modal) {
    modal.remove();
  }
}
