# Spec Index — vtex-deploy

Mapa de specs por agente. Cada spec es una conversación completa con precondiciones, diálogo esperado, criterios de éxito y criterios de falla.

## Por agente

| Agente | Specs que lo cubren |
|--------|---------------------|
| orchestrator | A2, A5, Q1, Q4, P1, C1, P5 |
| deploy-qa | Q1, Q2, Q4, Q5, A5, C1 |
| deploy-prod | P1, P4, P5, C1 |
| vendor-transformer | Q1, P1 |
| release-validator | Q1, Q5, P1 |
| deploy-state | A5, P4 |
| git-manager | Q1, P1 |
| config-reader | Q1, Q4, P1 |

## Por prioridad

### Críticas (gates que nunca deben fallar)
- [Q2](flows/Q2-usuario-dice-no-en-validacion.md) — Usuario dice NO en validación QA
- [P4](flows/P4-no-en-validacion-prod.md) — Usuario dice NO en validación Producción

### Alta prioridad
- [A2](flows/A2-apertura-normal.md) — Apertura normal
- [A5](flows/A5-retomar-qa-interrumpido.md) — Retomar deploy interrumpido
- [Q1](flows/Q1-qa-full-happy-path.md) — qa:full happy path
- [Q4](flows/Q4-probar-antes-de-decidir.md) — Probar antes de decidir
- [Q5](flows/Q5-tag-exists.md) — TAG_EXISTS en vtex release
- [P1](flows/P1-prod-from-qa-happy-path.md) — prod:from-qa happy path

### Media prioridad
- [C1](flows/C1-encadenar-qa-a-prod.md) — Encadenar QA → Prod
- [P5](flows/P5-prod-sin-qa-previo.md) — Prod sin QA previo

## Convención de IDs

- `A*` — Apertura / estado inicial
- `Q*` — Flujos QA
- `P*` — Flujos Producción
- `C*` — Encadenamiento entre flujos
- `E*` — Errores de infraestructura (pendientes)
