const SPREADSHEET_ID = "1FPYvCbbp-V3D9-sn98ftrfreJXdnn0IYFSxmzmy6-nI"; // Seu ID de Planilha
const SHEET_NAME = "Tarefas"; // Nome da aba na planilha onde as tarefas estão
const HEADERS = ["id", "title", "description", "status"]; // <<<<<< Definição dos cabeçalhos AQUI

// Função auxiliar para obter a planilha e a aba de tarefas
function getSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  return ss.getSheetByName(SHEET_NAME);
}

// Mapeamento de status: do formato de exibição (UI) para o formato interno (DB)
const STATUS_MAP_UI_TO_DB = {
  "Pendente": "pending",
  "Em Progresso": "in_progress",
  "Concluído": "completed",
};

// Mapeamento de status: do formato interno (DB) para o formato de exibição (UI)
const STATUS_MAP_DB_TO_UI = {
  "pending": "Pendente",
  "in_progress": "Em Progresso",
  "completed": "Concluído",
};

// --- Funções de API REST (chamadas pelo frontend) ---

/**
 * Função principal para lidar com requisições GET (ex: buscar todas as tarefas).
 */
function doGet(e) {
  // Rota para buscar todas as tarefas
  if (e.parameter.action == "fetchTasks") {
    const tasks = fetchTasksInternal(); // Chama a função interna para buscar tarefas
    return ContentService.createTextOutput(JSON.stringify(tasks)).setMimeType(ContentService.MimeType.JSON);
  }
  // Rota para buscar uma tarefa por ID
  if (e.parameter.action == "getTaskById" && e.parameter.id) {
    const task = getTaskByIdInternal(e.parameter.id);
    if (task) {
      return ContentService.createTextOutput(JSON.stringify(task)).setMimeType(ContentService.MimeType.JSON);
    } else {
      // Ajuste: setStatusCode(404) para indicar que não foi encontrada
      return ContentService.createTextOutput(JSON.stringify({ error: "Tarefa não encontrada" }))
                           .setMimeType(ContentService.MimeType.JSON)
                           .setStatusCode(404);
    }
  }

  // Resposta padrão para rotas não reconhecidas
  return ContentService.createTextOutput(JSON.stringify({ message: "Método GET não suportado ou ação inválida." }))
                       .setMimeType(ContentService.MimeType.JSON)
                       .setStatusCode(400); // Bad Request
}

/**
 * Função principal para lidar com requisições POST (ex: adicionar, atualizar, excluir).
 */
function doPost(e) {
  let requestBody;
  try {
    requestBody = JSON.parse(e.postData.contents);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ error: "Corpo da requisição JSON inválido." }))
                         .setMimeType(ContentService.MimeType.JSON)
                         .setStatusCode(400); // Bad Request
  }

  const action = requestBody.action;

  try {
    if (action == "addTask") {
      const result = addTaskInternal(requestBody.taskData);
      return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
    } else if (action == "updateTask") {
      const result = updateTaskInternal(requestBody.id, requestBody.updatedData);
      return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
    } else if (action == "deleteTask") {
      const result = deleteTaskInternal(requestBody.id);
      return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
    } else {
      return ContentService.createTextOutput(JSON.stringify({ error: "Ação inválida para POST." }))
                           .setMimeType(ContentService.MimeType.JSON)
                           .setStatusCode(400); // Bad Request
    }
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ error: error.message || "Erro interno do servidor." }))
                         .setMimeType(ContentService.MimeType.JSON)
                         .setStatusCode(500); // Internal Server Error
  }
}

// --- Funções Internas de Lógica (que antes eram chamadas diretamente por google.script.run) ---

/**
 * Busca todas as tarefas da planilha.
 * Retorna um array de objetos de tarefa com status mapeado para UI (português).
 */
function doGet(e) {
  if (e.parameter.action == "fetchTasks") {
    const tasks = fetchTasksInternal(); // Busca as tarefas da planilha
    return ContentService.createTextOutput(JSON.stringify(tasks)).setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService.createTextOutput(JSON.stringify({ error: "Ação inválida." }))
                       .setMimeType(ContentService.MimeType.JSON)
                       .setStatusCode(400);
}


/**
 * Adiciona uma nova tarefa à planilha.
 * @param {object} taskData Objeto com os dados da tarefa (title, description, status - em UI/português).
 * @returns {object} A tarefa adicionada com ID.
 */
function addTaskInternal(taskData) {
  const sheet = getSheet();
  const newId = Utilities.getUuid(); // Gera um ID único
  const statusDB = STATUS_MAP_UI_TO_DB[taskData.status] || "pending"; // Mapeia para formato DB

  const newRow = [
    newId,
    taskData.title,
    taskData.description || "",
    statusDB,
  ];
  sheet.appendRow(newRow);

  const addedTask = {
    id: newId,
    title: taskData.title,
    description: taskData.description || "",
    status: taskData.status, // Retorna status em português para o frontend
  };
  return addedTask;
}

/**
 * Busca uma tarefa pelo ID.
 * @param {string} id O ID da tarefa.
 * @returns {object|null} O objeto da tarefa ou null se não for encontrada.
 */
function getTaskByIdInternal(id) {
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return null;

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === id) { // ID está na primeira coluna (índice 0)
      const task = {};
      for (let j = 0; j < HEADERS.length; j++) {
        task[HEADERS[j]] = data[i][j];
      }
      task.status = STATUS_MAP_DB_TO_UI[task.status] || task.status;
      return task;
    }
  }
  return null;
}

/**
 * Atualiza uma tarefa na planilha.
 * @param {string} taskId O ID da tarefa a ser atualizada.
 * @param {object} updatedData Os dados atualizados (title, description, status - em UI/português).
 * @returns {object|null} A tarefa atualizada ou null se não encontrada.
 */
function updateTaskInternal(taskId, updatedData) {
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return null;

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === taskId) {
      const rowToUpdate = data[i];
      let updatedStatusDB = rowToUpdate[HEADERS.indexOf("status")]; // Mantém o status atual por padrão

      if (updatedData.title !== undefined) {
        rowToUpdate[HEADERS.indexOf("title")] = updatedData.title;
      }
      if (updatedData.description !== undefined) {
        rowToUpdate[HEADERS.indexOf("description")] = updatedData.description;
      }
      if (updatedData.status !== undefined) {
        updatedStatusDB = STATUS_MAP_UI_TO_DB[updatedData.status] || updatedData.status;
        rowToUpdate[HEADERS.indexOf("status")] = updatedStatusDB;
      }

      sheet.getRange(i + 1, 1, 1, rowToUpdate.length).setValues([rowToUpdate]);

      const updatedTask = {};
      for (let j = 0; j < HEADERS.length; j++) {
        updatedTask[HEADERS[j]] = rowToUpdate[j];
      }
      updatedTask.status = STATUS_MAP_DB_TO_UI[updatedTask.status] || updatedTask.status;
      return updatedTask;
    }
  }
  return null;
}

/**
 * Exclui uma tarefa da planilha.
 * @param {string} taskId O ID da tarefa a ser excluída.
 * @returns {boolean} True se a tarefa foi excluída, false caso contrário.
 */
function deleteTaskInternal(taskId) {
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return false;

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === taskId) {
      sheet.deleteRow(i + 1); // +1 porque as linhas da planilha são 1-indexed
      return true;
    }
  }
  return false;
}

// --- Funções Auxiliares para o Editor (Opcionais) ---

// Função para criar a planilha e o cabeçalho se não existirem
function setupSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
    // Definir as cores para os status (opcional, para visualização na planilha)
    const statusColumnIndex = HEADERS.indexOf("status") + 1; // Coluna do status
    sheet.getRange(`${sheet.getName()}!C:C`).setBackgroundRGB(255, 255, 255); // Resetar tudo para branco primeiro
    // Formatação condicional para as colunas de status (para referência)
    // Regra para Pendente (vermelho claro)
    sheet.getRange(`${sheet.getName()}!C:C`).setConditionalFormatRules([
      SpreadsheetApp.newConditionalFormatRule()
        .whenTextEqualTo("pending")
        .setBackground("#FFCCCC")
        .setRanges([sheet.getRange(`${sheet.getName()}!C:C`)])
        .build(),
      // Regra para Em Progresso (amarelo claro)
      SpreadsheetApp.newConditionalFormatRule()
        .whenTextEqualTo("in_progress")
        .setBackground("#FFFFCC")
        .setRanges([sheet.getRange(`${sheet.getName()}!C:C`)])
        .build(),
      // Regra para Concluído (verde claro)
      SpreadsheetApp.newConditionalFormatRule()
        .whenTextEqualTo("completed")
        .setBackground("#CCFFCC")
        .setRanges([sheet.getRange(`${sheet.getName()}!C:C`)])
        .build(),
    ]);
  }
  Logger.log("Planilha de tarefas configurada!");
}

// Função para testar a implantação (Deploy > Testar implantações)
function testAPI() {
  Logger.log("Teste de API executado.");
  const tasks = fetchTasksInternal();
  Logger.log("Tarefas: " + JSON.stringify(tasks));

  const newTask = { title: "Tarefa Teste", description: "Descrição Teste", status: "Pendente" };
  const addedTask = addTaskInternal(newTask);
  Logger.log("Tarefa adicionada: " + JSON.stringify(addedTask));

  const updatedTask = updateTaskInternal(addedTask.id, { status: "Concluído" });
  Logger.log("Tarefa atualizada: " + JSON.stringify(updatedTask));

  const deleted = deleteTaskInternal(addedTask.id);
  Logger.log("Tarefa excluída: " + deleted);
}