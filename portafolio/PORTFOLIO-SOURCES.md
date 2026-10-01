# Fuentes del portafolio v4

Las muestras públicas se construyeron desde activos fuente, no desde capturas de la interfaz de Claude Design.

- **Pafi:** cápsula aislada `pafi-portfolio-source-v0.1.zip`, SHA-256 `19ba7322292b1e81bd7d7d5e49f8ec57238081edf227eef9d519dfbc175e6508`. La galería pública usa solo mockups fuente de tote, termo y stickers. El editor privado de Pafi Studio queda excluido de la web y de sus activos publicados.
- **QuickFinance:** paquete de sistema de marca `quickfinance-brand-kit-0.2.0-rc.2.zip`, SHA-256 `a35f68a2824b6b8836b2d5a633a6a66800a205f8771d0fa76633a9c35a44bba1`. Se usaron las fotografías `qf-b6-negocio.png`, `qf-b6-tablet-taller.png` y el elemento `03-analiza.svg`; no se publicaron capturas del producto que todavía no está disponible.
- **Tamanova:** fotografía real y páginas completas de la guía en `portafolio/snaps/tamanova-dv-v2-*`.
- **Marca personal:** composición 16:10 con el sitio auténtico completo en `portafolio/snaps/arturo-dv-v3-01-ensamble.webp`.

Las placas 16:10 se regeneran con `scripts/assemble_portfolio_v4.py`. Ese script espera que los paquetes fuente se restituyan localmente en `portafolio/source/`; esa carpeta no se publica para evitar exponer los kits completos.
