/* ============================================================
   DADOS — Eleições 2026 (1º turno, 4 de outubro de 2026)
   Posição em 12/10/2026. Fontes listadas no fim da página.
   Classificação em blocos: editorial e aproximada.
   ============================================================ */

const BLOCS = {
  esq: { name: 'Esquerda', cssVar: '--esq' },
  out: { name: 'Centro (PSDB) e sem partido', cssVar: '--out' },
  cen: { name: 'Centrão', cssVar: '--cen' },
  dir: { name: 'Direita', cssVar: '--dir' },
};
const BLOC_ORDER = ['esq', 'out', 'cen', 'dir'];

const TOTAL = { c: 513, s: 81 };

/* c = deputados federais (legislatura 2027), s = senadores a partir de fev/2027 (projeção GCMais),
   s26 = senadores eleitos em 2026 (Congresso em Foco). Ordem = posição no hemiciclo (esquerda -> direita). */
const PARTIES = [
  { id: 'PSOL',          b: 'esq', c: 14,  s: 0,  s26: 0  },
  { id: 'PT',            b: 'esq', c: 70,  s: 9,  s26: 6  },
  { id: 'PCdoB',         b: 'esq', c: 11,  s: 0,  s26: 0  },
  { id: 'PV',            b: 'esq', c: 7,   s: 0,  s26: 0  },
  { id: 'Rede',          b: 'esq', c: 1,   s: 1,  s26: 1  },
  { id: 'PSB',           b: 'esq', c: 15,  s: 4,  s26: 3  },
  { id: 'PDT',           b: 'esq', c: 6,   s: 1,  s26: 1  },
  { id: 'PSDB',          b: 'out', c: 11,  s: 2,  s26: 2  },
  { id: 'Sem partido',   b: 'out', c: 0,   s: 1,  s26: 0  },
  { id: 'Podemos',       b: 'cen', c: 27,  s: 2,  s26: 2  },
  { id: 'MDB',           b: 'cen', c: 36,  s: 8,  s26: 7  },
  { id: 'PSD',           b: 'cen', c: 43,  s: 5,  s26: 2  },
  { id: 'Avante',        b: 'cen', c: 5,   s: 0,  s26: 0  },
  { id: 'Solidariedade', b: 'cen', c: 2,   s: 0,  s26: 0  },
  { id: 'PRD',           b: 'cen', c: 5,   s: 0,  s26: 0  },
  { id: 'União',         b: 'cen', c: 46,  s: 5,  s26: 3  },
  { id: 'PP',            b: 'cen', c: 41,  s: 6,  s26: 3  },
  { id: 'Republicanos',  b: 'cen', c: 41,  s: 6,  s26: 2  },
  { id: 'Novo',          b: 'dir', c: 10,  s: 3,  s26: 3  },
  { id: 'Missão',        b: 'dir', c: 1,   s: 0,  s26: 0  },
  { id: 'PL',            b: 'dir', c: 121, s: 28, s26: 19 },
];
const PARTY = Object.fromEntries(PARTIES.map(p => [p.id, p]));

/* Variação da Câmara 2022 -> 2026 (Poder360). Só partidos com dado publicado. */
const DELTAS = [
  { id: 'PL', a: 99, b: 121 }, { id: 'Podemos', a: 18, b: 27 }, { id: 'Novo', a: 3, b: 10 },
  { id: 'PCdoB', a: 6, b: 11 }, { id: 'PT', a: 68, b: 70 }, { id: 'Missão', a: 0, b: 1 },
  { id: 'PP', a: 47, b: 41 }, { id: 'União', a: 59, b: 46 }, { id: 'PDT', a: 17, b: 6 },
  { id: 'Cidadania', a: 5, b: 0 },
];
/* Poder360: espectro político da Câmara (classificação do veículo) */
const SPECTRUM = [
  { name: 'Direita', a: 275, b: 276, bloc: 'dir' },
  { name: 'Centro', a: 113, b: 113, bloc: 'cen' },
  { name: 'Esquerda', a: 125, b: 124, bloc: 'esq' },
];

/* Presidente — 1º turno, 100% das seções (percentuais sobre votos válidos) */
const PRES = [
  { name: 'Flávio Bolsonaro', party: 'PL', pct: 47.03, votes: '56,10 mi', bloc: 'dir' },
  { name: 'Lula', party: 'PT', pct: 45.16, votes: '53,88 mi', bloc: 'esq' },
  { name: 'Augusto Cury', party: '', pct: 2.89, votes: '', bloc: 'out' },
  { name: 'Renan Santos', party: '', pct: 2.24, votes: '', bloc: 'out' },
  { name: 'Ronaldo Caiado', party: '', pct: 2.18, votes: '', bloc: 'out' },
  { name: 'Romeu Zema', party: '', pct: 0.27, votes: '', bloc: 'out' },
  { name: 'Demais candidatos', party: '', pct: 0.23, votes: '', bloc: 'out' },
];

/* Governadores */
const GOVS = [
  { uf: 'AL', nome: 'João Henrique Caldas (JHC)', p: 'PSDB', pct: '52%' },
  { uf: 'AP', nome: 'Dr. Furlan', p: 'PSD', pct: '62%', nota: 'Depende de decisão do TSE sobre o registro de candidatura.' },
  { uf: 'BA', nome: 'Jerônimo Rodrigues', p: 'PT', pct: '55%' },
  { uf: 'CE', nome: 'Elmano de Freitas', p: 'PT', pct: '52,8%' },
  { uf: 'GO', nome: 'Daniel Vilela', p: 'MDB', pct: '≈ 59%' },
  { uf: 'MA', nome: 'Eduardo Braide', p: 'PSD', pct: '54%' },
  { uf: 'MT', nome: 'Otaviano Pivetta', p: 'Republicanos', pct: '> 60%' },
  { uf: 'MS', nome: 'Eduardo Riedel', p: 'PP', pct: '> 67%' },
  { uf: 'MG', nome: 'Cleitinho Azevedo', p: 'Republicanos', pct: '55%' },
  { uf: 'PA', nome: 'Dr. Daniel', p: 'Podemos', pct: '51%' },
  { uf: 'PR', nome: 'Sérgio Moro', p: 'PL', pct: '50,1%' },
  { uf: 'PB', nome: 'Lucas Ribeiro', p: 'PP', pct: 'n/i' },
  { uf: 'PE', nome: 'Raquel Lyra', p: 'PSD', pct: '53%' },
  { uf: 'PI', nome: 'Rafael Fonteles', p: 'PT', pct: '> 70%' },
  { uf: 'RJ', nome: 'Douglas Ruas', p: 'PL', pct: '50,88%', nota: 'Percentual recalculado depois que o TSE anulou os votos de Anthony Garotinho.' },
  { uf: 'RS', nome: 'Luciano Zucco', p: 'PL', pct: '≈ 58%' },
  { uf: 'RO', nome: 'Marcos Rogério', p: 'PL', pct: 'n/i' },
  { uf: 'RR', nome: 'Arthur Henrique', p: 'PL', pct: 'n/i', nota: 'Ainda não proclamado; votos sob análise judicial.' },
  { uf: 'SC', nome: 'Jorginho Mello', p: 'PL', pct: '> 68%' },
  { uf: 'SP', nome: 'Tarcísio de Freitas', p: 'Republicanos', pct: '≈ 63%' },
  { uf: 'SE', nome: 'Fábio Mitidieri', p: 'PSD', pct: '≈ 60%' },
];
const RUNOFFS = [
  { uf: 'AC', a: { nome: 'Mailza Assis', p: 'PP' }, b: { nome: 'Alan Rick', p: 'Republicanos' } },
  { uf: 'AM', a: { nome: 'Omar Aziz', p: 'PSD' }, b: { nome: 'Professora Maria do Carmo', p: 'PL' } },
  { uf: 'DF', a: { nome: 'Celina Leão', p: 'PP' }, b: { nome: 'Leandro Grass', p: 'PT' } },
  { uf: 'ES', a: { nome: 'Lorenzo Pazolini', p: 'Republicanos' }, b: { nome: 'Ricardo Ferraço', p: 'MDB' } },
  { uf: 'RN', a: { nome: 'Allyson Bezerra', p: 'União' }, b: { nome: 'Cadu de Lula', p: 'PT' } },
  { uf: 'TO', a: { nome: 'Professora Dorinha', p: 'União' }, b: { nome: 'Vicentinho Júnior', p: 'PSDB' } },
];
/* Mapa em grade (coluna, linha) — cartograma, não mapa geográfico */
const TILES = {
  RR: [2, 0], AP: [4, 0],
  AM: [1, 1], PA: [3, 1], MA: [4, 1], CE: [5, 1], RN: [6, 1],
  AC: [0, 2], RO: [1, 2], MT: [2, 2], TO: [3, 2], PI: [4, 2], PE: [5, 2], PB: [6, 2],
  MS: [2, 3], GO: [3, 3], BA: [4, 3], AL: [5, 3], SE: [6, 3],
  DF: [3, 4], MG: [4, 4], ES: [5, 4],
  SP: [3, 5], RJ: [4, 5],
  PR: [3, 6],
  RS: [2, 7], SC: [3, 7],
};

/* Quóruns. kind: frac (fração dos membros, arredondada para cima) | abs (maioria absoluta) | third.
   houses: quais Casas votam. Fonte: Constituição Federal e Lei 1.079/1950. */
const QUORUMS = [
  { id: 'pec', nome: 'Emenda à Constituição (PEC)', ref: 'CF art. 60 §2º', regra: '3/5, em dois turnos, em cada Casa', kind: 'frac', num: 3, den: 5, c: true, s: true,
    nota: 'Vale para mudar direitos, regras eleitorais, tributos e reformas. Cláusulas pétreas não podem ser abolidas.' },
  { id: 'stfpec', nome: 'Mudar o STF (nº de ministros, mandato, idade)', ref: 'CF art. 101 e art. 40', regra: 'PEC: 3/5 em cada Casa', kind: 'frac', num: 3, den: 5, c: true, s: true,
    nota: 'O número de 11 ministros está na Constituição, por isso exige PEC.' },
  { id: 'imp', nome: 'Impeachment do presidente', ref: 'CF art. 51, I e art. 52, I; Lei 1.079/1950', regra: 'Câmara autoriza com 2/3; Senado condena com 2/3', kind: 'frac', num: 2, den: 3, c: true, s: true,
    nota: 'A condenação tira o cargo e torna inelegível por 8 anos. O Senado é presidido pelo presidente do STF no julgamento.' },
  { id: 'crime', nome: 'Processo criminal contra o presidente no STF', ref: 'CF art. 86', regra: 'Autorização de 2/3 da Câmara', kind: 'frac', num: 2, den: 3, c: true, s: false,
    nota: 'Só a Câmara vota. Se autorizada, o STF decide se recebe a denúncia.' },
  { id: 'impstf', nome: 'Impeachment de ministro do STF', ref: 'CF art. 52, II; Lei 1.079/1950', regra: 'Condenação por 2/3 do Senado', kind: 'frac', num: 2, den: 3, c: false, s: true,
    nota: 'A Câmara não participa. A denúncia vai direto ao Senado.' },
  { id: 'indstf', nome: 'Aprovar indicado ao STF', ref: 'CF art. 101, parágrafo único', regra: 'Maioria absoluta do Senado, após sabatina', kind: 'abs', c: false, s: true,
    nota: 'Em 29/04/2026 o Senado rejeitou Jorge Messias por 42 a 34, a primeira rejeição em 132 anos.' },
  { id: 'lc', nome: 'Lei complementar', ref: 'CF art. 69', regra: 'Maioria absoluta de cada Casa', kind: 'abs', c: true, s: true,
    nota: 'Exemplos: regulamentações de reforma tributária, normas de finanças públicas.' },
  { id: 'veto', nome: 'Derrubar veto presidencial', ref: 'CF art. 66 §4º', regra: 'Maioria absoluta de deputados e de senadores', kind: 'abs', c: true, s: true,
    nota: 'Votado em sessão conjunta, mas os dois placares são contados separadamente.' },
  { id: 'cass', nome: 'Cassar mandato de parlamentar', ref: 'CF art. 55 §2º', regra: 'Maioria absoluta da Casa do acusado', kind: 'abs', c: true, s: true,
    nota: 'Voto aberto. Deputado é julgado pela Câmara e senador pelo Senado.' },
  { id: 'pgr', nome: 'Aprovar ou destituir o Procurador-Geral da República', ref: 'CF art. 128 §1º e §2º', regra: 'Maioria absoluta do Senado', kind: 'abs', c: false, s: true,
    nota: 'Só o Senado vota.' },
  { id: 'ord', nome: 'Lei ordinária e medida provisória', ref: 'CF art. 47', regra: 'Maioria simples (mais da metade dos presentes)', kind: 'abs', c: true, s: true, presentes: true,
    nota: 'O quadro mostra o mínimo com todos presentes. Com ausências, o número cai.' },
  { id: 'cpi', nome: 'Abrir CPI', ref: 'CF art. 58 §3º', regra: '1/3 de assinaturas na Casa', kind: 'frac', num: 1, den: 3, c: true, s: true,
    nota: 'Não é votação: basta reunir as assinaturas e indicar um fato determinado.' },
];

/* Cronograma. tag: ele (eleição) | cong (Congresso) | stf (Judiciário) */
const TIMELINE = [
  { d: '2026-04-29', tag: 'stf', t: 'Senado rejeita Jorge Messias para o STF', x: 'Placar de 42 a 34. A vaga de Barroso (aposentado em outubro de 2025) segue aberta.' },
  { d: '2026-10-04', tag: 'ele', t: '1º turno', x: 'Flávio Bolsonaro (PL) 47,03% e Lula (PT) 45,16% dos votos válidos. 20 estados definem o governador.' },
  { d: '2026-10-05', tag: 'ele', t: 'Começa a campanha do 2º turno', x: 'Totalização encerrada às 2h58. Abstenção de 21,08%.' },
  { d: '2026-10-09', tag: 'ele', t: 'Propaganda gratuita no rádio e na TV', x: 'Vai de 9 a 23 de outubro para os candidatos do 2º turno.' },
  { d: '2026-10-19', tag: 'ele', t: 'Eleitores ganham proteção contra prisão', x: 'Exceto flagrante e crime inafiançável, a partir de 19 de outubro.' },
  { d: '2026-10-25', tag: 'ele', t: '2º turno: presidente e 6 governadores', x: 'Das 8h às 17h (Brasília). Presidente, AC, AM, DF, ES, RN e TO.' },
  { d: '2026-11-03', tag: 'ele', t: 'Cadastro eleitoral reabre', x: 'Atendimento em cartórios e serviços pela internet.' },
  { d: '2026-12-03', tag: 'ele', t: 'Prazo para justificar ausência no 1º turno', x: 'Sem penalidade até essa data.' },
  { d: '2026-12-18', tag: 'ele', t: 'Prazo final da diplomação', x: 'O TSE diploma presidente e vice. Os TREs diplomam governadores, senadores e deputados (Res. TSE 23.760/2026).' },
  { d: '2027-01-05', tag: 'ele', t: 'Posse do presidente e do vice', x: 'Sessão no Congresso Nacional.' },
  { d: '2027-01-06', tag: 'ele', t: 'Posse dos governadores e vices', x: 'Nas assembleias legislativas.' },
  { d: '2027-01-08', tag: 'ele', t: 'Prazo para justificar ausência no 2º turno', x: '' },
  { d: '2027-02-01', tag: 'cong', t: 'Posse de deputados e senadores e eleição das Mesas', x: 'Nasce a 58ª legislatura. Na Câmara, a presidência exige maioria absoluta (257 votos) na primeira votação.' },
  { d: '2027-02-02', tag: 'cong', t: 'Abertura da sessão legislativa', x: 'A Constituição fixa os trabalhos de 2 de fevereiro a 17 de julho e de 1º de agosto a 22 de dezembro.' },
  { d: '2028-01-01', tag: 'stf', t: 'Fux atinge a aposentadoria compulsória (2028)', x: 'Aos 75 anos. O presidente eleito em 2026 indica o substituto. Data exata não confirmada nas fontes.', year: true },
  { d: '2029-01-01', tag: 'stf', t: 'Cármen Lúcia atinge a aposentadoria compulsória (2029)', x: 'Terceira vaga a partir de 2028 que o mandato 2027-2030 pode preencher.', year: true },
  { d: '2030-12-01', tag: 'stf', t: 'Gilmar Mendes atinge a aposentadoria compulsória (fim de 2030)', x: 'Com Fux e Cármen, são quase um terço da Corte.', year: true },
  { d: '2031-01-31', tag: 'cong', t: 'Termina o mandato dos 27 senadores eleitos em 2022', x: 'Janeiro de 2031. Os 54 eleitos em 2026 cumprem mandato de 8 anos.', year: true },
];

/* Fluxos de tramitação */
const FLOW_PEC = [
  ['Proposta', 'Assinada por 1/3 dos deputados (171) ou dos senadores (27), pelo presidente da República ou por mais da metade das assembleias estaduais.'],
  ['CCJ da Casa de origem', 'Analisa a admissibilidade. Maioria simples na comissão.'],
  ['Comissão especial', 'Analisa o mérito em até 40 sessões. Só existe na Câmara.'],
  ['Plenário, 1º turno', '308 votos na Câmara (49 no Senado).'],
  ['Plenário, 2º turno', 'Mesmo quórum, com intervalo de cinco sessões entre os turnos.'],
  ['Outra Casa', 'Repete CCJ e dois turnos de plenário com 3/5 dos votos.'],
  ['Promulgação', 'As Mesas da Câmara e do Senado promulgam. Não há sanção nem veto do presidente.'],
];
const FLOW_IMP = [
  ['Denúncia', 'Qualquer cidadão apresenta à Câmara um pedido por crime de responsabilidade.'],
  ['Presidente da Câmara', 'Decide sozinho se arquiva ou aceita a denúncia.'],
  ['Comissão especial', 'Analisa a admissibilidade e a defesa. Parecer votado por maioria simples.'],
  ['Plenário da Câmara', '342 votos de 513 autorizam o processo.'],
  ['Senado: admissão', 'Maioria simples abre o processo e afasta o presidente por até 180 dias.'],
  ['Julgamento no Senado', 'Presidido pelo presidente do STF. Condenação com 54 votos de 81.'],
  ['Resultado', 'Perda do cargo e inabilitação por 8 anos. Com menos de 54 votos, o presidente volta ao cargo.'],
];

const FONTES = [
  ['TV Senado: composição da Câmara', 'https://www12.senado.leg.br/tv/programas/noticias-1/2026/10/eleicoes-2026-veja-como-ficou-a-composicao-partidaria-da-camara'],
  ['GCMais: Câmara por partido', 'https://gcmais.com.br/noticias/2026/10/03/como-ficou-a-camara-dos-deputados-apos-as-eleicoes-2026-veja-composicao-por-partido'],
  ['GCMais: Senado por partido (projeção para 2027)', 'https://gcmais.com.br/noticias/2026/10/03/como-ficou-o-senado-apos-as-eleicoes-2026-veja-composicao-por-partido'],
  ['Congresso em Foco: PL conquista 19 das 54 vagas', 'https://www.congressoemfoco.com.br/noticia/122752/pl-conquista-19-das-54-vagas-no-senado-veja-os-senadores-eleitos'],
  ['Agência Brasil: novos senadores', 'https://agenciabrasil.ebc.com.br/politica/noticia/2026-10/veja-quem-sao-os-novos-senadores-e-como-fica-composicao-do-senado'],
  ['Portal de Prefeitura: Câmara com 183 novatos', 'https://portaldeprefeitura.com.br/bastidores-da-politica/camara-federal/eleicoes-2026-camara-tera-183-deputados-de-primeiro-mandato-e-maior/633566/'],
  ['Poder360: evolução por partido', 'https://www.poder360.com.br/poder-eleicoes-2026/leia-a-evolucao-do-numero-de-deputados-federais-por-partido/'],
  ['O Povo/BBC: governadores eleitos e 2º turno', 'https://www.opovo.com.br/agencia/bbc/2026/10/11/quem-sao-os-governadores-eleitos-em-2026-e-quais-estados-terao-2-turno-veja-os-resultados.html'],
  ['TSE: Flávio Bolsonaro e Lula no 2º turno', 'https://www.tse.jus.br/comunicacao/noticias/2026/Outubro/flavio-bolsonaro-e-lula-vao-disputar-o-2o-turno-para-a-presidencia-da-republica'],
  ['Portal de Prefeitura: 100% das seções', 'https://portaldeprefeitura.com.br/bastidores-da-politica/eleicoes-2026-com-100-das-secoes-totalizadas-flavio-tem-4703-e/633498/'],
  ['O Liberal: Datafolha de 8/10', 'https://www.oliberal.com/politica/datafolha-flavio-bolsonaro-tem-49-e-lula-45-no-2-turno-1.1179030'],
  ['O Liberal: calendário após o 1º turno', 'https://www.oliberal.com/eleicoes/calendario-eleitoral-veja-as-proximas-datas-apos-o-1-turno-das-eleic-es-1.1177671'],
  ['NSC Total: diplomação e posses', 'https://www.nsctotal.com.br/politica/diplomacao-eleitos-18-dezembro-2026'],
  ['O Liberal: STF terá três aposentadorias até 2030', 'https://www.oliberal.com/politica/stf-tera-tres-aposentadorias-ate-2030-presidente-eleito-podera-indicar-quase-um-terco-da-corte-1.1169042'],
  ['Bem Paraná: Senado rejeita Messias por 42 a 34', 'https://www.bemparana.com.br/noticias/politica/por-42-a-34-senado-rejeita-messias-para-o-stf-e-lula-sofre-derrota-historica/'],
  ['Constituição Federal', 'https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm'],
  ['Lei 1.079/1950 (crimes de responsabilidade)', 'https://www.planalto.gov.br/ccivil_03/leis/l1079.htm'],
];
