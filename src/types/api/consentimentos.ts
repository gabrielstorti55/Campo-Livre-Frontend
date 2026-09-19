export type EntradaInicioConsentimento = {
  responsavel: {
    nomeCompleto: string;
    cpf: string;
    dataNascimento: string;
    email: string;
    relacaoComMenor: string;
    declaraResponsabilidadeLegal: boolean;
  };
  senhaRevogacao: string;
  termoVersao: string;
  aceitaConsentimento: boolean;
};

export type RespostaInicioConsentimento = {
  consentimentoId: string;
  status: 'AGUARDANDO_DOCUMENTO';
  envioAceito: boolean;
};

export type EstadoConsentimentoParental = {
  statusConsentimento:
    | 'AGUARDANDO_DOCUMENTO'
    | 'EM_ANALISE'
    | 'APROVADO'
    | 'REVOGADO'
    | 'ENCERRADO';
  statusTentativa:
    | 'NAO_INICIADA'
    | 'RECEBIDA'
    | 'PROCESSANDO'
    | 'AGUARDANDO_REVISAO'
    | 'DECIDIDA'
    | 'EXPIRADA'
    | 'FALHOU';
  decisao: 'VALIDO' | 'INVALIDO' | 'TIRAR_FOTO_NOVAMENTE' | null;
  uploadPermitido: boolean;
  expiraEm: string;
  proximaAcao:
    'ENVIAR_DOCUMENTO' | 'AGUARDAR_REVISAO' | 'TENTAR_NOVAMENTE' | 'CONCLUIDO';
};

export type RespostaEnvioDocumento = {
  tentativaId: string;
  estadoProcessamento: 'RECEBIDA';
  statusConsentimento: 'EM_ANALISE';
};

export type EfeitosRevogacao = {
  contaInativadaImediatamente: true;
  prazoEliminacaoDias: 90;
  fatosEsportivosDefinitivosPermanecem: true;
};

export type ConsultaRevogacao = {
  nomeUsuarioMenor: string;
  idade: number;
  statusConsentimento: 'ATIVO' | 'REVOGADO';
  efeitos: EfeitosRevogacao;
};

export type RespostaRevogacao = {
  consentimentoRevogado: true;
  contaMenorInativada: true;
  eliminacaoAgendadaPara: string;
};
