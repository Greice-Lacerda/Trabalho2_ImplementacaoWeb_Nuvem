# Serviço Web CRUD de Tarefas (Python Flask + SQLite)

Este projeto implementa um serviço web RESTful para gerenciamento de tarefas (To-Do List) utilizando Python com o framework Flask para o backend e SQLite como banco de dados. O cliente é uma aplicação web interativa desenvolvida com HTML, CSS e JavaScript, que consome a API RESTful.

## 📅 Data de Entrega

5 de Junho

## 🚀 Funcionalidades

O sistema permite realizar as quatro operações básicas de um CRUD (Create, Read, Update, Delete) em tarefas:

* **Criar (Create):** Adicionar uma nova tarefa com título, descrição e status.
* **Listar (Read All):** Visualizar todas as tarefas existentes.
* **Consultar (Read One):** Obter detalhes de uma tarefa específica por seu ID.
* **Atualizar (Update):** Modificar o título, descrição e/ou status de uma tarefa existente.
* **Excluir (Delete):** Remover uma tarefa do sistema.

## ⚙️ Tecnologias Utilizadas

**Backend (Servidor):**

* **Python:** Linguagem de programação principal.
* **Flask:** Microframework web para construção da API RESTful.
* **Flask-CORS:** Extensão para lidar com a política de Compartilhamento de Recursos de Origem Cruzada (CORS), permitindo que o cliente web (hospedado em outra origem, como GitHub Pages) se comunique com o servidor.
* **SQLite:** Banco de dados relacional leve e embutido, ideal para este tipo de aplicação.

**Frontend (Cliente):**

* **HTML5:** Estrutura da página web.
* **CSS3:** Estilização e layout da interface de usuário.
* **JavaScript (ES6+):** Lógica para interagir com a API RESTful (requisições `fetch`), manipular o DOM e tornar a interface interativa.

## 📁 Estrutura do Projeto

O projeto está organizado da seguinte forma:
Trabalho2/
├── client/           # Contém todos os arquivos do frontend
│   ├── index.html    # Página principal da aplicação
│   ├── style.css     # Estilos CSS
│   ├── script.js     # Lógica JavaScript do cliente
│   └── .nojekyll     # Arquivo para desativar o Jekyll no GitHub Pages
└── server/           # Contém todos os arquivos do backend Flask
├── app.py        # Aplicação Flask (API RESTful)
├── requirements.txt # Dependências do Python
├── schema.sql    # Script SQL para criação da tabela de tarefas
└── tasks.db      # Banco de dados SQLite (gerado automaticamente)

## 📦 Como Rodar o Projeto

Siga os passos abaixo para configurar e executar o projeto localmente.

### Pré-requisitos

* Python 3.x
* pip (gerenciador de pacotes do Python)

### 1. Clonar o Repositório

```bash
git clone [https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git](https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git)
cd SEU_REPOSITORIO/Trabalho2
2. Configurar e Iniciar o Backend (Servidor Flask)
Navegue até a pasta server e instale as dependências:

Bash

cd server
pip install -r requirements.txt
Após instalar as dependências, inicie o servidor Flask:

Bash

python app.py
O servidor deverá iniciar e estar acessível em http://127.0.0.1:5000. Você verá uma mensagem no terminal indicando que o servidor está rodando.

3. Acessar o Frontend (Aplicação Cliente)
O frontend é um conjunto de arquivos estáticos (HTML, CSS, JavaScript). Você pode acessá-lo de duas maneiras:

Localmente: Abra o arquivo Trabalho2/client/index.html diretamente no seu navegador.
Via GitHub Pages: Se você já configurou o GitHub Pages para este repositório (servindo da branch main e da pasta /client), acesse a URL da sua página (ex: https://SEU_USUARIO.github.io/SEU_REPOSITORIO/).
Importante: Para que a aplicação funcione corretamente, o servidor Flask (backend) deve estar rodando em segundo plano ao tentar acessar o frontend, pois é ele quem fornece os dados das tarefas.

🚀 Implantação no GitHub Pages
O frontend desta aplicação está configurado para ser implantado facilmente utilizando o GitHub Pages.

Certifique-se de que a estrutura do seu projeto segue o padrão client/ para o frontend.
Adicione um arquivo vazio chamado .nojekyll dentro da pasta client/ para desativar o processamento do Jekyll.
Vá para as configurações do seu repositório no GitHub.
Na seção "Pages", configure o "Source" para Deploy from a branch, selecione a main (ou master) e a pasta /client.
Clique em "Save".
Sua aplicação frontend estará acessível em https://SEU_USUARIO.github.io/SEU_REPOSITORIO/.

🤝 Contribuição
Sinta-se à vontade para abrir issues ou pull requests caso encontre bugs ou queira propor melhorias.

📄 Licença
Este projeto está licenciado sob a licença MIT - veja o arquivo LICENSE.md para mais detalhes. (Se você não tiver um arquivo LICENSE.md, pode remover esta seção ou criá-lo).
