# PasteHub - Frontend

Este repositório contém o código-fonte do frontend da aplicação PasteHub, desenvolvido como parte do desafio técnico da Watch Brasil. O frontend foi construído utilizando Vue.js com Nuxt para oferecer uma experiência moderna e responsiva.

## Tecnologias Utilizadas

- **Framework**: Vue.js 3 + Nuxt 3
- **Gerenciamento de Estado**: Pinia
- **Estilização**: Tailwind CSS
- **Comunicação**: API REST + WebSocket
- **Componentes UI**: ShadCN-Vue
- **Internacionalização**: Vue I18n
- **Build Tool**: Vite
- **Testes**: Vitest + Vue Test Utils

## Estrutura de Pastas

```
frontend/
│── components/     # Componentes reutilizáveis
│   ├── ui/         # Componentes de interface (botões, formulários, etc)
│   ├── layout/     # Componentes de layout (header, footer, etc)
│   └── feature/    # Componentes específicos de features
│── pages/          # Páginas principais do Nuxt
│── stores/         # Gerenciamento de estado (Pinia)
│── assets/         # Estilos e imagens
│── layouts/        # Layouts globais
│── public/         # Arquivos estáticos
│── middleware/     # Middleware do Nuxt
│── plugins/        # Plugins Vue/Nuxt
│── i18n/locales/        # Arquivos de tradução
```

## Principais Páginas

- **/** → Página inicial
- **/text/new** → Criar novo texto
- **/text/edit/:id** → Editar texto
- **/share/:id** → Página pública de compartilhamento
- **/auth/login** → Login de usuário
- **/auth/register** → Cadastro de usuário
- **/dashboard** → Painel do usuário
- **/settings** → Configurações da conta

## Recursos Implementados

- **Edição em Tempo Real**: Colaboração em tempo real através de WebSockets
- **Syntax Highlighting**: Suporte a mais de 100 linguagens de programação
- **Temas Personalizáveis**: Modo claro/escuro e outras opções de personalização
- **Compartilhamento Seguro**: Opções de privacidade e senhas para compartilhamento
- **Histórico de Versões**: Capacidade de reverter para versões anteriores
- **Responsive Design**: Interface adaptável para desktop, tablet e dispositivos móveis
- **PWA (Progressive Web App)**: Suporte offline e instalação como aplicativo

## Como Instalar e Executar

### Pré-requisitos

- Node.js v16+
- NPM ou Yarn

## Comunicação com o Backend

O frontend se comunica com o backend através de:

1. **API REST**: Para operações CRUD padrão
2. **WebSockets**: Para atualizações em tempo real e colaboração

## Gerenciamento de Estado

Utilizamos Pinia para gerenciamento de estado centralizado

## Internacionalização (i18n)

O aplicativo suporta múltiplos idiomas através de Vue I18n.

## CI/CD

O projeto utiliza GitHub Actions para integração e deploy contínuos. Veja `.github/workflows/` para detalhes da configuração.

## Performance e Otimização

- **Code Splitting**: Carregamento sob demanda de componentes
- **Tree Shaking**: Remoção de código não utilizado
- **Lazy Loading de Rotas**: Carregamento de componentes conforme necessário
- **Compressão de Imagens**: Otimização automática de assets
- **Server-Side Rendering**: Melhor SEO e performance inicial

## Acessibilidade

O projeto segue as diretrizes WCAG 2.1 AA, incluindo:

- Contraste adequado de cores
- Suporte a navegação por teclado
- Tags semânticas de HTML
- Textos alternativos para imagens
- ARIA labels onde apropriado
