# Gerenciador de Tarefas

Este projeto implementa um sistema web interativo para gerenciamento de tarefas (To-Do List). O backend é construído com Google Apps Script, que interage diretamente com uma planilha do Google Sheets para armazenamento de dados, funcionando como um serviço web RESTful. O cliente é uma aplicação web dinâmica desenvolvida com HTML, CSS e JavaScript.

📅 ### Data de Entrega
5 de Junho

🚀 ## Funcionalidades

O sistema permite realizar as quatro operações básicas de um CRUD (Create, Read, Update, Delete) em tarefas, além de uma funcionalidade para gerar listas de compras:

* Criar (Create): Adicionar uma nova tarefa com título, descrição e status. Inclui uma opção para gerar uma "Lista de Compras" a partir de itens pré-definidos, preenchendo automaticamente a descrição.

* Listar (Read All): Visualizar todas as tarefas existentes na planilha do Google Sheets.

* Consultar (Read One): Obter detalhes de uma tarefa específica por seu ID (usado internamente para edição).

* Atualizar (Update): Modificar o título, descrição e/ou status de uma tarefa existente.
Excluir (Delete): Remover uma tarefa do sistema.

⚙️ ## Tecnologias Utilizadas

### Backend (Serviço Web):

* Google Apps Script (JavaScript): Ambiente de desenvolvimento baseado em nuvem do Google que permite criar scripts para interagir com os serviços Google. Funciona como o servidor da API RESTful.

* Google Sheets: Utilizado como o banco de dados para armazenar as tarefas.

###Frontend (Cliente):

* HTML5: Estrutura da página web.

* CSS3: Estilização e layout da interface de usuário.

* JavaScript (ES6+): Lógica para interagir com a API do Google Apps Script (requisições fetch), manipular o DOM e tornar a interface interativa.

📁 ## Estrutura do Projeto
O projeto está organizado da seguinte forma:

Trabalho2/
├── client/                     # Contém todos os arquivos do frontend
│   ├── index.html              # Página principal da aplicação
│   ├── style.css               # Estilos CSS
│   ├── script.js               # Lógica JavaScript do cliente
│   └── .nojekyll               # Arquivo para desativar o Jekyll no GitHub Pages
└── GoogleAppsScript/           # Código do Google Apps Script (não é uma pasta física no repositório local)
    └── GoogleApi.js            # Arquivo de código .gs (equivalente ao app.py/backend)

Observação: O arquivo GoogleApi.js é o código que você deve colar no editor de script do Google Apps Script. Ele não é uma pasta física em um repositório local, mas sim um arquivo de código implantado na nuvem do Google.

📦 ## Como Rodar o Projeto
Siga os passos abaixo para configurar e executar o projeto.

## Pré-requisitos

Uma conta Google (para Google Sheets e Google Apps Script).

Um navegador web moderno.

## 1. Configurar o Backend (Google Sheets e Google Apps Script)
   
   
### a. Criar a Planilha Google (Banco de Dados)

Acesse Google Sheets.

Crie uma nova planilha em branco.

Renomeie a aba (aba inferior) para Tarefas.

Na primeira linha (cabeçalho) da aba Tarefas, insira os seguintes títulos de coluna: ID, Titulo, Descricao, Status, Data

Copie o ID da sua planilha da URL. Ele é a parte entre /d/ e /edit: https://docs.google.com/spreadsheets/d/SEU_ID_DA_PLANILHA/edit Guarde este ID, você precisará dele no próximo passo.

### b. Implantar o Google Apps Script (Serviço Web)
Com a planilha aberta, vá em Extensões > Apps Script. Isso abrirá o editor do Google Apps Script.

No editor, renomeie o arquivo de código existente (geralmente Código.gs) para GoogleApi.js ou algo similar.

Substitua todo o conteúdo desse arquivo pelo código GoogleApi.js completo que você possui.

Atualize o SPREADSHEET_ID no topo do seu arquivo GoogleApi.js com o ID da planilha que você copiou no passo 1.a.5.
JavaScript

const SPREADSHEET_ID = "SEU_ID_DA_PLANILHA_AQUI";

Salve o projeto (ícone do disquete ou Ctrl + S).

Implante o projeto como um Aplicativo da Web:

Clique em Implantar > Nova implantação.

Clique no botão Tipo (ao lado da engrenagem) e selecione Aplicativo da Web.

### Configure:

Descrição da implantação: (Opcional, ex: "API Gerenciador de Tarefas")

Executar como: Eu (seu e-mail)

Quem tem acesso: Qualquer pessoa (isso permite que o frontend se conecte sem autenticação)
Clique em Implantar.

A primeira vez, o Google pode pedir permissão. Conceda as permissões necessárias (revendo seu e-mail, etc.).

Após a implantação, você receberá uma URL do Aplicativo da Web. Copie esta URL. Ela será o seu API_URL.

2. Configurar o Frontend (Aplicação Cliente)
   
Abra o arquivo client/script.js em seu editor de código.

No início do arquivo, localize a linha const API_URL = "...";.

Substitua a URL existente pela URL do Aplicativo da Web que você copiou no passo 1.b.6.
JavaScript

const API_URL = "SUA_URL_DO_APPS_SCRIPT_AQUI/exec";
Salve o arquivo client/script.js.

1. Acessar a Aplicação

Localmente: Abra o arquivo Trabalho2/client/index.html diretamente no seu navegador.

Via GitHub Pages: Se você já configurou o GitHub Pages para este repositório (servindo da branch main e da pasta /client), acesse a URL da sua página (ex: https://SEU_USUARIO.github.io/SEU_REPOSITORIO/).

A aplicação cliente agora se comunicará com o seu serviço web do Google Apps Script, gerenciando as tarefas na sua planilha do Google Sheets.

🚀 ## Implantação no GitHub Pages


O frontend desta aplicação está configurado para ser implantado facilmente utilizando o GitHub Pages.

Certifique-se de que a estrutura do seu projeto segue o padrão client/ para o frontend.
Adicione um arquivo vazio chamado .nojekyll dentro da pasta client/ para desativar o processamento do Jekyll.

Vá para as configurações do seu repositório no GitHub.

Na seção "Pages", configure o "Source" para Deploy from a branch, selecione a main (ou master) e a pasta /client.

Clique em "Save".

Sua aplicação frontend estará acessível em https://SEU_USUARIO.github.io/SEU_REPOSITORIO/.

🤝 ## Contribuição
Sinta-se à vontade para abrir issues ou pull requests caso encontre bugs ou queira propor melhorias.

📄 ## Licença
Este projeto está licenciado sob a licença MIT - veja o arquivo LICENSE.md para mais detalhes. (Se você não tiver um arquivo LICENSE.md, pode remover esta seção ou criá-lo).