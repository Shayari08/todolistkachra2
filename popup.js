document.addEventListener('DOMContentLoaded', function () {
    const taskList = document.getElementById('task-list');
    const newTaskInput = document.getElementById('new-task');
    const hiddenButton = document.getElementById('hiddenButton');
    const archiveButton = document.getElementById('archiveButton');
    const archiveAllButton = document.getElementById('archiveAllButton');

  
    function loadTasks() {
      chrome.storage.local.get(['tasks', 'completedTasks'], function (data) {
        const tasks = data.tasks || [];
        const completedTasks = data.completedTasks || [];
        tasks.forEach(task => {
          const div = createTaskElement(task, false);
          taskList.appendChild(div);
        });
      });
    }
  
    function saveTasks(tasks) {
      chrome.storage.local.set({ tasks });
    }
  
    function saveHiddenTasks(hiddenTasks) {
      chrome.storage.local.set({ hiddenTasks });
    }
  
    function saveArchiveTasks(archiveTasks) {
      chrome.storage.local.set({ archiveTasks });
    }
  
    function addCompletedTask(task) {
      chrome.storage.local.get(['completedTasks'], function (data) {
        const completedTasks = data.completedTasks || [];
        if (!completedTasks.includes(task)) {
          completedTasks.push(task);
          chrome.storage.local.set({ completedTasks });
        }
      });
    }
  
    function createTaskElement(task, isHidden) {
      const div = document.createElement('div');
      div.classList.add('task-item');
      div.style.position = 'relative';
  
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.addEventListener('change', function () {
        if (checkbox.checked) {
          span.style.textDecoration = 'line-through';
          span.style.opacity = '0.5';
          div.classList.add('completed');
          addCompletedTask(task);
        } else {
          span.style.textDecoration = 'none';
          span.style.opacity = '1';
          div.classList.remove('completed');
          removeCompletedTask(task);
        }
        updateTaskList();
      });
  
      const span = document.createElement('span');
      span.textContent = task;
      span.style.textAlign = 'left';
  
      div.addEventListener('dblclick', function () {
        div.remove();
        removeTask(task);
      });
  
      const hideButton = document.createElement('button');
      hideButton.className = 'move-button';
      hideButton.textContent = isHidden ? 'Unhide' : 'Hide';
      hideButton.addEventListener('click', function () {
        div.remove();
        if (checkbox.checked) {
          if (isHidden) {
            removeHiddenTask(task);
            addTaskToStorage(task);
          } else {
            removeTask(task);
            addTaskToArchive(task);
          }
        } else {
          if (isHidden) {
            removeHiddenTask(task);
            addTaskToStorage(task);
          } else {
            removeTask(task);
            addTaskToHidden(task);
          }
        }
      });
  
      const editButton = document.createElement('button');
      editButton.className = 'edit-button';
      editButton.textContent = 'Edit';
      editButton.style.position = 'absolute';
      editButton.style.right = '5px';
  
      editButton.addEventListener('click', function () {
        const newTask = prompt('Edit your task:', task);
        if (newTask !== null && newTask.trim() !== '') {
          span.textContent = newTask;
          updateTaskInStorage(task, newTask);
        }
      });
  
      const taskContent = document.createElement('div');
      taskContent.style.display = 'flex';
      taskContent.style.alignItems = 'center';
      taskContent.appendChild(checkbox);
      taskContent.appendChild(span);
      taskContent.appendChild(hideButton);
  
      div.appendChild(taskContent);
      div.appendChild(editButton);
  
      return div;
    }
  
    function updateTaskList() {
      saveTasks(getTasksFromList());
    }
  
    function getTasksFromList() {
      return Array.from(taskList.children).map(div => div.querySelector('span').textContent);
    }
    function archiveAllCompletedTasks() {
        const completedTasks = [];
        const remainingTasks = [];
      
        Array.from(taskList.children).forEach(div => {
          const checkbox = div.querySelector('input[type="checkbox"]');
          const span = div.querySelector('span');
          const task = span.textContent;
      
          if (checkbox.checked) {
            completedTasks.push(task);
            div.remove();
          } else {
            remainingTasks.push(task);
          }
        });
      
        saveTasks(remainingTasks);
        chrome.storage.local.get(['archiveTasks'], function (data) {
          const archiveTasks = data.archiveTasks || [];
          archiveTasks.push(...completedTasks);
          saveArchiveTasks(archiveTasks);
        });
      }
      
    function removeTask(task) {
      chrome.storage.local.get(['tasks'], function (data) {
        let tasks = data.tasks || [];
        tasks = tasks.filter(t => t !== task);
        saveTasks(tasks);
      });
    }
  
    function removeHiddenTask(task) {
      chrome.storage.local.get(['hiddenTasks'], function (data) {
        let hiddenTasks = data.hiddenTasks || [];
        hiddenTasks = hiddenTasks.filter(t => t !== task);
        saveHiddenTasks(hiddenTasks);
      });
    }
  
    function removeArchivedTask(task) {
      chrome.storage.local.get(['archiveTasks'], function (data) {
        let archiveTasks = data.archiveTasks || [];
        archiveTasks = archiveTasks.filter(t => t !== task);
        saveArchiveTasks(archiveTasks);
      });
    }
  
    function addTaskToHidden(task) {
      chrome.storage.local.get(['hiddenTasks'], function (data) {
        const hiddenTasks = data.hiddenTasks || [];
        hiddenTasks.push(task);
        saveHiddenTasks(hiddenTasks);
      });
    }
  
    function addTaskToArchive(task) {
      chrome.storage.local.get(['archiveTasks'], function (data) {
        const archiveTasks = data.archiveTasks || [];
        archiveTasks.push(task);
        saveArchiveTasks(archiveTasks);
      });
    }
  
    function addTaskToStorage(task) {
      chrome.storage.local.get(['tasks'], function (data) {
        const tasks = data.tasks || [];
        tasks.push(task);
        saveTasks(tasks);
      });
    }
  
    function updateTaskInStorage(oldTask, newTask) {
      chrome.storage.local.get(['tasks'], function (data) {
        const tasks = data.tasks || [];
        const index = tasks.indexOf(oldTask);
        if (index !== -1) {
          tasks[index] = newTask;
          saveTasks(tasks);
        }
      });
    }
  
    newTaskInput.addEventListener('keypress', function (event) {
      if (event.key === 'Enter') {
        const newTask = newTaskInput.value.trim();
        if (newTask !== '' && newTask !== null) {
          chrome.storage.local.get(['tasks'], function (data) {
            const tasks = data.tasks || [];
            tasks.push(newTask);
            saveTasks(tasks);
            const div = createTaskElement(newTask, false);
            taskList.appendChild(div);
          });
          newTaskInput.value = '';
        } else {
          alert('Task cannot be empty!');
        }
      }
    });
  
    hiddenButton.addEventListener('click', function () {
      window.location.href = 'hidden.html';
    });
  
    archiveButton.addEventListener('click', function () {
      window.location.href = 'archive.html';
    });

    archiveAllButton.addEventListener('click', archiveAllCompletedTasks);

  
    loadTasks();
  });
  
