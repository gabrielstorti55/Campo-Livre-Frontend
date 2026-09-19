import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ProvedorConsentimentosApi } from '@/contexts/consentimentos-api';
import { TelaConsentimentoResponsavel } from '@/screens/publico/consentimento-responsavel';
import { TelaParental } from '@/screens/publico/parental';
import { TelaRevogacaoConsentimento } from '@/screens/publico/revogacao-consentimento';
import type { ConsentimentosApi } from '@/services/consentimentos/consentimentos-api';

function renderizar(ui: React.ReactNode, api: Partial<ConsentimentosApi>) {
  render(
    <ProvedorConsentimentosApi api={api as ConsentimentosApi}>
      {ui}
    </ProvedorConsentimentosApi>,
  );
}

describe('jornada de consentimento parental', () => {
  it('registra os dados reais do responsável e informa que o link depende do envio aceito', async () => {
    const iniciar = vi.fn().mockResolvedValue({
      consentimentoId: 'c-1',
      status: 'AGUARDANDO_DOCUMENTO',
      envioAceito: true,
    });
    renderizar(<TelaConsentimentoResponsavel />, { iniciar });

    fireEvent.change(screen.getByLabelText('Nome completo'), {
      target: { value: 'Maria da Silva' },
    });
    fireEvent.change(screen.getByLabelText('CPF'), {
      target: { value: '52998224725' },
    });
    fireEvent.change(screen.getByLabelText('Data de nascimento'), {
      target: { value: '1980-01-02' },
    });
    fireEvent.change(screen.getByLabelText('E-mail'), {
      target: { value: 'maria@exemplo.com' },
    });
    fireEvent.change(screen.getByLabelText('Relação com o menor'), {
      target: { value: 'Mãe' },
    });
    fireEvent.change(screen.getByLabelText('Senha de revogação'), {
      target: { value: 'Segredo forte 123' },
    });
    fireEvent.click(screen.getByLabelText(/responsável legal/i));
    fireEvent.click(screen.getByLabelText(/autorizo o tratamento/i));
    fireEvent.click(
      screen.getByRole('button', { name: 'Registrar consentimento' }),
    );

    await waitFor(() => expect(iniciar).toHaveBeenCalledTimes(1));
    expect(iniciar.mock.calls[0]![0]).toMatchObject({
      responsavel: {
        nomeCompleto: 'Maria da Silva',
        declaraResponsabilidadeLegal: true,
      },
      termoVersao: '2026-09',
      aceitaConsentimento: true,
    });
    expect(await screen.findByText(/envio do link foi aceito/i)).toBeVisible();
    expect(screen.getByText(/guarde a senha de revogação/i)).toBeVisible();
  });

  it('captura e remove o token parental da URL, consulta e envia documento permitido', async () => {
    window.history.replaceState(
      {},
      '',
      '/consentimento-responsavel/parental?token=token-secreto',
    );
    const consultarParental = vi.fn().mockResolvedValue({
      statusConsentimento: 'AGUARDANDO_DOCUMENTO',
      statusTentativa: 'NAO_INICIADA',
      decisao: null,
      uploadPermitido: true,
      expiraEm: '2030-01-01T00:00:00.000Z',
      proximaAcao: 'ENVIAR_DOCUMENTO',
    });
    const enviarDocumento = vi.fn().mockResolvedValue({
      tentativaId: 't-1',
      estadoProcessamento: 'RECEBIDA',
      statusConsentimento: 'EM_ANALISE',
    });
    renderizar(<TelaParental />, { consultarParental, enviarDocumento });

    expect(
      await screen.findByText('Envie o documento do responsável'),
    ).toBeVisible();
    expect(consultarParental).toHaveBeenCalledWith('token-secreto');
    expect(window.location.pathname + window.location.search).toBe(
      '/consentimento-responsavel/parental',
    );

    const arquivo = new File(['bytes'], 'documento.jpg', {
      type: 'image/jpeg',
    });
    fireEvent.change(screen.getByLabelText('Documento do responsável'), {
      target: { files: [arquivo] },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Enviar documento' }));

    await waitFor(() =>
      expect(enviarDocumento).toHaveBeenCalledWith('token-secreto', arquivo),
    );
    expect(
      await screen.findByText(/documento recebido para análise/i),
    ).toBeVisible();
  });

  it.each([
    ['AGUARDAR_REVISAO', 'Documento em análise'],
    ['TENTAR_NOVAMENTE', 'Envie uma nova foto'],
    ['CONCLUIDO', 'Análise concluída'],
  ] as const)(
    'representa a próxima ação real %s',
    async (proximaAcao, mensagem) => {
      window.history.replaceState(
        {},
        '',
        `/consentimento-responsavel/parental?token=${proximaAcao}`,
      );
      const consultarParental = vi.fn().mockResolvedValue({
        statusConsentimento:
          proximaAcao === 'CONCLUIDO' ? 'APROVADO' : 'EM_ANALISE',
        statusTentativa:
          proximaAcao === 'CONCLUIDO' ? 'DECIDIDA' : 'AGUARDANDO_REVISAO',
        decisao: proximaAcao === 'CONCLUIDO' ? 'VALIDO' : null,
        uploadPermitido: proximaAcao === 'TENTAR_NOVAMENTE',
        expiraEm: '2030-01-01T00:00:00.000Z',
        proximaAcao,
      });
      renderizar(<TelaParental />, { consultarParental });
      expect(await screen.findByText(mensagem)).toBeVisible();
    },
  );
});

describe('revogação parental', () => {
  it('remove o token da URL, mostra somente os efeitos retornados e exige confirmação', async () => {
    window.history.replaceState(
      {},
      '',
      '/revogar-consentimento?token=token-revogacao',
    );
    const consultarRevogacao = vi.fn().mockResolvedValue({
      nomeUsuarioMenor: 'atleta jovem',
      idade: 15,
      statusConsentimento: 'ATIVO',
      efeitos: {
        contaInativadaImediatamente: true,
        prazoEliminacaoDias: 90,
        fatosEsportivosDefinitivosPermanecem: true,
      },
    });
    const revogar = vi.fn().mockResolvedValue({
      consentimentoRevogado: true,
      contaMenorInativada: true,
      eliminacaoAgendadaPara: '2030-04-01T00:00:00.000Z',
    });
    renderizar(<TelaRevogacaoConsentimento />, { consultarRevogacao, revogar });

    expect(await screen.findByText(/atleta jovem, 15 anos/i)).toBeVisible();
    expect(window.location.pathname + window.location.search).toBe(
      '/revogar-consentimento',
    );
    expect(screen.getByText(/90 dias/i)).toBeVisible();
    expect(
      screen.getByText(/fatos esportivos definitivos permanecerão/i),
    ).toBeVisible();

    fireEvent.change(screen.getByLabelText('Senha de revogação'), {
      target: { value: 'senha-secreta' },
    });
    expect(
      screen.getByRole('button', { name: 'Revogar consentimento' }),
    ).toBeDisabled();
    fireEvent.click(screen.getByLabelText(/confirmo que desejo revogar/i));
    fireEvent.click(
      screen.getByRole('button', { name: 'Revogar consentimento' }),
    );

    await waitFor(() =>
      expect(revogar).toHaveBeenCalledWith('token-revogacao', 'senha-secreta'),
    );
    expect(await screen.findByText(/consentimento revogado/i)).toBeVisible();
  });

  it('não permite nova execução quando o consentimento já está revogado', async () => {
    window.history.replaceState({}, '', '/revogar-consentimento?token=usado');
    const consultarRevogacao = vi.fn().mockResolvedValue({
      nomeUsuarioMenor: 'atleta',
      idade: 16,
      statusConsentimento: 'REVOGADO',
      efeitos: {
        contaInativadaImediatamente: true,
        prazoEliminacaoDias: 90,
        fatosEsportivosDefinitivosPermanecem: true,
      },
    });
    renderizar(<TelaRevogacaoConsentimento />, { consultarRevogacao });
    expect(await screen.findByText(/já foi revogado/i)).toBeVisible();
    expect(
      screen.queryByLabelText('Senha de revogação'),
    ).not.toBeInTheDocument();
  });
});
