// Mapeamento de status: do formato interno (DB) para o formato de exibição (UI)
const STATUS_MAP_DB_TO_UI = {
  pending: "Pendente",
  in_progress: "Em Progresso",
  completed: "Concluída",
};

// Esta variável API_URL não é utilizada para `google.script.run` e pode ser removida se não for usada para chamadas fetch/XHR diretas.
// "https://script.google.com/macros/s/AKfycbxa0l581mXMEb8gVTwy-rkCzJ7h_K35YkmBkWeRHDvJcMiBo-f5BFLCGf5SFPCyJk7P/exec";

// Elementos do DOM
const messageContainer = document.getElementById("messageContainer");
const newTaskOption = document.getElementById("newTaskOption");
const createShoppingListOption = document.getElementById(
  "createShoppingListOption"
);

const taskForm = document.getElementById("task-form");
const addTaskFormContent = document.getElementById("addTaskFormContent");

const taskTitleInput = document.getElementById("task-title");
const taskDescriptionTextarea = document.getElementById("task-description");
const taskStatusSelect = document.getElementById("task-status");
const addTaskBtn = document.getElementById("addTaskBtn");

const taskList = document.getElementById("task-list");

const shoppingListContainer = document.getElementById("shoppingListContainer");
const shoppingListCheckboxes = document.getElementById(
  "shoppingListCheckboxes"
);

const updateForm = document.getElementById("updateForm");
const updateTaskIdInput = document.getElementById("updateTaskId");
const updateTitleInput = document.getElementById("updateTitle");
const updateDescriptionTextarea = document.getElementById("updateDescription");
const updateStatusSelect = document.getElementById("updateStatus");
const saveUpdateBtn = document.getElementById("saveUpdateBtn");
const cancelUpdateBtn = document.getElementById("cancelUpdate");

// Itens padrão para a lista de compras
const defaultShoppingItems = [
  "Leite",
  "Pão",
  "Ovos",
  "Queijo",
  "Presunto",
  "Café",
  "Açúcar",
  "Arroz",
  "Feijão",
  "Macarrão",
  "Óleo",
  "Sal",
  "Frutas (variadas)",
  "Verduras (folhas)",
  "Tomate",
  "Cebola",
  "Alho",
  "Carne (frango/bovina)",
  "Peixe",
  "Refrigerante",
  "Água mineral",
  "Sabonete",
  "Shampoo",
  "Condicionador",
  "Creme dental",
  "Papel higiênico",
  "Detergente",
  "Água sanitária",
  "Sabão em pó",
  "Amaciante",
  "Esponja de louça",
  "Saco de lixo",
];

// Função para exibir mensagens
function showMessage(msg, type) {
  messageContainer.textContent = msg;
  messageContainer.className = `message ${type}`;
  messageContainer.style.display = "block";
  setTimeout(() => {
    messageContainer.style.display = "none";
  }, 5000);
}

// --- Funções de Interação com o Servidor (Apps Script) ---

/**
 * Busca todas as tarefas do servidor (Planilha Google) e as renderiza na UI.
 */
async function fetchAndRenderTasks() {
  taskList.innerHTML = "<li>Carregando tarefas...</li>"; // Mensagem de carregamento
  try {
    // Chama a função 'fetchTasks' no Code.gs
    await google.script.run
      .withSuccessHandler(renderTasks) // Função de sucesso: renderiza as tarefas
      .withFailureHandler(function (error) {
        // Função de falha: exibe erro
        console.error("Erro ao buscar tarefas:", error);
        showMessage(`Erro ao carregar tarefas: ${error.message}`, "error");
        taskList.innerHTML = "<li>Erro ao carregar tarefas.</li>";
      })
      .fetchTasks(); // Executa a função do lado do servidor
  } catch (error) {
    showMessage("Erro de conexão ao carregar tarefas.", "error");
    taskList.innerHTML = "<li>Erro de conexão ao carregar tarefas.</li>";
    console.error("Erro ao chamar fetchTasks:", error);
  }
}

/**
 * Adiciona uma nova tarefa ao servidor (Planilha Google).
 * @param {object} taskData Objeto com os dados da tarefa (title, description, status - em UI/português).
 */
async function addTaskToSheet(taskData) {
  try {
    // Chama a função 'addTask' no Code.gs
    await google.script.run
      .withSuccessHandler(function (data) {
        console.log("Tarefa adicionada com sucesso:", data);
        showMessage("Tarefa adicionada com sucesso!", "success");
        taskTitleInput.value = ""; // Limpa os campos
        taskDescriptionTextarea.value = "";
        taskStatusSelect.value = "Pendente"; // Volta para o status padrão
        if (createShoppingListOption.checked) {
          generateShoppingCheckboxes();
        }
        fetchAndRenderTasks(); // Recarrega a lista de tarefas
      })
      .withFailureHandler(function (error) {
        console.error("Erro ao adicionar tarefa:", error);
        showMessage(`Erro ao adicionar tarefa: ${error.message}`, "error");
      })
      .addTask(taskData);
  } catch (error) {
    showMessage("Erro de conexão ao adicionar tarefa.", "error");
    console.error("Erro ao chamar addTask:", error);
  }
}

/**
 * Atualiza uma tarefa existente no servidor (Planilha Google).
 * @param {string} taskId O ID da tarefa a ser atualizada.
 * @param {object} updatedData Os dados atualizados da tarefa (title, description, status - em UI/português).
 */
async function updateTaskInSheet(taskId, updatedData) {
  try {
    // Chama a função 'updateTask' no Code.gs
    await google.script.run
      .withSuccessHandler(function (data) {
        console.log("Tarefa atualizada com sucesso:", data);
        showMessage("Tarefa atualizada com sucesso!", "success");
        updateForm.reset(); // Limpa e oculta o formulário de atualização
        updateForm.style.display = "none";
        fetchAndRenderTasks(); // Recarrega a lista de tarefas
      })
      .withFailureHandler(function (error) {
        console.error("Erro ao atualizar tarefa:", error);
        showMessage(`Erro ao atualizar tarefa: ${error.message}`, "error");
      })
      .updateTask(taskId, updatedData);
  } catch (error) {
    showMessage("Erro de conexão ao atualizar tarefa.", "error");
    console.error("Erro ao chamar updateTask:", error);
  }
}

/**
 * Exclui uma tarefa do servidor (Planilha Google).
 * @param {string} taskId O ID da tarefa a ser excluída.
 */
async function deleteTaskFromSheet(taskId) {
  try {
    if (confirm(`Tem certeza que deseja excluir a tarefa?`)) {
      // Confirmação antes de excluir
      // Chama a função 'deleteTask' no Code.gs
      await google.script.run
        .withSuccessHandler(function () {
          // A função não retorna dados, apenas sucesso/falha
          console.log("Tarefa excluída.");
          showMessage("Tarefa excluída com sucesso!", "success");
          fetchAndRenderTasks(); // Recarrega a lista de tarefas
        })
        .withFailureHandler(function (error) {
          console.error("Erro ao excluir tarefa:", error);
          showMessage(`Erro ao excluir tarefa: ${error.message}`, "error");
        })
        .deleteTask(taskId);
    }
  } catch (error) {
    showMessage("Erro de conexão ao excluir tarefa.", "error");
    console.error("Erro ao chamar deleteTask:", error);
  }
}

// --- Funções de Renderização e Lógica do UI ---

/**
 * Renderiza a lista de tarefas na interface do usuário.
 * @param {Array<object>} tasks Um array de objetos de tarefa (com status em UI/português).
 */
function renderTasks(tasks) {
  taskList.innerHTML = "";
  if (tasks.length === 0) {
    taskList.innerHTML = "<li>Nenhuma tarefa cadastrada.</li>";
    return;
  }

  tasks.forEach((task) => {
    const li = document.createElement("li");
    li.dataset.id = task.id;

    const statusClassKey = Object.keys(STATUS_MAP_DB_TO_UI).find(
      (key) => STATUS_MAP_DB_TO_UI[key] === task.status
    );
    li.classList.add(`status-${statusClassKey || "unknown"}`);

    li.innerHTML = `
      <span class="task-title">${task.title}</span>
      ${
        task.description
          ? `<p class="task-description">${task.description}</p>`
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
          <option value="Concluída" ${
            task.status === "Concluída" ? "selected" : ""
          }>Concluída</option>
        </select>
        <button class="update-status-btn primary-button">Atualizar Status</button>
        <button class="edit-btn edit-button">Editar</button>
        <button class="delete-btn delete-button">Excluir</button>
      </div>
    `;
    taskList.appendChild(li);
  });
}

// Gera os checkboxes da lista de compras
function generateShoppingCheckboxes() {
  shoppingListCheckboxes.innerHTML = "";
  defaultShoppingItems.forEach((item, index) => {
    const label = document.createElement("label");
    label.innerHTML = `
      <input type="checkbox" id="item${index}" value="${item}">
      ${item}
    `;
    shoppingListCheckboxes.appendChild(label);
  });
}

// Envio do formulário de nova tarefa
taskForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const title = taskTitleInput.value.trim();
  const statusUI = taskStatusSelect.value;
  let description = taskDescriptionTextarea.value.trim();

  if (!title) {
    showMessage("O título da tarefa é obrigatório.", "error");
    return;
  }

  if (createShoppingListOption.checked) {
    const selectedItems = Array.from(
      shoppingListCheckboxes.querySelectorAll('input[type="checkbox"]:checked')
    ).map((checkbox) => `- ${checkbox.value}`);
    description = selectedItems.join("\n");

    if (selectedItems.length === 0) {
      showMessage(
        "Selecione pelo menos um item para a lista de compras.",
        "error"
      );
      return;
    }

    taskTitleInput.value = "Lista de Compras";
  }

  const taskData = {
    title: title,
    description: description,
    status: statusUI,
  };

  await addTaskToSheet(taskData);
});

// Adiciona uma nova tarefa à planilha via Apps Script
async function addTaskToSheet(taskData) {
  try {
    await google.script.run
      .withSuccessHandler((data) => {
        showMessage("Tarefa adicionada com sucesso!", "success");
        taskTitleInput.value = "";
        taskDescriptionTextarea.value = "";
        taskStatusSelect.value = "Pendente";
        if (createShoppingListOption.checked) {
          generateShoppingCheckboxes();
        }
        fetchAndRenderTasks();
      })
      .withFailureHandler((error) => {
        console.error("Erro ao adicionar tarefa:", error);
        showMessage(`Erro ao adicionar tarefa: ${error.message}`, "error");
      })
      .addTask(taskData);
  } catch (error) {
    showMessage("Erro de conexão ao adicionar tarefa.", "error");
    console.error("Erro ao chamar addTask:", error);
  }
}

// Busca todas as tarefas da planilha
async function fetchAndRenderTasks() {
  taskList.innerHTML = "<li>Carregando tarefas...</li>";
  try {
    await google.script.run
      .withSuccessHandler(renderTasks)
      .withFailureHandler((error) => {
        console.error("Erro ao buscar tarefas:", error);
        showMessage(`Erro ao carregar tarefas: ${error.message}`, "error");
        taskList.innerHTML = "<li>Erro ao carregar tarefas.</li>";
      })
      .fetchTasks();
  } catch (error) {
    showMessage("Erro de conexão ao carregar tarefas.", "error");
    taskList.innerHTML = "<li>Erro de conexão ao carregar tarefas.</li>";
    console.error("Erro ao chamar fetchTasks:", error);
  }
}

// Atualiza uma tarefa existente
async function updateTaskInSheet(taskId, updatedData) {
  try {
    await google.script.run
      .withSuccessHandler((data) => {
        showMessage("Tarefa atualizada com sucesso!", "success");
        updateForm.reset();
        updateForm.style.display = "none";
        fetchAndRenderTasks();
      })
      .withFailureHandler((error) => {
        console.error("Erro ao atualizar tarefa:", error);
        showMessage(`Erro ao atualizar tarefa: ${error.message}`, "error");
      })
      .updateTask(taskId, updatedData);
  } catch (error) {
    showMessage("Erro de conexão ao atualizar tarefa.", "error");
    console.error("Erro ao chamar updateTask:", error);
  }
}

// Exclui uma tarefa
async function deleteTaskFromSheet(taskId) {
  try {
    if (confirm("Tem certeza que deseja excluir a tarefa?")) {
      await google.script.run
        .withSuccessHandler(() => {
          showMessage("Tarefa excluída com sucesso!", "success");
          fetchAndRenderTasks();
        })
        .withFailureHandler((error) => {
          console.error("Erro ao excluir tarefa:", error);
          showMessage(`Erro ao excluir tarefa: ${error.message}`, "error");
        })
        .deleteTask(taskId);
    }
  } catch (error) {
    showMessage("Erro de conexão ao excluir tarefa.", "error");
    console.error("Erro ao chamar deleteTask:", error);
  }
}

// Event listener para botões de Editar, Excluir e Atualizar Status
taskList.addEventListener("click", async (event) => {
  const target = event.target;
  const li = target.closest("li");
  const taskId = li ? li.dataset.id : null;

  if (!taskId) return;

  if (target.classList.contains("edit-btn")) {
    try {
      await google.script.run
        .withSuccessHandler((task) => {
          updateTaskIdInput.value = task.id;
          updateTitleInput.value = task.title;
          updateDescriptionTextarea.value = task.description || "";
          updateStatusSelect.value = task.status;
          updateForm.style.display = "block";
          window.scrollTo({ top: updateForm.offsetTop, behavior: "smooth" });
        })
        .withFailureHandler((error) => {
          console.error("Erro ao buscar tarefa para edição:", error);
          showMessage(
            `Erro ao carregar tarefa para edição: ${error.message}`,
            "error"
          );
        })
        .getTaskById(taskId);
    } catch (error) {
      showMessage("Erro de conexão ao carregar tarefa para edição.", "error");
      console.error("Erro ao carregar tarefa para edição:", error);
    }
  } else if (target.classList.contains("delete-btn")) {
    await deleteTaskFromSheet(taskId);
  } else if (target.classList.contains("update-status-btn")) {
    const newStatusUI = li.querySelector(".status-selector").value;
    await updateTaskInSheet(taskId, { status: newStatusUI });
  }
});

// Envio do formulário de atualização
updateForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const id = updateTaskIdInput.value;
  const title = updateTitleInput.value.trim();
  const description = updateDescriptionTextarea.value.trim();
  const statusUI = updateStatusSelect.value;

  if (!title) {
    showMessage("O título da tarefa é obrigatório para atualização.", "error");
    return;
  }

  const updatedData = {
    title: title,
    description: description,
    status: statusUI,
  };

  await updateTaskInSheet(id, updatedData);
});

// Cancelar atualização
cancelUpdateBtn.addEventListener("click", () => {
  updateForm.reset();
  updateForm.style.display = "none";
});

// Alternar entre tarefa e lista de compras
newTaskOption.addEventListener("change", () => {
  if (newTaskOption.checked) {
    addTaskFormContent.style.display = "block";
    shoppingListContainer.style.display = "none";
    taskDescriptionTextarea.placeholder = "Descrição (opcional)";
    taskTitleInput.value = "";
    taskDescriptionTextarea.value = "";
  }
});

createShoppingListOption.addEventListener("change", () => {
  if (createShoppingListOption.checked) {
    addTaskFormContent.style.display = "block";
    shoppingListContainer.style.display = "block";
    generateShoppingCheckboxes();
    taskTitleInput.value = "Lista de Compras";
    taskDescriptionTextarea.value = "";
    taskDescriptionTextarea.placeholder =
      "Itens selecionados aparecerão aqui...";
  }
});

// Inicialização ao carregar a página
document.addEventListener("DOMContentLoaded", () => {
  fetchAndRenderTasks();
  generateShoppingCheckboxes();
  newTaskOption.checked = true;
  addTaskFormContent.style.display = "block";
  shoppingListContainer.style.display = "none";
});

// Removido o bloco final de verificação e carregamento condicional do google.script.run,
// pois o script.js é carregado no momento certo, e google.script.run já deve estar disponível.