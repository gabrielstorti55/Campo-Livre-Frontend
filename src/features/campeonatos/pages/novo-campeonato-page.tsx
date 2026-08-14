import { Copy, Plus, QrCode } from 'lucide-react';
import { useState } from 'react';

import { ListRow } from '@/shared/components/list-row';
import {
  Card,
  Field,
  FilterPills,
  Initials,
  PageHeader,
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
          <Field label="Nome do campeonato" htmlFor="nome-do-campeonato-field">
            <Input
              id="nome-do-campeonato-field"
              placeholder="Ex.: Copa Franca 2026"
            />
          </Field>
          <Field label="Modalidade" htmlFor="modalidade-field">
            <Select defaultValue="Society">
              <SelectTrigger id="modalidade-field">
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
          <Field label="Formato" htmlFor="formato-field">
            <Select defaultValue="Pts Corridos">
              <SelectTrigger id="formato-field">
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
          <Field label="Nº de times" htmlFor="no-de-times-field">
            <Input id="no-de-times-field" type="number" defaultValue={8} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Data início" htmlFor="data-inicio-field">
              <Input id="data-inicio-field" type="date" />
            </Field>
            <Field label="Data fim" htmlFor="data-fim-field">
              <Input id="data-fim-field" type="date" />
            </Field>
          </div>
          <Field label="Observações" htmlFor="observacoes-field">
            <Textarea
              id="observacoes-field"
              rows={3}
              placeholder="Regras, taxas, avisos..."
            />
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
          <Button
            variant="campo"
            className="w-full"
            onClick={() => setPasso(1)}
          >
            Continuar
          </Button>
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
          <Field label="Nome do time" htmlFor="nome-do-time-field">
            <Input
              id="nome-do-time-field"
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
            <Button
              variant="campoOutline"
              className="w-full py-2.5"
              onClick={() => setJogadores([...jogadores, ''])}
            >
              <Plus className="h-4 w-4" /> Adicionar jogador
            </Button>
          </div>
          <Button
            variant="campo"
            className="w-full"
            onClick={() => {
              if (novoTime.trim())
                setTimesAdicionados([...timesAdicionados, novoTime.trim()]);
              setNovoTime('');
            }}
          >
            Salvar time
          </Button>
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
            <Button
              variant="campoOutline"
              className="flex-1"
              onClick={() => setPasso(0)}
            >
              Voltar
            </Button>
            <Button
              variant="campo"
              className="flex-1"
              onClick={() => setPasso(2)}
            >
              Continuar
            </Button>
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
          <Button variant="campo" className="w-full">
            Gerar link de inscrição
          </Button>
          <Button
            variant="campoOutline"
            className="w-full"
            onClick={() => setPasso(1)}
          >
            Voltar
          </Button>
          <Button variant="campo" className="w-full">
            Salvar e concluir
          </Button>
        </Card>
      ) : null}
    </>
  );
}
