// A URL do seu Web App. ESTA É A URL CORRETA E VERIFICADA!
const WEB_APP_URL =
  "const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbyQ4OSOb6qv_jfD1gyrb_48UIGEjxds8WVAbY_Hcl-dI5IZ57DghVUOJ5LP92SakOOw/exec";

// Elementos do DOM
const messageContainer = document.getElementById("messageContainer");
const newTaskOption = document.getElementById("newTaskOption");
const createShoppingListOption = document.getElementById(
  "createShoppingListOption"
);
const addTaskFormContent = document.getElementById("addTaskFormContent");
const shoppingListContainer = document.getElementById("shoppingListContainer");
const shoppingListCheckboxes = document.getElementById(
  "shoppingListCheckboxes"
);
const taskTitleInput = document.getElementById("taskTitle");
const taskDescriptionTextarea = document.getElementById("taskDescription");
const taskStatusSelect = document.getElementById("taskStatus");
const addTaskBtn = document.getElementById("addTaskBtn");
const tasksContainer = document.getElementById("tasksContainer");

// Elementos do formulário de atualização
const updateForm = document.getElementById("updateForm");
const updateTaskId = document.getElementById("updateTaskId");
const updateTituloInput = document.getElementById("updateTitulo");
const updateDescricaoTextarea = document.getElementById("updateDescricao");
const updateStatusSelect = document.getElementById("updateStatus");
const saveUpdateBtn = document.getElementById("saveUpdateBtn"); // Adicionado ID do botão salvar
const cancelUpdateBtn = document.getElementById("cancelUpdate");

// Lista de itens de compras pré-definidos
const shoppingItems = [
  "Leite",
  "Pão",
  "Ovos",
  "Manteiga",
  "Café",
  "Açúcar",
  "Arroz",
  "Feijão",
  "Macarrão",
  "Carne",
  "Frango",
  "Peixe",
  "Verduras",
  "Frutas",
  "Detergente",
  "Sabão em pó",
  "Papel higiênico",
];

// --- Funções Auxiliares ---

/**
 * Exibe uma mensagem na tela.
 * @param {string} msg A mensagem a ser exibida.
 * @param {'success'|'error'} type O tipo da mensagem (para estilização).
 */
function showMessage(msg, type) {
  messageContainer.textContent = msg;
  messageContainer.className = `message ${type}`;
  messageContainer.style.display = "block";
  setTimeout(() => {
    messageContainer.style.display = "none";
  }, 3000);
}

/**
 * Faz uma requisição à API do Google Apps Script.
 * @param {string} action A ação do CRUD (read, create, update, delete).
 * @param {Object} [data={}] Os dados a serem enviados (para create/update).
 * @param {string} [id=null] O ID da tarefa (para read por ID, update, delete).
 * @returns {Promise<Object>} A resposta JSON da API.
 */
async function callApi(action, data = {}, id = null) {
  let url = new URL(WEB_APP_URL);
  let options = {};

  // Todas as requisições terão um parâmetro 'action' na query string
  url.searchParams.append("action", action);

  if (action === "read") {
    options.method = "GET";
    if (id) {
      url.searchParams.append("id", id); // Se lendo ID específico
    }
  } else if (action === "create") {
    options.method = "POST";
    options.headers = { "Content-Type": "application/json" };
    options.body = JSON.stringify(data); // Dados para nova tarefa
  } else if (action === "update") {
    options.method = "POST"; // Apps Script usa POST para update
    url.searchParams.append("id", id); // ID na query string para update
    options.headers = { "Content-Type": "application/json" };
    options.body = JSON.stringify(data); // Dados para atualizar
  } else if (action === "delete") {
    options.method = "POST"; // Apps Script usa POST para delete
    url.searchParams.append("id", id); // ID na query string para delete
    // Não há corpo para DELETE
  }

  try {
    const response = await fetch(url.toString(), options);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Erro na requisição da API:", error);
    throw error; // Rejeita a promise para ser capturada externamente
  }
}

// --- Funções de Renderização e Lógica do UI ---

/**
 * Renderiza a lista de tarefas na UI.
 * @param {Array} tasks Array de objetos de tarefas.
 */
function renderTasks(tasks) {
  tasksContainer.innerHTML = "";
  if (tasks.length === 0) {
    tasksContainer.innerHTML = "<li>Nenhuma tarefa cadastrada.</li>";
    return;
  }

  tasks.forEach((task) => {
    const li = document.createElement("li");
    // Ajustado para 'ID' (maiúsculo) conforme a API retorna
    li.dataset.id = task.ID;
    // Adiciona classe de status para estilização CSS
    li.classList.add(`status-${task.status.toLowerCase().replace(/\s/g, "-")}`);

    li.innerHTML = `
            <span class="task-title">${task.titulo}</span>
            ${
              task.descricao
                ? `<p class="task-description">${task.descricao}</p>`
                : ""
            }
            <div class="task-actions">
                <span class="task-status">${task.status}</span>
                <select class="status-selector">
                    <option value="Pendente" ${
                      task.status === "Pendente" ? "selected" : ""
                    }>Pendente</option>
                    <option value="Em Progresso" ${
                      task.status === "Em Progresso" ? "selected" : ""
                    }>Em Progresso</option>
                    <option value="Concluído" ${
                      task.status === "Concluído" ? "selected" : ""
                    }>Concluído</option>
                </select>
                <button class="update-status-btn">Atualizar Status</button>
                <button class="edit-btn" data-id="${task.ID}">Editar</button>
                <button class="delete-btn" data-id="${task.ID}">Excluir</button>
            </div>
        `;
    tasksContainer.appendChild(li);
  });
}

/**
 * Busca todas as tarefas da API e as renderiza.
 */
async function fetchAndRenderTasks() {
  tasksContainer.innerHTML = "<li>Carregando tarefas...</li>";
  try {
    // Ação 'read' para buscar todas as tarefas
    const result = await callApi("read");
    // Verifica 'status' e 'data' conforme a resposta da API
    if (result.status === "success" && result.data) {
      renderTasks(result.data); // result.data contém o array de tarefas
    } else {
      showMessage(
        `Erro ao carregar tarefas: ${result.message || "Erro desconhecido"}`,
        "error"
      );
      tasksContainer.innerHTML =
        "<li>Erro ao carregar tarefas. Tente novamente.</li>";
    }
  } catch (error) {
    showMessage("Erro de conexão ao carregar tarefas.", "error");
    tasksContainer.innerHTML = "<li>Erro de conexão ao carregar tarefas.</li>";
  }
}

/**
 * Gera os checkboxes para a lista de compras.
 */
function generateShoppingCheckboxes() {
  shoppingListCheckboxes.innerHTML = "";
  shoppingItems.forEach((item, index) => {
    const label = document.createElement("label");
    label.innerHTML = `
            <input type="checkbox" id="item${index}" value="${item}">
            ${item}
        `;
    shoppingListCheckboxes.appendChild(label);
  });
}

// --- Event Listeners ---

// Alternar entre formulário de nova tarefa e lista de compras
document.querySelectorAll('input[name="taskType"]').forEach((radio) => {
  radio.addEventListener("change", (event) => {
    if (event.target.value === "newTask") {
      addTaskFormContent.style.display = "block";
      shoppingListContainer.style.display = "none";
      taskTitleInput.required = true; // Torna o título obrigatório para nova tarefa
    } else if (event.target.value === "shoppingList") {
      addTaskFormContent.style.display = "none";
      shoppingListContainer.style.display = "block";
      taskTitleInput.required = false; // Título não é obrigatório para lista de compras
      generateShoppingCheckboxes(); // Gera os checkboxes quando selecionado
    }
  });
});

// Adicionar Tarefa (botão principal)
addTaskBtn.addEventListener("click", async () => {
  let title, description, status;

  if (newTaskOption.checked) {
    // Opção "Digitar Nova Tarefa"
    title = taskTitleInput.value.trim();
    description = taskDescriptionTextarea.value.trim();
    status = taskStatusSelect.value;

    if (!title) {
      showMessage("O título da tarefa é obrigatório.", "error");
      return;
    }
  } else if (createShoppingListOption.checked) {
    // Opção "Criar Lista de Compras"
    const selectedItems = Array.from(
      shoppingListCheckboxes.querySelectorAll('input[type="checkbox"]:checked')
    ).map((checkbox) => checkbox.value);

    if (selectedItems.length === 0) {
      showMessage(
        "Selecione pelo menos um item para a lista de compras.",
        "error"
      );
      return;
    }

    title = "Lista de Compras";
    description = "Itens: " + selectedItems.join(", ");
    status = taskStatusSelect.value;
  }

  try {
    // Ação 'create' para criar uma nova tarefa
    const result = await callApi("create", {
      titulo: title,
      descricao: description,
      status: status,
    });

    // Verifica 'status' conforme a resposta da API
    if (result.status === "success") {
      showMessage("Tarefa criada com sucesso!", "success"); // Mensagem fixa de sucesso
      // Limpa os campos após a criação
      taskTitleInput.value = "";
      taskDescriptionTextarea.value = "";
      Array.from(
        shoppingListCheckboxes.querySelectorAll(
          'input[type="checkbox"]:checked'
        )
      ).forEach((checkbox) => (checkbox.checked = false)); // Desmarca itens da lista de compras
      taskStatusSelect.value = "Pendente";
      fetchAndRenderTasks(); // Atualiza a lista
    } else {
      showMessage(
        `Erro ao criar tarefa: ${result.message || "Erro desconhecido"}`,
        "error"
      );
    }
  } catch (error) {
    showMessage("Erro de conexão ao criar tarefa.", "error");
  }
});

// Event listener para botões de Editar, Excluir e Atualizar Status na lista de tarefas
tasksContainer.addEventListener("click", async (event) => {
  const target = event.target;
  // Pega o ID do dataset do li pai ou do próprio botão
  const taskId = target.closest("li")?.dataset.id || target.dataset.id;

  if (!taskId) return; // Garante que clicou em um botão com data-id ou em um li com data-id

  if (target.classList.contains("edit-btn")) {
    // Lógica para preencher e exibir o formulário de atualização
    try {
      // Ação 'read' para obter a tarefa específica
      const result = await callApi("read", {}, taskId);
      // Verifica 'status' e 'data' conforme a resposta da API
      if (result.status === "success" && result.data) {
        const task = result.data; // result.data contém o objeto da tarefa
        updateTaskId.value = task.ID; // Usar task.ID
        updateTituloInput.value = task.titulo;
        updateDescricaoTextarea.value = task.descricao || "";
        updateStatusSelect.value = task.status;
        updateForm.style.display = "block"; // Mostra o formulário de atualização
        window.scrollTo(0, document.body.scrollHeight); // Rola para o formulário
      } else {
        showMessage("Tarefa não encontrada para edição.", "error");
      }
    } catch (error) {
      showMessage("Erro ao carregar tarefa para edição.", "error");
    }
  } else if (target.classList.contains("delete-btn")) {
    if (confirm(`Tem certeza que deseja excluir a tarefa com ID ${taskId}?`)) {
      try {
        // Ação 'delete' para excluir a tarefa
        const result = await callApi("delete", {}, taskId);
        // Verifica 'status' conforme a resposta da API
        if (result.status === "success") {
          showMessage("Tarefa excluída com sucesso!", "success"); // Mensagem fixa de sucesso
          fetchAndRenderTasks(); // Atualiza a lista
        } else {
          showMessage(
            `Erro ao excluir tarefa: ${result.message || "Erro desconhecido"}`,
            "error"
          );
        }
      } catch (error) {
        showMessage("Erro de conexão ao excluir tarefa.", "error");
      }
    }
  } else if (target.classList.contains("update-status-btn")) {
    const li = target.closest("li");
    const currentTaskId = li.dataset.id;
    const newStatus = li.querySelector(".status-selector").value;

    try {
      // Ação 'update' para atualizar apenas o status
      const result = await callApi(
        "update",
        { status: newStatus },
        currentTaskId
      );
      if (result.status === "success") {
        showMessage("Status da tarefa atualizado com sucesso!", "success");
        fetchAndRenderTasks();
      } else {
        showMessage(
          `Erro ao atualizar status: ${result.message || "Erro desconhecido"}`,
          "error"
        );
      }
    } catch (error) {
      showMessage("Erro de conexão ao atualizar status.", "error");
    }
  }
});

// Salvar Alterações (do formulário de atualização)
saveUpdateBtn.addEventListener("click", async (event) => {
  // Alterado para o novo ID
  event.preventDefault(); // Previne o comportamento padrão do formulário
  const id = updateTaskId.value;
  const titulo = updateTituloInput.value.trim();
  const descricao = updateDescricaoTextarea.value.trim();
  const status = updateStatusSelect.value;

  if (!titulo) {
    showMessage("O título da tarefa é obrigatório para atualização.", "error");
    return;
  }

  try {
    // Ação 'update' para atualizar a tarefa completa
    const result = await callApi("update", { titulo, descricao, status }, id);
    // Verifica 'status' conforme a resposta da API
    if (result.status === "success") {
      showMessage("Tarefa atualizada com sucesso!", "success"); // Mensagem fixa de sucesso
      updateForm.reset();
      updateForm.style.display = "none"; // Esconde o formulário
      fetchAndRenderTasks(); // Atualiza a lista
    } else {
      showMessage(
        `Erro ao atualizar tarefa: ${result.message || "Erro desconhecido"}`,
        "error"
      );
    }
  } catch (error) {
    showMessage("Erro de conexão ao atualizar tarefa.", "error");
  }
});

// Cancelar atualização
cancelUpdateBtn.addEventListener("click", () => {
  updateForm.style.display = "none";
  updateForm.reset();
});

// --- Inicialização ---
document.addEventListener("DOMContentLoaded", () => {
  fetchAndRenderTasks(); // Carrega as tarefas ao carregar a página
  generateShoppingCheckboxes(); // Gera os checkboxes iniciais (estarão ocultos)
  // Garante que o estado inicial do formulário está correto
  if (newTaskOption.checked) {
    addTaskFormContent.style.display = "block";
    shoppingListContainer.style.display = "none";
    taskTitleInput.required = true;
  }
});
