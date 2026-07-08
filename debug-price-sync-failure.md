[OPEN] Debug session: price-sync-failure

## Sintoma
- Agente local (PainelTVSyncAgent) está Running, mas não sincroniza o ITENSMGV.TXT.
- Dashboard mostra “Falha ao consultar status de sincronizacao”.

## Evidência inicial
- GET https://ofertascaique.cloud/api/sync-status retorna HTTP 500 com body: {"error":"Falha ao consultar status de sincronizacao"}.
- POST https://ofertascaique.cloud/api/importar-precos sem autenticação retorna HTTP 401 (endpoint está acessível).

## Hipóteses (falsificáveis)
- H1: Backend em produção está com schema SQLite desatualizado (ex.: tabela import_job sem colunas status/error), causando erro no /api/sync-status e possivelmente na importação.
- H2: Token do agente está inválido/expirado, resultando em 401 no upload e o arquivo ficando na fila pendente.
- H3: Agente não detecta alteração do arquivo (arquivo_monitorado incorreto, sem permissão de leitura, ou evento do filesystem não dispara), então o upload nunca ocorre.
- H4: API URL configurada no agente está incorreta ou bloqueada (DNS/SSL/firewall), resultando em falha de rede/timeout.
- H5: Backend recebe o upload, mas falha durante o processamento (500 no importar-precos), impedindo conclusão da sincronização.

## Próximos passos de coleta
- Coletar logs do agente (sync.log e task-launch.log) e status da fila pendente.
- Coletar logs do backend no servidor (stacktrace do endpoint /api/sync-status e do endpoint /api/importar-precos).

