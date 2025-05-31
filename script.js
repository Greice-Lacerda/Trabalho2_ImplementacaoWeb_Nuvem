const API_URL =
  "https://script.google.com/macros/s/AKfycbyjTyhky655mPaT5FMv8D8EJfhSHaFPJIkt4DNPYtq_Kmmw696LGDyoC5oleO8-0eml/exec";

// Mapeamento de status: do formato interno (DB) para o formato de exibição (UI)
const STATUS_MAP_DB_TO_UI = {
  pending: "Pendente",
  in_progress: "Em Progresso",
  completed: "Concluída",
};

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
    const response = await fetch(`${API_URL}?action=fetchTasks`);
    const tasks = await response.json();
    if (tasks.error) {
      showMessage(`Erro: ${tasks.error}`, "error");
      taskList.innerHTML = "<li>Erro ao carregar tarefas.</li>";
    } else {
      renderTasks(tasks);
    }
  } catch (error) {
    showMessage("Erro de conexão ao carregar tarefas.", "error");
    taskList.innerHTML = "<li>Erro de conexão ao carregar tarefas.</li>";
    console.error("Erro ao buscar tarefas:", error);
  }
}

/**
 * Adiciona uma nova tarefa ao servidor (Planilha Google).
 * @param {object} taskData Objeto com os dados da tarefa (title, description, status - em UI/português).
 */
async function addTaskToSheet(taskData) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({
        action: "addTask",
        taskData: taskData,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const result = await response.json();
    if (result.error) {
      showMessage(`Erro ao adicionar tarefa: ${result.error}`, "error");
    } else {
      showMessage("Tarefa adicionada com sucesso!", "success");
      taskTitleInput.value = "";
      taskDescriptionTextarea.value = "";
      taskStatusSelect.value = "Pendente";
      if (createShoppingListOption.checked) {
        generateShoppingCheckboxes();
      }
      fetchAndRenderTasks();
    }
  } catch (error) {
    showMessage("Erro de conexão ao adicionar tarefa.", "error");
    console.error("Erro ao adicionar tarefa:", error);
  }
}

/**
 * Atualiza uma tarefa existente no servidor (Planilha Google).
 * @param {string} taskId O ID da tarefa a ser atualizada.
 * @param {object} updatedData Os dados atualizados da tarefa (title, description, status - em UI/português).
 */
async function updateTaskInSheet(taskId, updatedData) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({
        action: "updateTask",
        id: taskId,
        updatedData: updatedData,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const result = await response.json();
    if (result.error) {
      showMessage(`Erro ao atualizar tarefa: ${result.error}`, "error");
    } else {
      showMessage("Tarefa atualizada com sucesso!", "success");
      updateForm.reset();
      updateForm.style.display = "none";
      fetchAndRenderTasks();
    }
  } catch (error) {
    showMessage("Erro de conexão ao atualizar tarefa.", "error");
    console.error("Erro ao atualizar tarefa:", error);
  }
}

/**
 * Exclui uma tarefa do servidor (Planilha Google).
 * @param {string} taskId O ID da tarefa a ser excluída.
 */
async function deleteTaskFromSheet(taskId) {
  try {
    if (confirm("Tem certeza que deseja excluir a tarefa?")) {
      const response = await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({
          action: "deleteTask",
          ID: taskId,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const result = await response.json();
      if (result.error) {
        showMessage(`Erro ao excluir tarefa: ${result.error}`, "error");
      } else {
        showMessage("Tarefa excluída com sucesso!", "success");
        fetchAndRenderTasks();
      }
    }
  } catch (error) {
    showMessage("Erro de conexão ao excluir tarefa.", "error");
    console.error("Erro ao excluir tarefa:", error);
  }
}

/**
 * Buscar tarefa por ID (para edição)
 * @param {string} taskId O ID da tarefa a ser buscada.
 */
async function getTaskById(taskId) {
  try {
    const response = await fetch(`${API_URL}?action=getTaskById&ID=${taskId}`);
    const task = await response.json();
    if (task.error) {
      showMessage(
        `Erro ao carregar tarefa para edição: ${task.error}`,
        "error"
      );
    } else {
      updateTaskIdInput.value = task.id;
      updateTitleInput.value = task.titulo;
      updateDescriptionTextarea.value = task.descricao || "";
      updateStatusSelect.value = task.status;
      updateForm.style.display = "block";
      window.scrollTo({ top: updateForm.offsetTop, behavior: "smooth" });
    }
  } catch (error) {
    showMessage("Erro de conexão ao carregar tarefa para edição.", "error");
    console.error("Erro ao carregar tarefa para edição:", error);
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
    titulo: title,
    descricao: description,
    status: statusUI,
  };

  await addTaskToSheet(taskData);
});

// Event listener para botões de Editar, Excluir e Atualizar Status
taskList.addEventListener("click", async (event) => {
  const target = event.target;
  const li = target.closest("li");
  const taskId = li ? li.dataset.id : null;

  if (!taskId) return;

  if (target.classList.contains("edit-btn")) {
    await getTaskById(taskId);
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
    titulo: title,
    descricao: description,
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
