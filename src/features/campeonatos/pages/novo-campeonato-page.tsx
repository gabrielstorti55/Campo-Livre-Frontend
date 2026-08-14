import { Copy, Plus, QrCode } from 'lucide-react';
import { useState } from 'react';

import { ListRow } from '@/shared/components/list-row';
import {
  Card,
  Field,
  FilterPills,
  Initials,
  OutlineButton,
  PageHeader,
  PrimaryButton,
} from '@/shared/components/campo-livre-ui';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Progress } from '@/shared/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Switch } from '@/shared/components/ui/switch';
import { Textarea } from '@/shared/components/ui/textarea';

const passos = ['Dados do campeonato', 'Adicionar Times', 'Convidar por link'];
const modosTime = ['Cadastrar Normal', 'Cadastrar por convite'];

export function NovoCampeonato() {
  const [passo, setPasso] = useState(0);
  const [publico, setPublico] = useState(true);
  const [modoTime, setModoTime] = useState(modosTime[0] ?? '');
  const [timesAdicionados, setTimesAdicionados] = useState([
    'Time A',
    'Leões FC',
  ]);
  const [jogadores, setJogadores] = useState(['Marcos Oliveira']);
  const [novoTime, setNovoTime] = useState('');

  return (
    <>
      <PageHeader
        title="Novo Campeonato"
        subtitle={`Passo ${passo + 1} de 3 — ${passos[passo]}`}
      />
      <Progress
        value={((passo + 1) / passos.length) * 100}
        aria-label={`Passo ${passo + 1} de ${passos.length}`}
      />

      {passo === 0 ? (
        <Card className="max-w-2xl space-y-4">
          <Field label="Nome do campeonato">
            <Input placeholder="Ex.: Copa Franca 2026" />
          </Field>
          <Field label="Modalidade">
            <Select defaultValue="Society">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Society">Society</SelectItem>
                <SelectItem value="Futebol de Campo">
                  Futebol de Campo
                </SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Formato">
            <Select defaultValue="Pts Corridos">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pts Corridos">Pts Corridos</SelectItem>
                <SelectItem value="Chaveamento">Chaveamento</SelectItem>
                <SelectItem value="Fase de Grupos + Chaveamento">
                  Fase de Grupos + Chaveamento
                </SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Nº de times">
            <Input type="number" defaultValue={8} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Data início">
              <Input type="date" />
            </Field>
            <Field label="Data fim">
              <Input type="date" />
            </Field>
          </div>
          <Field label="Observações">
            <Textarea rows={3} placeholder="Regras, taxas, avisos..." />
          </Field>
          <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
            <div>
              <p className="font-display text-sm font-medium">
                Visível ao público
              </p>
              <p className="text-xs text-muted-foreground">
                Permite que atletas encontrem o campeonato.
              </p>
            </div>
            <Switch
              checked={publico}
              onCheckedChange={setPublico}
              aria-label="Visível ao público"
            />
          </div>
          <PrimaryButton className="w-full" onClick={() => setPasso(1)}>
            Continuar
          </PrimaryButton>
        </Card>
      ) : null}

      {passo === 1 ? (
        <Card className="max-w-2xl space-y-4">
          <FilterPills
            options={modosTime}
            value={modoTime}
            onChange={setModoTime}
            variant="solid"
          />
          <Field label="Nome do time">
            <Input
              value={novoTime}
              onChange={(e) => setNovoTime(e.target.value)}
              placeholder="Ex.: Estrela Azul"
            />
          </Field>
          <div className="space-y-2">
            <span className="font-display text-sm font-medium">Jogadores</span>
            {jogadores.map((j, i) => (
              <div key={i} className="grid gap-2 sm:grid-cols-2">
                <Input
                  value={j}
                  onChange={(e) => {
                    const next = [...jogadores];
                    next[i] = e.target.value;
                    setJogadores(next);
                  }}
                  placeholder="Nome do jogador"
                />
                <Select defaultValue="Atacante">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Atacante">Atacante</SelectItem>
                    <SelectItem value="Meia">Meia</SelectItem>
                    <SelectItem value="Zagueiro">Zagueiro</SelectItem>
                    <SelectItem value="Goleiro">Goleiro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ))}
            <OutlineButton
              className="w-full py-2.5"
              onClick={() => setJogadores([...jogadores, ''])}
            >
              <Plus className="h-4 w-4" /> Adicionar jogador
            </OutlineButton>
          </div>
          <PrimaryButton
            className="w-full"
            onClick={() => {
              if (novoTime.trim())
                setTimesAdicionados([...timesAdicionados, novoTime.trim()]);
              setNovoTime('');
            }}
          >
            Salvar time
          </PrimaryButton>
          <div className="space-y-2 border-t border-border pt-4">
            <p className="font-display text-sm font-semibold">
              Times adicionados
            </p>
            {timesAdicionados.map((t) => (
              <ListRow
                key={t}
                avatar={<Initials name={t} className="h-9 w-9 text-xs" />}
                title={t}
                className="border shadow-none"
              />
            ))}
          </div>
          <div className="flex gap-3">
            <OutlineButton className="flex-1" onClick={() => setPasso(0)}>
              Voltar
            </OutlineButton>
            <PrimaryButton className="flex-1" onClick={() => setPasso(2)}>
              Continuar
            </PrimaryButton>
          </div>
        </Card>
      ) : null}

      {passo === 2 ? (
        <Card className="max-w-2xl space-y-5 text-center">
          <div className="mx-auto grid h-44 w-44 place-items-center rounded-2xl border border-border bg-surface">
            <QrCode className="h-24 w-24 text-green-dark" />
          </div>
          <p className="text-sm text-muted-foreground">
            Compartilhe o QR code ou o link abaixo para os times se inscreverem.
          </p>
          <div className="flex items-center gap-2 rounded-xl border border-border p-3">
            <span className="min-w-0 flex-1 truncate text-left text-sm text-muted-foreground">
              campolivre.app/inscricao/copa-franca-2026
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-green-mid"
              aria-label="Copiar link"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <PrimaryButton className="w-full">
            Gerar link de inscrição
          </PrimaryButton>
          <OutlineButton className="w-full" onClick={() => setPasso(1)}>
            Voltar
          </OutlineButton>
          <PrimaryButton className="w-full">Salvar e concluir</PrimaryButton>
        </Card>
      ) : null}
    </>
  );
}
