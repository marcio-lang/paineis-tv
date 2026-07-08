# Instalacao Do Agente No Windows

## Objetivo

Este documento descreve como instalar o agente local de sincronizacao no Windows, como configurar a inicializacao automatica e como verificar se o servico esta funcionando corretamente.

## Arquivos Necessarios

Copie estes arquivos para a maquina Windows de destino, preferencialmente em `C:\agente-local`:

- `config.json`
- `requirements.txt`
- `retry_queue.py`
- `start_agent.ps1`
- `sync_agent.py`
- `install_agent_task.ps1`

## Pre-Requisitos

Antes da instalacao, valide:

- Windows com permissao para criar tarefa agendada
- Python 3 instalado
- Launcher `py` funcionando no PowerShell
- Acesso ao arquivo monitorado
- Acesso HTTP/HTTPS ao endpoint da API

Comandos para validar o Python:

```powershell
py --version
where.exe py
```

Se o comando `py --version` responder corretamente, o ambiente esta apto para executar o agente.

## Estrutura Esperada

Exemplo de estrutura em disco:

```text
C:\agente-local\
  config.json
  requirements.txt
  retry_queue.py
  start_agent.ps1
  sync_agent.py
  install_agent_task.ps1
```

## Configuracao

O arquivo `config.json` define:

- `arquivo_monitorado`: arquivo TXT observado pelo agente
- `api_url`: endpoint de envio
- `token`: token Bearer de autenticacao
- `debounce_segundos`: tempo minimo para agrupar alteracoes
- `retry_segundos`: intervalo de tentativas da fila pendente

Exemplo:

```json
{
  "arquivo_monitorado": "C:\\SGLinx\\TOLEDO\\ITENSMGV.TXT",
  "api_url": "https://ofertascaique.cloud/api/importar-precos",
  "token": "SEU_TOKEN",
  "debounce_segundos": 10,
  "retry_segundos": 60
}
```

## Instalacao Das Dependencias

Abra o PowerShell como Administrador e execute:

```powershell
cd C:\agente-local
py -3 -m pip install -r .\requirements.txt
```

Dependencias instaladas:

- `requests`
- `watchdog`

## Teste Manual Do Agente

Antes de registrar a tarefa agendada, valide a execucao manual:

```powershell
cd C:\agente-local
powershell -ExecutionPolicy Bypass -File .\start_agent.ps1
```

Resultado esperado no console:

```text
INFO Agente iniciado: arquivo=... api=...
INFO Debounce=10s Retry=60s
```

Enquanto esse teste estiver em execucao, a janela do PowerShell precisa permanecer aberta.

## Instalacao Da Tarefa Agendada

Depois que o teste manual funcionar, registre a tarefa:

```powershell
cd C:\agente-local
powershell -ExecutionPolicy Bypass -File .\install_agent_task.ps1
```

Resultado esperado:

```text
Tarefa 'PainelTVSyncAgent' registrada com sucesso.
```

Essa tarefa foi configurada para iniciar no logon do usuario que a instalou.

## Teste Da Tarefa Agendada

Para iniciar manualmente pela tarefa:

```powershell
Start-ScheduledTask -TaskName PainelTVSyncAgent
```

Para verificar o estado:

```powershell
Get-ScheduledTask -TaskName PainelTVSyncAgent | Select-Object TaskName,State
Get-ScheduledTaskInfo -TaskName PainelTVSyncAgent | Format-List LastRunTime,LastTaskResult
```

## Interpretacao Do Status

Principais estados e codigos:

- `State = Running`: a tarefa esta ativa neste momento
- `State = Ready`: a tarefa esta registrada, mas nao esta executando agora
- `LastTaskResult = 267009`: a tarefa esta em execucao (`0x41301`)
- `LastTaskResult = 0`: a ultima execucao terminou com sucesso
- `LastTaskResult = 1`: houve falha na execucao
- `LastTaskResult = 3221225786`: o processo foi interrompido (`0xC000013A`), normalmente por fechamento da janela ou `Ctrl+C`

## Logs Do Agente

O agente cria logs dentro de `C:\agente-local\logs`.

Arquivos principais:

- `task-launch.log`: registra como o `start_agent.ps1` iniciou o agente
- `sync.log`: registra inicializacao, eventos do arquivo e sincronizacoes

Comandos uteis:

```powershell
Get-Content C:\agente-local\logs\task-launch.log -Tail 30
Get-Content C:\agente-local\logs\sync.log -Tail 30
```

## Sinais De Funcionamento Correto

Considere o agente operacional quando houver:

- tarefa `PainelTVSyncAgent` registrada com sucesso
- `State = Running`
- `LastTaskResult = 267009` enquanto estiver ativo
- linhas recentes em `task-launch.log`
- linhas recentes em `sync.log`
- mensagens como `Sincronizacao concluida` no log

Exemplo real de log saudavel:

```text
INFO Agente iniciado: arquivo=C:\SGLinx\TOLEDO\ITENSMGV.TXT api=https://ofertascaique.cloud/api/importar-precos
INFO Debounce=10s Retry=60s
INFO Alteracao detectada; aguardando debounce: FileModifiedEvent
INFO Sincronizacao concluida: origem=FileModifiedEvent arquivo=ITENSMGV.TXT resposta=202
```

## Verificacao Apos Reiniciar O Windows

Para confirmar a inicializacao automatica:

1. Reinicie a maquina.
2. Faca login com o mesmo usuario que instalou a tarefa.
3. Aguarde de 10 a 20 segundos.
4. Execute:

```powershell
Get-ScheduledTask -TaskName PainelTVSyncAgent | Select-Object TaskName,State
Get-ScheduledTaskInfo -TaskName PainelTVSyncAgent | Format-List LastRunTime,LastTaskResult
Get-Content C:\agente-local\logs\task-launch.log -Tail 20
```

Resultado esperado:

- `State = Running`
- `LastRunTime` atualizado para o horario do logon
- `LastTaskResult = 267009`
- log com nova linha de inicializacao

## Solucao De Problemas

### Python nao encontrado em um caminho executavel valido

Valide:

```powershell
py --version
where.exe py
```

Se o `py` responder, revise o arquivo `start_agent.ps1` e teste:

```powershell
powershell -ExecutionPolicy Bypass -File C:\agente-local\start_agent.ps1
```

### Tarefa registrada, mas nao inicia

Valide:

```powershell
Get-ScheduledTaskInfo -TaskName PainelTVSyncAgent | Format-List *
Get-Content C:\agente-local\logs\task-launch.log -Tail 50
```

### Agente sobe, mas a API responde erro HTTP

O agente pode estar funcionando corretamente, mas o endpoint rejeitar a requisicao. Nesse caso, consulte `sync.log` para verificar o codigo retornado pela API.

### Janela do PowerShell fecha e o agente para

Isso acontece apenas na execucao manual. Em operacao normal, o agente deve ser iniciado pela tarefa agendada.

## Comandos Rapidos

Instalar dependencias:

```powershell
cd C:\agente-local
py -3 -m pip install -r .\requirements.txt
```

Testar agente manualmente:

```powershell
powershell -ExecutionPolicy Bypass -File C:\agente-local\start_agent.ps1
```

Registrar tarefa:

```powershell
powershell -ExecutionPolicy Bypass -File C:\agente-local\install_agent_task.ps1
```

Iniciar tarefa:

```powershell
Start-ScheduledTask -TaskName PainelTVSyncAgent
```

Consultar estado:

```powershell
Get-ScheduledTask -TaskName PainelTVSyncAgent | Select-Object TaskName,State
Get-ScheduledTaskInfo -TaskName PainelTVSyncAgent | Format-List LastRunTime,LastTaskResult
```
