'use client';

import { Mail, MapPin } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { DestaquePagina } from '@/components/layout/destaque-pagina';
import { EstadoRecurso } from '@/components/layout/estado-recurso';
import { useCamposApi } from '@/contexts/campos-api';
import type { CampoDetalhado } from '@/types/api/campos';

const rotulosEstado = {
  ATIVO: 'Ativo',
  INATIVO: 'Inativo',
  EM_MANUTENCAO: 'Em manutenção',
} as const;

export function TelaDetalhesCampo() {
  const { id } = useParams<{ id: string }>();
  const api = useCamposApi();
  const [estado, setEstado] = useState<{
    idConsultado: string | null;
    campo: CampoDetalhado | null;
    falhou: boolean;
  }>({ idConsultado: null, campo: null, falhou: false });

  useEffect(() => {
    let ativo = true;
    void api.consultarCampo(id).then(
      (campo) => {
        if (ativo) setEstado({ idConsultado: id, campo, falhou: false });
      },
      () => {
        if (ativo) setEstado({ idConsultado: id, campo: null, falhou: true });
      },
    );
    return () => {
      ativo = false;
    };
  }, [api, id]);

  if (estado.idConsultado !== id) {
    return <p role="status">Carregando campo...</p>;
  }

  if (estado.falhou || !estado.campo) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
        <EstadoRecurso
          kind="error"
          title="Campo não encontrado"
          description="O link pode estar incorreto ou o campo não está disponível."
        />
      </div>
    );
  }

  const { campo } = estado;
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <DestaquePagina
        eyebrow={`${campo.municipio.nome}/${campo.municipio.uf}`}
        title={campo.nome}
        description={
          campo.descricao ?? 'Campo municipal cadastrado para consulta pública.'
        }
        action={
          <span className="border border-green-dark px-3 py-1.5 text-xs font-bold uppercase">
            {rotulosEstado[campo.statusOperacional]}
          </span>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="border-t-2 border-green-dark bg-card p-5 sm:p-6">
          <h2 className="font-display text-2xl font-bold uppercase">
            Localização informada
          </h2>
          <p className="mt-4 flex items-start gap-2 text-sm">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            {campo.endereco} · {campo.municipio.nome}/{campo.municipio.uf}
          </p>
          <p className="mt-5 border-l-2 border-accent pl-3 text-sm text-muted-foreground">
            {campo.aviso}
          </p>
        </section>

        <section className="border-t-2 border-navy-dark bg-card p-5 sm:p-6">
          <h2 className="font-display text-2xl font-bold uppercase">
            Prefeitura responsável
          </h2>
          <p className="mt-4 font-semibold">{campo.prefeitura.nomeOficial}</p>
          <p className="mt-2 flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4" aria-hidden="true" />
            {campo.prefeitura.emailInstitucional}
          </p>
        </section>
      </div>
    </div>
  );
}
